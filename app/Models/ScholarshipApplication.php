<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarshipApplication extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'scholarship_applications';

    protected $fillable = [
        'id',
        'student_id',
        'scholarship_id',
        'status',
        'submission_date',
        'timeline_json',
        'documents_json',
        'answers_json',
        'rubric_json',
        'grant_disbursement_json',
        'grant_transactions_json',
        'reviewed_at',
        'reviewed_by',
        'review_note',
    ];

    protected function casts(): array
    {
        return [
            'submission_date' => 'datetime',
            'timeline_json' => 'array',
            'documents_json' => 'array',
            'answers_json' => 'array',
            'rubric_json' => 'array',
            'grant_disbursement_json' => 'array',
            'grant_transactions_json' => 'array',
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function scholarship(): BelongsTo
    {
        return $this->belongsTo(Scholarship::class, 'scholarship_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'studentId' => $this->student_id,
            'scholarshipId' => $this->scholarship_id,
            'status' => $this->status,
            'submissionDate' => $this->submission_date?->toAtomString() ?? now()->toAtomString(),
            'timeline' => $this->timeline_json ?? [],
            'documents' => $this->documents_json ?? [],
            'answers' => $this->answers_json ?? [],
            'rubricScore' => $this->rubric_json,
            'grantDisbursement' => $this->grant_disbursement_json,
            'grantTransactions' => $this->grant_transactions_json ?? [],
        ];
    }
}
