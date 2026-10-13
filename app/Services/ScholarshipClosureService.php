<?php

namespace App\Services;

use App\Models\Scholarship;
use App\Models\ScholarshipApplication;
use App\Models\ScholarshipHistory;
use App\Models\ScholarshipHistoryApplicant;
use App\Models\StudentApplicationHistory;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

final class ScholarshipClosureService
{
    public function __construct(
        private readonly ProgramTypeDetector $programTypeDetector,
    ) {}

    public function close(Scholarship $scholarship, ?string $adminId = null): void
    {
        DB::transaction(function () use ($scholarship, $adminId) {
            $scholarship->update(['status' => 'Closed']);

            ScholarshipApplication::query()
                ->where('scholarship_id', $scholarship->id)
                ->update([
                    'grant_disbursement_json' => null,
                    'grant_transactions_json' => [],
                ]);

            $applications = ScholarshipApplication::query()
                ->with('student')
                ->where('scholarship_id', $scholarship->id)
                ->orderByDesc('submission_date')
                ->get();

            $totalApplicants = $applications->count();
            $grantedApplicants = $applications->where('status', 'Approved')->count();
            $programType = $this->programTypeDetector->detect($scholarship->title);
            $now = now();

            $history = ScholarshipHistory::query()->updateOrCreate(
                ['scholarship_id' => $scholarship->id],
                [
                    'title' => $scholarship->title,
                    'program_type' => $programType,
                    'ended_at' => $now,
                    'ended_by' => $adminId ?: null,
                    'total_applicants' => $totalApplicants,
                    'granted_applicants' => $grantedApplicants,
                ]
            );

            ScholarshipHistoryApplicant::query()
                ->where('history_id', $history->id)
                ->delete();

            foreach ($applications as $application) {
                $answers = $application->answers_json ?? [];
                $name = trim((string) ($answers['fullName'] ?? ''));
                if ($name === '') {
                    $name = $application->student?->name ?? '';
                }
                $email = trim((string) ($answers['email'] ?? ''));
                if ($email === '') {
                    $email = $application->student?->email ?? '';
                }

                ScholarshipHistoryApplicant::query()->create([
                    'history_id' => $history->id,
                    'application_id' => $application->id,
                    'student_id' => $application->student_id,
                    'applicant_name' => $name,
                    'applicant_email' => $email,
                    'status' => $application->status,
                    'submission_date' => $application->submission_date,
                ]);

                StudentApplicationHistory::query()->updateOrCreate(
                    ['application_id' => $application->id],
                    [
                        'student_id' => $application->student_id,
                        'scholarship_id' => $scholarship->id,
                        'scholarship_title' => $scholarship->title,
                        'program_type' => $programType,
                        'status' => $application->status,
                        'submission_date' => $application->submission_date,
                        'archived_at' => $now,
                        'archived_reason' => 'Scholarship Ended',
                    ]
                );
            }
        });
    }

    public function isIntegrityError(QueryException $exception): bool
    {
        return $exception->getCode() === '23000';
    }
}
