<?php

namespace App\Http\Controllers;

use App\Helpers\ImageHelper;
use App\Http\Requests\StoreContactsRequest;
use App\Models\Category;
use App\Models\Contact;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        // Validate sort field
        $allowedSortFields = ['id', 'name', 'email', 'birthday', 'created_at'];
        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'created_at';
        }

        // Validate sort direction
        $sortDirection = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';

        $contacts = Contact::with('category')
            ->where('user_id', Auth::id())
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('contacts/index', [
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('contacts/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContactsRequest $request)
    {

        $imageData = ImageHelper::normalize($request->file('image'));

        Contact::create([
            'user_id' => Auth::user()->id,
            'category_id' => $request->categoryID,
            'name' => $request->contactName,
            'email' => $request->email,
            'phone' => $request->phone,
            'birthday' => $request->birthday,
            'image' => $imageData,
        ]);

        $success = "Contact created successfully.";
        return redirect()->route('contacts.index')->with('success', $success);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $contact = Contact::findOrFail($id);
        $categories = Category::all();

        return Inertia::render('contacts/edit', [
            'contact' => $contact,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'email' => 'required|email|unique:contacts,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'birthday' => 'required|date',
            'image' => 'nullable',
        ]);

        $contact = Contact::findOrFail($id);

        $imageData = ImageHelper::normalize($request->image) ?? $contact->image;

        $contact->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'email' => $request->email,
            'phone' => $request->phone,
            'birthday' => $request->birthday,
            'image' => $imageData,
        ]);

        $success = 'Contact updated successfully.';
        return redirect()->route('contacts.index')->with('success', $success);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        $success = 'Contact deleted successfully.';
        return redirect()->route('contacts.index')->with('success', $success);
    }

    /**
     * Toggle the status of a contact.
     */
    public function toggleStatus(Request $request, string $id)
    {
        $contact = Contact::findOrFail($id);
        
        $contact->update([
            'status' => !$contact->status,
        ]);

        return response()->json([
            'success' => true,
            'status' => $contact->status,
            'message' => $contact->status ? 'Contact activated.' : 'Contact deactivated.',
        ]);
    }
}
