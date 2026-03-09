<?php

namespace App\Services;

use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Mail\InvitationMail;
use App\Models\EmailLog;
use App\Models\Event;
use App\Models\Guest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuestService
{
    public function __construct(
        private GuestRepositoryInterface $guestRepository,
        private GuestListImporter $guestListImporter
    ) {}

    public function addGuestToEvent(Event $event, string $name, string $email, bool $sendInvitation = true): Guest
    {
        $guest = $this->guestRepository->createForEvent($event->id, $name, $email);

        if ($sendInvitation) {
            try {
                Mail::to($guest->email)->send(new InvitationMail($event, $guest));
                EmailLog::recordSent(EmailLog::TYPE_INVITATION, $guest->email, ['event_id' => $event->id, 'guest_id' => $guest->id]);
            } catch (\Throwable $e) {
                EmailLog::recordFailed(EmailLog::TYPE_INVITATION, $guest->email, $e->getMessage(), ['event_id' => $event->id, 'guest_id' => $guest->id]);
                throw $e;
            }
        }

        return $guest;
    }

    public function updateGuest(Guest $guest, array $data): Guest
    {
        return $this->guestRepository->update($guest, $data);
    }

    public function deleteGuest(Guest $guest): bool
    {
        return $this->guestRepository->delete($guest);
    }

    /**
     * @return Guest[]
     */
    public function importGuests(Event $event, UploadedFile $file): array
    {
        return $this->guestListImporter->import($event->id, $file);
    }

    /**
     * @param  Guest[]  $guests
     */
    public function sendInvitationsToGuests(Event $event, array $guests): void
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

    public function exportGuests(Event $event): StreamedResponse
    {
        $guests = $this->guestRepository->getByEvent($event->id);

        return new StreamedResponse(function () use ($guests) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Nom', 'Email', 'Statut RSVP'], ';');
            foreach ($guests as $g) {
                fputcsv($out, [$g->name, $g->email, $g->status ?? 'pending'], ';');
            }
            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="invites-' . $event->id . '.csv"',
        ]);
    }

    /**
     * @param  int[]  $guestIds  Empty = resend to all
     */
    public function resendInvitations(Event $event, array $guestIds): int
    {
        $event->load('guests');
        $guests = empty($guestIds)
            ? $event->guests
            : $event->guests->whereIn('id', $guestIds);

        $count = 0;
        foreach ($guests as $guest) {
            try {
                Mail::to($guest->email)->send(new InvitationMail($event, $guest));
                EmailLog::recordSent(EmailLog::TYPE_INVITATION, $guest->email, ['event_id' => $event->id, 'guest_id' => $guest->id]);
                $count++;
            } catch (\Throwable $e) {
                EmailLog::recordFailed(EmailLog::TYPE_INVITATION, $guest->email, $e->getMessage(), ['event_id' => $event->id, 'guest_id' => $guest->id]);
            }
        }

        return $count;
    }
}
