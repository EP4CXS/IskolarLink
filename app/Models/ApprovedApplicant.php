<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovedApplicant extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'application_id',
        'student_id',
        'scholarship_id',
        'approved_at',
        'notes',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }
}
