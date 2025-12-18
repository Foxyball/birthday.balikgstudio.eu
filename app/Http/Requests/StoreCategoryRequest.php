<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'catName' => 'required|string|max:40',
        ];
    }

    public function messages()
    {
        return [
            'catName.required' => 'The category name field is required.',
            'catName.string' => 'The category name must be a string.',
            'catName.max' => 'The category name may not be greater than 40 characters.'
        ];
    }
}
