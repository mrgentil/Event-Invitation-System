<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EventService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EventService $eventService
    ) {}

    public function stats(): JsonResponse
    {
        $stats = $this->eventService->getDashboardStats(request()->user());

        return $this->success($stats);
    }
}
