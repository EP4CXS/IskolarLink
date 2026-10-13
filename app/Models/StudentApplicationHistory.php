<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentApplicationHistory extends Model
{
    protected $table = 'student_application_history';

    protected $fillable = [
        'application_id',
        'student_id',
        'scholarship_id',
        'scholarship_title',
        'program_type',
        'status',
        'submission_date',
        'archived_at',
        'archived_reason',
    ];

    protected function casts(): array
    {
        return [
            'submission_date' => 'datetime',
            'archived_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return [
            'applicationId' => $this->application_id,
            'studentId' => $this->student_id,
            'scholarshipId' => $this->scholarship_id,
            'scholarshipTitle' => $this->scholarship_title,
            'programType' => $this->program_type ?? '',
            'status' => $this->status,
            'submissionDate' => $this->submission_date?->toAtomString(),
            'archivedAt' => $this->archived_at?->toAtomString() ?? '',
            'archivedReason' => $this->archived_reason,
        ];
    }
}
