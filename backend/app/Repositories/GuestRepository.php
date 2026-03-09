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
            ->orderBy('name')
            ->get();
    }

    public function findByToken(string $token): ?Guest
    {
        return Guest::query()
            ->where('rsvp_token', $token)
            ->with('event')
            ->first();
    }

    public function update(Guest $guest, array $data): Guest
    {
        $guest->update($data);

        return $guest->fresh();
    }

    public function delete(Guest $guest): bool
    {
        return $guest->delete();
    }
}
