<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterQRCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qr_code' => 'required|unique:qr_codes',
            'item_name' => 'required|string|max:255',
            'item_description' => 'nullable|string|max:1000',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
            'user_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'item_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'qr_code.required' => 'QR code is required',
            'qr_code.unique' => 'This QR code has already been registered',
            'item_name.required' => 'Item name is required',
            'contact_name.required' => 'Contact name is required',
            'contact_email.required' => 'Contact email is required',
            'contact_email.email' => 'Contact email must be a valid email address',
            'contact_phone.required' => 'Contact phone is required',
            'user_image.image' => 'User image must be a valid image file',
            'user_image.mimes' => 'User image must be jpeg, png, jpg, or gif',
            'user_image.max' => 'User image must not exceed 2MB',
            'item_image.image' => 'Item image must be a valid image file',
            'item_image.mimes' => 'Item image must be jpeg, png, jpg, or gif',
            'item_image.max' => 'Item image must not exceed 2MB',
        ];
    }
}
