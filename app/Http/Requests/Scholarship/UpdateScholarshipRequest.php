<?php

namespace App\Http\Requests\Scholarship;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScholarshipRequest extends FormRequest
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
            'id' => ['required', 'string', 'exists:scholarships,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'deadline' => ['sometimes', 'date'],
            'slots' => ['sometimes', 'integer', 'min:0'],
            'benefits' => ['sometimes', 'array'],
            'criteria' => ['sometimes', 'array'],
            'status' => ['sometimes', 'in:Active,Closed,Draft'],
        ];
    }
}
