<?php

namespace App\Http\Requests\Announcement;

use App\Support\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'id' => ['required', 'string', 'exists:announcements,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'targetAudience' => ['required', 'string', 'max:100'],
            'category' => ['sometimes', 'in:general'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors()->toArray();
        $firstMessage = $validator->errors()->first() ?: 'Validation failed.';

        throw new HttpResponseException(
            ApiResponse::validationError($firstMessage, $errors)
        );
    }
}
