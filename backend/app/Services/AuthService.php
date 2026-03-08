<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * @return array{user: User, token: string, token_type: string, expires_in: int}
     */
    public function register(array $data): array
    {
        $user = $this->userRepository->create($data);
        $token = Auth::guard('api')->login($user);

        return $this->authResponse($user, $token, 'Compte créé avec succès');
    }

    /**
     * @return array{user: User, token: string, token_type: string, expires_in: int}
     *
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $token = Auth::guard('api')->attempt($credentials);

        if (! $token) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $user = Auth::guard('api')->user();

        return $this->authResponse($user, $token, 'Connexion réussie');
    }

    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    public function updateProfile(User $user, array $data): User
    {
        return $this->userRepository->update($user, $data);
    }

    public function deleteAccount(User $user): void
    {
        Auth::guard('api')->logout();
        $this->userRepository->delete($user);
    }

    /**
     * @return array{user: User, token: string, token_type: string, expires_in: int}
     */
    private function authResponse(User $user, string $token, string $message): array
    {
        return [
            'message' => $message,
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (int) (Auth::guard('api')->factory()->getTTL() * 60),
        ];
    }
}
