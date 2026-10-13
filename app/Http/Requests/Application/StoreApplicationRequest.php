<?php

namespace App\Http\Requests\Application;

use App\Support\ApiResponse;
use App\Support\ApplicationFormValidator;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStudent() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'studentId' => ['required', 'string', 'exists:users,id'],
            'scholarshipId' => ['required', 'string', 'exists:scholarships,id'],
            'documents' => ['required', 'array', 'min:1'],
            'answers' => ['required', 'array'],
            'answers.fullName' => ['required', 'string', 'max:150'],
            'answers.email' => ['required', 'email', 'max:190'],
            'answers.phone' => ['required', 'string', 'max:30'],
            'answers.address' => ['required', 'string', 'max:500'],
            'answers.course' => ['required', 'string', 'max:255'],
            'answers.yearLevel' => ['required', 'string', 'max:20'],
            'answers.gpa' => ['required', 'numeric', 'min:0', 'max:5'],
            'answers.familyIncome' => ['required', 'string', 'max:100'],
            'answers.essay' => ['required', 'string', 'max:10000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'answers.phone.required' => 'Phone number is required.',
            'answers.gpa.required' => 'Please enter a valid GPA.',
            'answers.gpa.numeric' => 'Please enter a valid GPA.',
            'answers.gpa.min' => 'Please enter a valid GPA between 0.00 and 5.00.',
            'answers.gpa.max' => 'Please enter a valid GPA between 0.00 and 5.00.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $phone = (string) $this->input('answers.phone', '');
            if (preg_match('/[a-zA-Z]/', $phone) === 1) {
                $v->errors()->add(
                    'answers.phone',
                    'Phone number must contain numbers only.'
                );
            } elseif (! ApplicationFormValidator::isValidPhilippinePhone($phone)) {
                $v->errors()->add(
                    'answers.phone',
                    'Enter a valid Philippine mobile number (e.g. 09XXXXXXXXX or +639XXXXXXXXX).'
                );
            }

            $gpa = $this->input('answers.gpa');
            if (! ApplicationFormValidator::isValidGpa($gpa)) {
                $v->errors()->add(
                    'answers.gpa',
                    'Please enter a valid GPA between 0.00 and 5.00.'
                );
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors()->toArray();
        $firstMessage = $validator->errors()->first() ?: 'Validation failed.';

        throw new HttpResponseException(
            ApiResponse::validationError($firstMessage, $errors)
        );
    }

    protected function prepareForValidation(): void
    {
        if ($this->user()?->isStudent()) {
            $this->merge(['studentId' => $this->user()->id]);
        }
    }
}
