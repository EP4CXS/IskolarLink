<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\StoreApplicationRequest;
use App\Http\Requests\Application\UpdateApplicationStatusRequest;
use App\Models\Scholarship;
use App\Models\ScholarshipApplication;
use App\Models\StudentApplicationHistory;
use App\Models\User;
use App\Services\ApplicationStatusService;
use App\Support\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ScholarshipApplicationController extends Controller
{
    public function __construct(
        private readonly ApplicationStatusService $statusService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ScholarshipApplication::query()->orderByDesc('submission_date');

        if ($request->user()->isStudent()) {
            $query->where('student_id', $request->user()->id);
        }

        $applications = $query->get()->map(fn ($app) => $app->toApiArray());

        return ApiResponse::success(['applications' => $applications]);
    }

    public function store(StoreApplicationRequest $request): JsonResponse
    {
        if ($request->validated('studentId') !== $request->user()->id) {
            return ApiResponse::error('Forbidden', 403);
        }

        if (! User::query()->where('id', $request->validated('studentId'))->exists()) {
            return ApiResponse::error('Student account not found. Please log in again.', 404);
        }

        $scholarship = Scholarship::query()->find($request->validated('scholarshipId'));

        if (! $scholarship) {
            return ApiResponse::error('Scholarship not found or already removed.', 404);
        }

        if ($scholarship->status !== 'Active') {
            return ApiResponse::error('This scholarship is not accepting applications.', 422);
        }

        $submission = now();
        $timeline = [[
            'id' => (string) Str::uuid(),
            'status' => 'Pending',
            'date' => $submission->toAtomString(),
            'note' => 'Application submitted successfully.',
        ]];

        try {
            $application = ScholarshipApplication::query()->create([
                'id' => (string) Str::uuid(),
                'student_id' => $request->validated('studentId'),
                'scholarship_id' => $request->validated('scholarshipId'),
                'status' => 'Pending',
                'submission_date' => $submission,
                'timeline_json' => $timeline,
                'documents_json' => $request->validated('documents'),
                'answers_json' => $request->validated('answers'),
                'grant_transactions_json' => [],
            ]);
        } catch (QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? '';
            $message = $e->getMessage();
            if ($sqlState === '23000' || str_contains($message, 'Duplicate entry')) {
                if (str_contains($message, 'uq_application_student_scholarship')) {
                    return ApiResponse::error('You already applied for this scholarship', 409);
                }

                return ApiResponse::error(
                    'Application cannot be saved because related student/scholarship record is missing.',
                    409
                );
            }
            throw $e;
        }

        return ApiResponse::success(['application' => $application->toApiArray()], 201);
    }

    public function updateStatus(UpdateApplicationStatusRequest $request): JsonResponse
    {
        $application = ScholarshipApplication::query()->findOrFail($request->validated('id'));

        try {
            $application = $this->statusService->update(
                $application,
                $request->validated('status'),
                $request->input('note'),
                $request->input('author') ?: $request->user()->name,
                $request->input('rubric'),
            );
        } catch (\RuntimeException $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? (int) $e->getCode() : 409;

            return ApiResponse::error($e->getMessage(), $code);
        }

        return ApiResponse::success(['application' => $application->toApiArray()]);
    }

    public function studentHistory(Request $request): JsonResponse
    {
        $studentId = $request->query('studentId');
        if (! is_string($studentId) || $studentId === '') {
            return ApiResponse::error('Missing studentId', 400);
        }

        if ($request->user()->isStudent() && $request->user()->id !== $studentId) {
            return ApiResponse::error('Forbidden', 403);
        }

        $history = StudentApplicationHistory::query()
            ->where('student_id', $studentId)
            ->orderByDesc('archived_at')
            ->get()
            ->map(fn ($row) => $row->toApiArray());

        return ApiResponse::success(['history' => $history]);
    }
}
