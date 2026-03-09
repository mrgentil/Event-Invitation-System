<?php

namespace App\Services;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Models\Guest;

class RsvpService
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository
    ) {}

    /**
     * Return public invitation data for RSVP page (event + guest name, no email).
     */
    public function getByToken(string $token): ?array
    {
        $guest = $this->guestRepository->findByToken($token);

        if (! $guest) {
            return null;
        }

        $event = $guest->event;

        return [
            'guest' => [
                'name' => $guest->name,
                'status' => $guest->status,
                'attendees_count' => $guest->attendees_count,
                'rsvp_message' => $guest->rsvp_message,
            ],
            'event' => [
                'title' => $event->title,
                'description' => $event->description,
                'location' => $event->location,
                'date' => $event->date->format('Y-m-d'),
                'time' => $event->time,
            ],
        ];
    }

    public function respondByToken(string $token, array $data): ?Guest
    {
        $guest = $this->guestRepository->findByToken($token);

        if (! $guest) {
            return null;
        }

        $this->guestRepository->update($guest, $data);

        return $guest->fresh();
    }
}
