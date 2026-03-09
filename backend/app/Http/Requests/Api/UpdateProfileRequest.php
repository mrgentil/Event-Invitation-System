<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'preferences' => ['sometimes', 'array'],
            'preferences.language' => ['sometimes', 'string', 'in:fr,en'],
            'preferences.notifications_email_reminders' => ['sometimes', 'boolean'],
            'preferences.notifications_new_rsvp' => ['sometimes', 'boolean'],
        ];
    }
}
