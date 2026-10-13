<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'title',
        'content',
        'author_id',
        'target_audience',
        'category',
        'grant_release_date',
        'created_at',
    ];

    protected static function booted(): void
    {
        static::creating(function (Announcement $announcement): void {
            $announcement->created_at ??= now();
        });
    }

    protected function casts(): array
    {
        return [
            'grant_release_date' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'authorId' => $this->author_id,
            'targetAudience' => $this->target_audience,
            'category' => $this->category,
            'grantReleaseDate' => $this->grant_release_date?->toIso8601String(),
            'date' => ($this->created_at ?? now())->toIso8601String(),
        ];
    }
}
