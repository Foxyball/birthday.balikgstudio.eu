<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactsRequest extends FormRequest
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
            'contactName' => 'required|string|max:255',
            'categoryID' => 'nullable|integer|exists:categories,id',
            'email' => 'nullable|email|unique:contacts,email',
            'phone' => 'nullable|string|max:20',
            'birthday' => 'required|date',
            'image' => 'nullable|image|max:2048',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'categoryID' => $this->categoryID === '' || $this->categoryID === null ? null : $this->categoryID,
            'email' => $this->email === '' ? null : $this->email,
            'phone' => $this->phone === '' ? null : $this->phone,
        ]);
    }
}
