<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'message' => $result['message'],
            'user' => $result['user'],
            'token' => $result['token'],
            'token_type' => $result['token_type'],
            'expires_in' => $result['expires_in'],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'message' => $result['message'],
            'user' => $result['user'],
            'token' => $result['token'],
            'token_type' => $result['token_type'],
            'expires_in' => $result['expires_in'],
        ]);
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->success(null, 'Déconnexion réussie');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);
        $this->authService->forgotPassword($request->input('email'));

        return $this->success(null, 'Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $ok = $this->authService->resetPassword(
            $validated['email'],
            $validated['token'],
            $validated['password']
        );

        if (! $ok) {
            return $this->error('Lien invalide ou expiré.', 400);
        }

        return $this->success(null, 'Mot de passe réinitialisé. Vous pouvez vous connecter.');
    }
}
