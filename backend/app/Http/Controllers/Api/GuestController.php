<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Guest;
use App\Services\EventService;
use App\Services\GuestService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuestController extends Controller
{
    use ApiResponse;

    public function __construct(
        private GuestService $guestService,
        private EventService $eventService
    ) {}

    public function store(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email'],
            'send_invitation' => ['boolean'],
        ]);

        $sendInvitation = $request->boolean('send_invitation', true);
        $guest = $this->guestService->addGuestToEvent($event, $validated['name'], $validated['email'], $sendInvitation);

        return $this->created($guest, 'Invité ajouté.');
    }

    public function update(Request $request, Event $event, Guest $guest): JsonResponse
    {
        $this->authorize('view', $event);
        $this->ensureGuestBelongsToEvent($event, $guest);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email'],
        ]);

        $guest = $this->guestService->updateGuest($guest, $validated);

        return $this->success($guest);
    }

    public function destroy(Event $event, Guest $guest): JsonResponse
    {
        $this->authorize('view', $event);
        $this->ensureGuestBelongsToEvent($event, $guest);

        $this->guestService->deleteGuest($guest);

        return $this->noContent();
    }

    public function import(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $request->validate([
            'guests_file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $guests = $this->guestService->importGuests($event, $request->file('guests_file'));
        $this->guestService->sendInvitationsToGuests($event, $guests);

        return $this->success(['count' => count($guests)], count($guests) . ' invité(s) ajouté(s) et invitations envoyées.');
    }

    public function export(Event $event): StreamedResponse
    {
        $this->authorize('view', $event);

        return $this->guestService->exportGuests($event);
    }

    public function resend(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $guestIds = $request->input('guest_ids', []);
        $count = $this->guestService->resendInvitations($event, $guestIds);

        return $this->success(['count' => $count], $count . ' invitation(s) renvoyée(s).');
    }

    private function ensureGuestBelongsToEvent(Event $event, Guest $guest): void
    {
        if ($guest->event_id !== $event->id) {
            abort(404);
        }
    }
}
