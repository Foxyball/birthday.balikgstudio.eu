<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'link',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include unread notifications.
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope a query to only include read notifications.
     */
    public function scopeRead(Builder $query): Builder
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Mark the notification as read.
     */
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Mark the notification as unread.
     */
    public function markAsUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Check if the notification has been read.
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    /**
     * Create a birthday notification.
     */
    public static function createBirthdayNotification(int $userId, string $contactName, int $contactId, int $daysUntil): self
    {
        $title = $daysUntil === 0 
            ? "{$contactName}'s birthday is today!" 
            : "{$contactName}'s birthday in {$daysUntil} day" . ($daysUntil > 1 ? 's' : '');

        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => "Don't forget to send your wishes!",
            'type' => 'birthday',
            'link' => "/contacts/{$contactId}/edit",
        ]);
    }

    /**
     * Create an info notification.
     */
    public static function createInfoNotification(int $userId, string $title, ?string $message = null, ?string $link = null): self
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => 'info',
            'link' => $link,
        ]);
    }

    /**
     * Create a success notification.
     */
    public static function createSuccessNotification(int $userId, string $title, ?string $message = null, ?string $link = null): self
    {
        return self::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => 'success',
            'link' => $link,
        ]);
    }
}
