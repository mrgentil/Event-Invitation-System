<?php

namespace App\Repositories;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;
use Illuminate\Database\Eloquent\Collection;

class GuestRepository implements GuestRepositoryInterface
{
    public function createForEvent(int $eventId, string $name, string $email): Guest
    {
        return Guest::query()->create([
            'event_id' => $eventId,
            'name' => $name,
            'email' => $email,
        ]);
    }

    public function getByEvent(int $eventId): Collection
    {
        return Guest::query()
            ->where('event_id', $eventId)
            ->get();
    }
}
