<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthService $authService
    ) {}

    public function show(): JsonResponse
    {
        $user = request()->user();

        return $this->success($user);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->authService->updateProfile($request->user(), $request->validated());

        return $this->success($user, 'Profil mis à jour.');
    }

    public function destroy(): JsonResponse
    {
        $this->authService->deleteAccount(request()->user());

        return $this->noContent();
    }
}
