<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Notification extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'message',
        'link',
        'is_read',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function newId(): string
    {
        return (string) Str::orderedUuid();
    }

    /**
     * @param  Builder<Notification>  $query
     * @return Builder<Notification>
     */
    public function scopeNewestFirst(Builder $query): Builder
    {
        return $query
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        $createdAt = $this->created_at?->toAtomString() ?? '';

        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'title' => $this->title,
            'message' => $this->message,
            'read' => (bool) $this->is_read,
            'createdAt' => $createdAt,
            'date' => $createdAt,
            'link' => $this->link,
        ];
    }
}
