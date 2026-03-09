<?php

namespace App\Services;

use App\Contracts\Repositories\EventRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Mail\EventCreatedMail;
use App\Mail\InvitationMail;
use App\Models\EmailLog;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
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

        try {
            Mail::to($user->email)->send(new EventCreatedMail($event, count($guests)));
            EmailLog::recordSent(EmailLog::TYPE_EVENT_CREATED, $user->email, ['event_id' => $event->id]);
        } catch (\Throwable $e) {
            EmailLog::recordFailed(EmailLog::TYPE_EVENT_CREATED, $user->email, $e->getMessage(), ['event_id' => $event->id]);
            throw $e;
        }

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
     * Duplicate an event (optionally shift date and copy guests).
     */
    public function duplicateEvent(User $user, Event $event, int $dateOffsetDays = 7, bool $copyGuests = true): Event
    {
        $newDate = Carbon::parse($event->date)->addDays($dateOffsetDays);

        $data = $event->only([
            'title', 'description', 'location', 'invitation_subject', 'invitation_body', 'reminder_days', 'rsvp_deadline',
        ]);
        $data['title'] = $event->title . ' (copie)';
        $data['date'] = $newDate->format('Y-m-d');
        $data['time'] = $event->time;

        $newEvent = $this->eventRepository->create($user, $data);

        if ($copyGuests) {
            foreach ($event->guests as $guest) {
                $this->guestRepository->createForEvent($newEvent->id, $guest->name, $guest->email);
            }
        }

        return $newEvent->load('guests');
    }

    /**
     * @return array{total_events: int, total_guests: int, total_attendees: int, upcoming_events: int, events_per_month: array<int, int>, top_events_by_guests: array<int, array{title: string, guests_count: int}>}
     */
    public function getDashboardStats(User $user): array
    {
        $events = $this->eventRepository->getForUser($user);
        $eventIds = $events->pluck('id')->all();
        $totalEvents = $events->count();
        $totalGuests = $events->sum(fn (Event $e) => $e->guests_count ?? $e->guests->count());
        $totalAttendees = empty($eventIds)
            ? 0
            : (int) DB::table('guests')
                ->whereIn('event_id', $eventIds)
                ->where('status', 'confirmed')
                ->sum(DB::raw('COALESCE(attendees_count, 1)'));
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
            'total_attendees' => $totalAttendees,
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
            try {
                Mail::to($guest->email)->send(new InvitationMail($event, $guest));
                EmailLog::recordSent(EmailLog::TYPE_INVITATION, $guest->email, ['event_id' => $event->id, 'guest_id' => $guest->id]);
            } catch (\Throwable $e) {
                EmailLog::recordFailed(EmailLog::TYPE_INVITATION, $guest->email, $e->getMessage(), ['event_id' => $event->id, 'guest_id' => $guest->id]);
                throw $e;
            }
        }
    }
}
