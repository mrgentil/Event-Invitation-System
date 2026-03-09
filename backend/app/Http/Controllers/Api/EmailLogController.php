<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailLogController extends Controller
{
    use ApiResponse;

    /**
     * List all email logs for the authenticated user's events (global view).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $eventIds = $user->events()->pluck('id');

        $perPage = min((int) $request->input('per_page', 25), 100);

        $logs = EmailLog::query()
            ->whereIn('event_id', $eventIds)
            ->with(['event:id,title', 'guest:id,name,email'])
            ->orderByDesc('sent_at')
            ->paginate($perPage);

        $data = $logs->getCollection()->map(fn ($log) => [
            'id' => $log->id,
            'type' => $log->type,
            'email' => $log->email,
            'guest_name' => $log->guest?->name,
            'event_title' => $log->event?->title,
            'sent_at' => $log->sent_at->toIso8601String(),
            'status' => $log->status,
            'error_message' => $log->error_message,
        ])->all();

        return $this->successWithMeta($data, 'OK', [
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
