<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RsvpService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $guest = $this->rsvpService->respondByToken($token, $validated);

        if (! $guest) {
            return $this->error('Lien invalide ou expiré.', 404);
        }

        return $this->success($guest->fresh(), 'Merci pour votre réponse.');
    }
}
