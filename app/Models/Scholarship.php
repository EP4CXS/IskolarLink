<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scholarship extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'id',
        'title',
        'description',
        'deadline',
        'slots',
        'benefits_json',
        'criteria_json',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
            'benefits_json' => 'array',
            'criteria_json' => 'array',
            'slots' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class, 'scholarship_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'deadline' => $this->deadline?->toAtomString() ?? '',
            'slots' => (int) $this->slots,
            'benefits' => $this->benefits_json ?? [],
            'criteria' => $this->criteria_json ?? [],
            'status' => $this->status,
        ];
    }
}
