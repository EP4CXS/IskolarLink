<?php

namespace App\Http\Requests\Scholarship;

use Illuminate\Foundation\Http\FormRequest;

class StoreScholarshipRequest extends FormRequest
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
            'description' => ['required', 'string'],
            'deadline' => ['required', 'date'],
            'slots' => ['required', 'integer', 'min:0'],
            'benefits' => ['nullable', 'array'],
            'criteria' => ['nullable', 'array'],
            'status' => ['required', 'in:Active,Closed,Draft'],
        ];
    }
}
