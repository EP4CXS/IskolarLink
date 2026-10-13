<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RejectedApplicant extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'student_id',
        'scholarship_id',
        'rejected_at',
        'reason',
        'rejected_by',
    ];

    protected function casts(): array
    {
        return [
            'rejected_at' => 'datetime',
        ];
    }
}
