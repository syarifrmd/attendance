<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DivisionUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $divisionId = $this->route('division')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('divisions', 'name')->ignore($divisionId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'work_days' => ['required', 'array', 'min:1'],
            'work_days.*' => [
                'string',
                Rule::in(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
            ],
            'internship_duration_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'mentor_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
