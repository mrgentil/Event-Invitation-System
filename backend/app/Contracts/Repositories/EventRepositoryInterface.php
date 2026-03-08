<?php

namespace App\Contracts\Repositories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface EventRepositoryInterface
{
    public function getForUser(User $user): Collection;

    /**
     * @param  array{search?: string, date_from?: string, date_to?: string, sort?: string}  $filters
     */
    public function getForUserPaginated(User $user, array $filters, int $perPage = 15): LengthAwarePaginator;

    public function find(int $id): ?Event;

    public function create(User $user, array $data): Event;

    public function update(Event $event, array $data): Event;

    public function delete(Event $event): bool;
}
