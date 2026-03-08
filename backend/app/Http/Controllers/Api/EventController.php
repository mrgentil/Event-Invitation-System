<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreEventRequest;
use App\Http\Requests\Api\UpdateEventRequest;
use App\Models\Event;
use App\Services\EventService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EventService $eventService
    ) {}

    public function index(): JsonResponse
    {
        $request = request();
        $perPage = min((int) $request->input('per_page', 15), 50);
        $filters = [
            'search' => $request->input('search'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
            'sort' => $request->input('sort', 'date_desc'),
        ];

        $paginator = $this->eventService->getEventsForUserPaginated($request->user(), $filters, $perPage);

        return $this->successWithMeta(
            $paginator->items(),
            'OK',
            [
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]
        );
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $this->eventService->createEventWithGuests(
            $request->user(),
            $request->safe()->except('guests_file'),
            $request->file('guests_file')
        );

        return $this->created($event, 'Événement créé et invitations envoyées.');
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);
        $event->load('guests');

        return $this->success($event);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $event = $this->eventService->updateEvent($event, $request->validated());

        return $this->success($event);
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        $this->eventService->deleteEvent($event);

        return $this->noContent();
    }
}
