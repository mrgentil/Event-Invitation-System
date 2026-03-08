<?php

namespace App\Repositories;

use App\Contracts\Repositories\EventRepositoryInterface;
use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class EventRepository implements EventRepositoryInterface
{
    public function getForUser(User $user): Collection
    {
        return $user->events()
            ->withCount('guests')
            ->latest()
            ->get();
    }

    public function getForUserPaginated(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $user->events()->withCount('guests');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        $sort = $filters['sort'] ?? 'date_desc';
        match ($sort) {
            'date_asc' => $query->orderBy('date')->orderBy('time'),
            'date_desc' => $query->orderByDesc('date')->orderByDesc('time'),
            'title_asc' => $query->orderBy('title'),
            'title_desc' => $query->orderByDesc('title'),
            default => $query->latest('date'),
        };

        return $query->paginate($perPage);
    }

    public function find(int $id): ?Event
    {
        return Event::query()->find($id);
    }

    public function create(User $user, array $data): Event
    {
        return $user->events()->create($data);
    }

    public function update(Event $event, array $data): Event
    {
        $event->update($data);

        return $event->fresh();
    }

    public function delete(Event $event): bool
    {
        return $event->delete();
    }
}
