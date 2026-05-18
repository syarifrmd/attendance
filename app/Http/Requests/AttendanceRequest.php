<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
        return [
            'status' => ['required', 'in:wfo,wfh,wfa,izin,sakit'],

            // GPS & face verification only required for WFO
            'latitude' => ['required_if:status,wfo', 'nullable', 'string'],
            'longitude' => ['required_if:status,wfo', 'nullable', 'string'],
            'face_verification_image' => ['required_if:status,wfo', 'nullable', 'image', 'max:2048'],
            'face_match_score' => ['nullable', 'numeric', 'min:0', 'max:1'],

            // Reason required for all except WFO
            'reason' => ['required_if:status,wfh,wfa,izin,sakit', 'nullable', 'string', 'max:500'],

            // Proof photo: required for izin/sakit, optional for wfh/wfa
            'proof_image' => ['required_if:status,izin,sakit', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }
}
