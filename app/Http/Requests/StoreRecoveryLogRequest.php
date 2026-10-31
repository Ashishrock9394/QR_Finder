<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecoveryLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:30',
            'details' => 'required|string|max:3000',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'contact_phone.required' => 'Please enter a contact number.',
            'details.required' => 'Please explain where you found the item or how you can return it.',
        ];
    }
}
