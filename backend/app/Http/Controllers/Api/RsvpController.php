<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RsvpService;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RsvpController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RsvpService $rsvpService
    ) {}

    /**
     * Public: get invitation details by token (for RSVP page).
     */
    public function show(string $token): JsonResponse
    {
        $invitation = $this->rsvpService->getByToken($token);

        if (! $invitation) {
            return $this->error('Lien invalide ou expiré.', 404);
        }

        return $this->success($invitation);
    }

    /**
     * Public: submit RSVP (confirm or decline).
     */
    public function respond(Request $request, string $token): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:confirmed,declined'],
            'attendees_count' => ['nullable', 'integer', 'min:1', 'max:20'],
            'rsvp_message' => ['nullable', 'string', 'max:1000'],
        ]);

        $invitation = $this->rsvpService->getByToken($token);
        if (! $invitation) {
            return $this->error('Lien invalide ou expiré.', 404);
        }

        $deadline = $invitation['event']['rsvp_deadline'] ?? null;
        if ($deadline && Carbon::today()->gt(Carbon::parse($deadline))) {
            return $this->error('La date limite de réponse est dépassée.', 422);
        }

        $guest = $this->rsvpService->respondByToken($token, $validated);
        if (! $guest) {
            return $this->error('Lien invalide ou expiré.', 404);
        }

        return $this->success($guest->fresh(), 'Merci pour votre réponse.');
    }

    /**
     * Public: return QR code image for RSVP link (for use in emails or display).
     */
    public function qr(string $token): Response
    {
        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');
        $rsvpUrl = $frontendUrl . '/rsvp/' . $token;

        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($rsvpUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::Low)
            ->size(256)
            ->margin(10)
            ->build();

        return new Response(
            $result->getString(),
            200,
            [
                'Content-Type' => $result->getMimeType(),
                'Content-Disposition' => 'inline; filename="rsvp-qr.png"',
            ]
        );
    }

    /**
     * Public: return .ics file for the event (add to calendar).
     */
    public function calendar(string $token): Response|JsonResponse
    {
        $invitation = $this->rsvpService->getByToken($token);
        if (! $invitation) {
            return $this->error('Lien invalide ou expiré.', 404);
        }

        $event = $invitation['event'];
        $title = $event['title'];
        $description = $event['description'] ?? '';
        $location = $event['location'] ?? '';
        $date = $event['date'];
        $time = $event['time'];

        $start = Carbon::parse($date . ' ' . $time, config('app.timezone'))->utc();
        $end = $start->copy()->addHours(2);

        $uid = 'rsvp-' . $token . '@' . (parse_url(config('app.url'), PHP_URL_HOST) ?: 'localhost');
        $ics = "BEGIN:VCALENDAR\r\n"
            . "VERSION:2.0\r\n"
            . "PRODID:-//Event Invitation//FR\r\n"
            . "CALSCALE:GREGORIAN\r\n"
            . "BEGIN:VEVENT\r\n"
            . "UID:" . $uid . "\r\n"
            . "DTSTAMP:" . Carbon::now()->utc()->format('Ymd\THis\Z') . "\r\n"
            . "DTSTART:" . $start->format('Ymd\THis\Z') . "\r\n"
            . "DTEND:" . $end->format('Ymd\THis\Z') . "\r\n"
            . "SUMMARY:" . $this->icsEscape($title) . "\r\n"
            . "DESCRIPTION:" . $this->icsEscape($description) . "\r\n"
            . "LOCATION:" . $this->icsEscape($location) . "\r\n"
            . "END:VEVENT\r\n"
            . "END:VCALENDAR";

        return new Response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="invitation.ics"',
        ]);
    }

    private function icsEscape(string $s): string
    {
        return str_replace(["\r", "\n", ',', ';'], ['', ' ', '\\,', '\\;'], $s);
    }
}
