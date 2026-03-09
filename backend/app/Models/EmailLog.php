<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailLog extends Model
{
    public const TYPE_INVITATION = 'invitation';

    public const TYPE_REMINDER = 'reminder';

    public const TYPE_RESET_PASSWORD = 'reset_password';

    public const TYPE_EVENT_CREATED = 'event_created';

    public const STATUS_SENT = 'sent';

    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'type',
        'event_id',
        'guest_id',
        'email',
        'sent_at',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    /**
     * Log a sent email (call after Mail::send).
     */
    public static function recordSent(string $type, string $email, array $attributes = []): void
    {
        self::create(array_merge([
            'type' => $type,
            'email' => $email,
            'sent_at' => now(),
            'status' => self::STATUS_SENT,
        ], $attributes));
    }

    /**
     * Log a failed email send.
     */
    public static function recordFailed(string $type, string $email, string $errorMessage, array $attributes = []): void
    {
        self::create(array_merge([
            'type' => $type,
            'email' => $email,
            'sent_at' => now(),
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
        ], $attributes));
    }
}
