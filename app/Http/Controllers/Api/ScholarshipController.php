<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Scholarship\CloseScholarshipRequest;
use App\Http\Requests\Scholarship\StoreScholarshipRequest;
use App\Http\Requests\Scholarship\UpdateScholarshipRequest;
use App\Models\Scholarship;
use App\Models\ScholarshipHistory;
use App\Services\ScholarshipClosureService;
use App\Support\ApiResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ScholarshipController extends Controller
{
    public function __construct(
        private readonly ScholarshipClosureService $closureService,
    ) {}

    public function index(): JsonResponse
    {
        $scholarships = Scholarship::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Scholarship $s) => $s->toApiArray());

        return ApiResponse::success(['scholarships' => $scholarships]);
    }

    public function active(): JsonResponse
    {
        $scholarships = Scholarship::query()
            ->where('status', 'Active')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Scholarship $s) => $s->toApiArray());

        return ApiResponse::success(['scholarships' => $scholarships]);
    }

    public function store(StoreScholarshipRequest $request): JsonResponse
    {
        $scholarship = Scholarship::query()->create([
            'id' => (string) Str::uuid(),
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'deadline' => $request->validated('deadline'),
            'slots' => $request->validated('slots'),
            'benefits_json' => $request->input('benefits', []),
            'criteria_json' => $request->input('criteria', []),
            'status' => $request->validated('status'),
        ]);

        return ApiResponse::success(['scholarship' => $scholarship->toApiArray()], 201);
    }

    public function update(UpdateScholarshipRequest $request): JsonResponse
    {
        $scholarship = Scholarship::query()->findOrFail($request->validated('id'));

        $payload = collect($request->validated())->except('id')->all();
        if ($request->has('benefits')) {
            $payload['benefits_json'] = $request->input('benefits');
            unset($payload['benefits']);
        }
        if ($request->has('criteria')) {
            $payload['criteria_json'] = $request->input('criteria');
            unset($payload['criteria']);
        }

        $scholarship->update($payload);

        return ApiResponse::success(['scholarship' => $scholarship->fresh()->toApiArray()]);
    }

    public function close(CloseScholarshipRequest $request): JsonResponse
    {
        $scholarship = Scholarship::query()->findOrFail($request->validated('id'));

        try {
            $this->closureService->close(
                $scholarship,
                $request->input('adminId') ?: $request->user()->id
            );
        } catch (QueryException $e) {
            if ($this->closureService->isIntegrityError($e)) {
                return ApiResponse::error('Cannot end scholarship due to linked records.', 409);
            }
            throw $e;
        }

        return ApiResponse::success();
    }

    public function history(): JsonResponse
    {
        $histories = ScholarshipHistory::query()
            ->with('applicants')
            ->orderByDesc('ended_at')
            ->get()
            ->map(function (ScholarshipHistory $history) {
                return [
                    'id' => (string) $history->id,
                    'scholarshipId' => $history->scholarship_id,
                    'title' => $history->title,
                    'programType' => $history->program_type ?? '',
                    'endedAt' => $history->ended_at?->toAtomString() ?? '',
                    'endedBy' => $history->ended_by ?? '',
                    'totalApplicants' => (int) $history->total_applicants,
                    'grantedApplicants' => (int) $history->granted_applicants,
                    'applicants' => $history->applicants->map(fn ($a) => [
                        'applicationId' => $a->application_id,
                        'studentId' => $a->student_id ?? '',
                        'name' => $a->applicant_name ?? '',
                        'email' => $a->applicant_email ?? '',
                        'status' => $a->status,
                        'submissionDate' => $a->submission_date?->toAtomString(),
                    ])->values(),
                ];
            });

        return ApiResponse::success(['history' => $histories]);
    }
}
