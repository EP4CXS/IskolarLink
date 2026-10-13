<?php

namespace App\Http\Requests\Announcement;

use App\Support\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAnnouncementRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'authorId' => ['required', 'string', 'exists:users,id'],
            'targetAudience' => ['required', 'string', 'max:100'],
            'category' => ['sometimes', 'in:general'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Announcement title is required.',
            'content.required' => 'Announcement content is required.',
            'category.required' => 'Announcement type is required.',
            'targetAudience.required' => 'Target audience is required.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()?->isAdmin() && ! $this->has('authorId')) {
            $this->merge(['authorId' => $this->user()->id]);
        }
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
