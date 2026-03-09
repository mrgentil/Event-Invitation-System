<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
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
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'guests_file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'invitation_subject' => ['nullable', 'string', 'max:255'],
            'invitation_body' => ['nullable', 'string'],
            'reminder_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }
}
