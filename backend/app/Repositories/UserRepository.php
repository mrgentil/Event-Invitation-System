<?php

namespace App\Repositories;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function find(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return User::query()->create($data);
    }

    public function update(User $user, array $data): User
    {
        if (isset($data['password']) && $data['password'] !== '') {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->fresh();
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}
