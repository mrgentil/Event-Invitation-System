<?php

namespace App\Services;

use App\Contracts\Repositories\EventRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Mail\InvitationMail;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;

class EventService
{
    public function __construct(
        private EventRepositoryInterface $eventRepository,
        private GuestRepositoryInterface $guestRepository,
        private GuestListImporter $guestListImporter
    ) {}

    /**
     * @return Collection<int, Event>
     */
    public function getEventsForUser(User $user): Collection
    {
        return $this->eventRepository->getForUser($user);
    }

    /**
     * @param  array{search?: string, date_from?: string, date_to?: string, sort?: string}  $filters
     */
    public function getEventsForUserPaginated(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->eventRepository->getForUserPaginated($user, $filters, $perPage);
    }

    public function findEvent(int $id): ?Event
    {
        return $this->eventRepository->find($id);
    }

    /**
     * Create event, import guests from file and send invitation emails.
     */
    public function createEventWithGuests(User $user, array $eventData, UploadedFile $guestsFile): Event
    {
        $event = $this->eventRepository->create($user, $eventData);
        $guests = $this->guestListImporter->import($event->id, $guestsFile);
        $this->sendInvitations($event, $guests);
        $event->load('guests');

        return $event;
    }

    public function updateEvent(Event $event, array $data): Event
    {
        return $this->eventRepository->update($event, $data);
    }

    public function deleteEvent(Event $event): bool
    {
        return $this->eventRepository->delete($event);
    }

    /**
     * @return array{total_events: int, total_guests: int, upcoming_events: int, events_per_month: array<int, int>, top_events_by_guests: array<int, array{title: string, guests_count: int}>}
     */
    public function getDashboardStats(User $user): array
    {
        $events = $this->eventRepository->getForUser($user);
        $totalEvents = $events->count();
        $totalGuests = $events->sum(fn (Event $e) => $e->guests_count ?? $e->guests->count());
        $today = Carbon::today();
        $upcomingEvents = $events->filter(fn (Event $e) => Carbon::parse($e->date)->gte($today))->count();

        $eventsPerMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::today()->subMonths($i);
            $key = $month->format('Y-m');
            $eventsPerMonth[$key] = $events->filter(function (Event $e) use ($month) {
                $d = Carbon::parse($e->date);
                return $d->format('Y-m') === $month->format('Y-m');
            })->count();
        }

        $topEventsByGuests = $events
            ->sortByDesc(fn (Event $e) => $e->guests_count ?? $e->guests->count())
            ->take(5)
            ->values()
            ->map(fn (Event $e) => [
                'title' => $e->title,
                'guests_count' => $e->guests_count ?? $e->guests->count(),
            ])
            ->all();

        return [
            'total_events' => $totalEvents,
            'total_guests' => $totalGuests,
            'upcoming_events' => $upcomingEvents,
            'events_per_month' => $eventsPerMonth,
            'top_events_by_guests' => array_values($topEventsByGuests),
        ];
    }

    /**
     * @param  array<int, \App\Models\Guest>  $guests
     */
    private function sendInvitations(Event $event, array $guests): void
    {
        foreach ($guests as $guest) {
            Mail::to($guest->email)->send(new InvitationMail($event, $guest));
        }
    }
}
