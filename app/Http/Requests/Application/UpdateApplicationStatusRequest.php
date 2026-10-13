<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationStatusRequest extends FormRequest
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
            'id' => ['required', 'string', 'exists:scholarship_applications,id'],
            'status' => ['required', 'in:Pending,Under Review,Screened,Approved,Rejected'],
            'note' => ['nullable', 'string'],
            'author' => ['nullable', 'string'],
            'rubric' => ['nullable', 'array'],
        ];
    }
}
