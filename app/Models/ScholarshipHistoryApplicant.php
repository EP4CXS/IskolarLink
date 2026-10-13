<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarshipHistoryApplicant extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'history_id',
        'application_id',
        'student_id',
        'applicant_name',
        'applicant_email',
        'status',
        'submission_date',
    ];

    protected function casts(): array
    {
        return [
            'submission_date' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function history(): BelongsTo
    {
        return $this->belongsTo(ScholarshipHistory::class, 'history_id');
    }
}
