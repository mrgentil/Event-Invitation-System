<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Guest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_DECLINED = 'declined';

    protected $fillable = [
        'event_id',
        'name',
        'email',
        'status',
        'rsvp_token',
        'attendees_count',
        'rsvp_message',
    ];

    protected $casts = [
        'attendees_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Guest $guest) {
            if (empty($guest->rsvp_token)) {
                $guest->rsvp_token = Str::random(48);
            }
            if (empty($guest->status)) {
                $guest->status = self::STATUS_PENDING;
            }
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
