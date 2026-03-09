<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;

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

    public function forgotPassword(string $email): void
    {
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return; // Don't reveal if email exists
        }

        $token = Str::random(64);
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $resetUrl = $frontendUrl . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($email);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        Mail::to($email)->send(new ResetPasswordMail($resetUrl, 60));
    }

    public function resetPassword(string $email, string $token, string $password): bool
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();
        if (! $record || ! Hash::check($token, $record->token)) {
            return false;
        }
        if (now()->diffInMinutes($record->created_at) > 60) {
            return false;
        }

        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return false;
        }

        $user->update(['password' => Hash::make($password)]);
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return true;
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
