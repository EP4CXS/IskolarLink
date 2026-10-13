<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScholarshipHistory extends Model
{
    protected $table = 'scholarship_history';

    protected $fillable = [
        'scholarship_id',
        'title',
        'program_type',
        'ended_at',
        'ended_by',
        'total_applicants',
        'granted_applicants',
    ];

    protected function casts(): array
    {
        return [
            'ended_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function applicants(): HasMany
    {
        return $this->hasMany(ScholarshipHistoryApplicant::class, 'history_id');
    }
}
