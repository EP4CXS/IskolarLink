<?php

namespace App\Services;

use App\Models\ApprovedApplicant;
use App\Models\Notification;
use App\Models\RejectedApplicant;
use App\Models\ScholarshipApplication;
use App\Models\StudentApplicationHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

final class ApplicationStatusService
{
    /** @var list<string> */
    private const REVIEWABLE_STATUSES = ['Pending', 'Under Review', 'Screened'];

    /** @var list<string> */
    private const FINAL_STATUSES = ['Approved', 'Rejected'];

    public function __construct(
        private readonly ProgramTypeDetector $programTypeDetector,
    ) {}

    /**
     * @param  array<string, mixed>|null  $rubric
     */
    public function update(
        ScholarshipApplication $application,
        string $status,
        ?string $note = null,
        ?string $author = null,
        ?array $rubric = null,
    ): ScholarshipApplication {
        return DB::transaction(function () use ($application, $status, $note, $author, $rubric) {
            $application = ScholarshipApplication::query()
                ->whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();

            $currentStatus = (string) $application->status;
            $isFinalDecision = in_array($status, self::FINAL_STATUSES, true);

            if ($isFinalDecision) {
                if (in_array($currentStatus, self::FINAL_STATUSES, true)) {
                    throw new RuntimeException('This application has already been reviewed.', 409);
                }

                if (! in_array($currentStatus, self::REVIEWABLE_STATUSES, true)) {
                    throw new RuntimeException(
                        'This application cannot be approved or rejected in its current state.',
                        422
                    );
                }
            }

            if ($currentStatus === $status) {
                return $application->fresh(['scholarship', 'student']);
            }

            $timeline = $application->timeline_json ?? [];
            $timeline[] = [
                'id' => (string) Str::uuid(),
                'status' => $status,
                'date' => now()->toAtomString(),
                'note' => $note,
                'author' => $author,
            ];

            $rubricToSave = $rubric ?? $application->rubric_json;
            $now = now();

            $application->update([
                'status' => $status,
                'timeline_json' => $timeline,
                'rubric_json' => is_array($rubricToSave) ? $rubricToSave : null,
                'reviewed_at' => $now,
                'reviewed_by' => $author,
                'review_note' => $note,
            ]);

            $scholarshipTitle = $application->scholarship?->title ?? '';
            $programType = $this->programTypeDetector->detect($scholarshipTitle);

            if ($status === 'Approved') {
                RejectedApplicant::query()->where('application_id', $application->id)->delete();
                ApprovedApplicant::query()->updateOrCreate(
                    ['application_id' => $application->id],
                    [
                        'student_id' => $application->student_id,
                        'scholarship_id' => $application->scholarship_id,
                        'approved_at' => $now,
                        'notes' => $note,
                        'approved_by' => $author,
                    ]
                );
            } elseif ($status === 'Rejected') {
                ApprovedApplicant::query()->where('application_id', $application->id)->delete();
                RejectedApplicant::query()->updateOrCreate(
                    ['application_id' => $application->id],
                    [
                        'student_id' => $application->student_id,
                        'scholarship_id' => $application->scholarship_id,
                        'rejected_at' => $now,
                        'reason' => $note,
                        'rejected_by' => $author,
                    ]
                );
            }

            if ($status === 'Rejected') {
                StudentApplicationHistory::query()->updateOrCreate(
                    ['application_id' => $application->id],
                    [
                        'student_id' => $application->student_id,
                        'scholarship_id' => $application->scholarship_id,
                        'scholarship_title' => $scholarshipTitle !== '' ? $scholarshipTitle : 'Scholarship',
                        'program_type' => $programType,
                        'status' => $status,
                        'submission_date' => $application->submission_date,
                        'archived_at' => $now,
                        'archived_reason' => 'Rejected',
                    ]
                );
            } else {
                StudentApplicationHistory::query()
                    ->where('application_id', $application->id)
                    ->where('archived_reason', 'Rejected')
                    ->delete();
            }

            if ($isFinalDecision) {
                $this->notifyStudentOfReview($application, $status);
            }

            return $application->fresh(['scholarship', 'student']);
        });
    }

    private function notifyStudentOfReview(ScholarshipApplication $application, string $status): void
    {
        Notification::query()->create([
            'id' => Notification::newId(),
            'user_id' => $application->student_id,
            'title' => 'Application Status Updated',
            'message' => "Your application status has been changed to {$status}.",
            'link' => '/student/applications/'.$application->id,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }
}
