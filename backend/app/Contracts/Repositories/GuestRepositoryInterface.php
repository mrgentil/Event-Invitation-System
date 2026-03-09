<?php

namespace App\Contracts\Repositories;

use App\Models\Guest;
use Illuminate\Database\Eloquent\Collection;

interface GuestRepositoryInterface
{
    public function createForEvent(int $eventId, string $name, string $email): Guest;

    public function getByEvent(int $eventId): Collection;

    public function findByToken(string $token): ?Guest;

    public function update(Guest $guest, array $data): Guest;

    public function delete(Guest $guest): bool;
}
