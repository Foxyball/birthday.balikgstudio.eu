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
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::store($request->file('image'));
        }

        Contact::create([
            'user_id' => Auth::user()->id,
            'category_id' => $request->categoryID,
            'name' => $request->contactName,
            'email' => $request->email,
            'phone' => $request->phone,
            'birthday' => $request->birthday,
            'image' => $imagePath,
            'notes' => $request->notes,
            'gift_ideas' => $request->gift_ideas,
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
        // Convert empty strings to null
        $request->merge([
            'category_id' => $request->category_id === '' || $request->category_id === '0' ? null : $request->category_id,
            'email' => $request->email === '' ? null : $request->email,
            'phone' => $request->phone === '' ? null : $request->phone,
            'notes' => $request->notes === '' ? null : $request->notes,
            'gift_ideas' => $request->gift_ideas === '' ? null : $request->gift_ideas,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
            'email' => 'nullable|email|unique:contacts,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'birthday' => 'required|date',
            'image' => 'nullable',
            'notes' => 'nullable|string|max:65535',
            'gift_ideas' => 'nullable|string|max:65535',
        ]);

        $contact = Contact::findOrFail($id);

        $imagePath = $contact->image;

        // Handle new image upload
        if ($request->hasFile('image')) {
            $imagePath = ImageHelper::store($request->file('image'), $contact->image);
        } elseif ($request->has('image') && is_string($request->image)) {
            // Handle base64 string or existing path
            if (str_starts_with($request->image, 'data:')) {
                $imagePath = ImageHelper::store($request->image, $contact->image);
            } elseif ($request->image === null || $request->image === '') {
                // Image removed
                ImageHelper::delete($contact->image);
                $imagePath = null;
            }
            // If it's an existing path (not data URL), keep it as is
        }

        $contact->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'email' => $request->email,
            'phone' => $request->phone,
            'birthday' => $request->birthday,
            'image' => $imagePath,
            'notes' => $request->notes,
            'gift_ideas' => $request->gift_ideas,
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

        // Delete the image file if exists
        if ($contact->image) {
            ImageHelper::delete($contact->image);
        }

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

    /**
     * Export contacts to CSV.
     */
    public function export()
    {
        $contacts = Contact::with('category')
            ->where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="contacts_export_' . date('Y-m-d') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($contacts) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            
            // Helper function to escape CSV field
            $escapeField = function ($field) {
                $field = str_replace('"', '""', $field ?? '');
                // Wrap in quotes if contains comma, newline, or quote
                if (preg_match('/[,"\r\n]/', $field)) {
                    return '"' . $field . '"';
                }
                return $field;
            };
            
            // Header row
            $headers = ['Name', 'Email', 'Phone', 'Birthday', 'Category', 'Status', 'Notes', 'Gift Ideas', 'Created At'];
            fwrite($file, implode(';', $headers) . "\r\n");
            
            // Data rows
            foreach ($contacts as $contact) {
                $row = [
                    $escapeField($contact->name),
                    $escapeField($contact->email),
                    $escapeField($contact->phone),
                    $escapeField($contact->birthday),
                    $escapeField($contact->category?->name),
                    $contact->status ? 'Active' : 'Inactive',
                    $escapeField($contact->notes),
                    $escapeField($contact->gift_ideas),
                    $contact->created_at->format('Y-m-d H:i:s'),
                ];
                fwrite($file, implode(';', $row) . "\r\n");
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Download the CSV import template.
     */
    public function importTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="contacts_import_template.csv"',
        ];

        $columns = ['Name', 'Email', 'Phone', 'Birthday', 'Category'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            // Add sep hint for Excel to recognize comma as delimiter
            fwrite($file, "sep=,\n");
            fputcsv($file, $columns);
            // Add example rows - one with category, one without
            fputcsv($file, ['John Doe', 'john@example.com', '+1234567890', '1990-05-15', 'Friends']);
            fputcsv($file, ['Jane Smith', 'jane@example.com', '+0987654321', '1985-12-25', '']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import contacts from a CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $content = file_get_contents($file->getPathname());

        // Remove UTF-8 BOM if present
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);

        // Detect delimiter (comma, semicolon, or tab)
        $firstLine = strtok($content, "\n");
        $delimiter = ',';
        if (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        } elseif (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        }

        // Create a temporary file with cleaned content
        $tempFile = tmpfile();
        fwrite($tempFile, $content);
        rewind($tempFile);
        $handle = $tempFile;

        if ($handle === false) {
            return response()->json([
                'success' => false,
                'message' => 'Could not open the file.',
            ], 422);
        }

        // Read header row
        $header = fgetcsv($handle, 0, $delimiter);
        if (!$header) {
            fclose($handle);
            return response()->json([
                'success' => false,
                'message' => 'CSV file is empty or invalid.',
            ], 422);
        }

        // Clean up header - remove BOM characters only from first cell
        if (!empty($header[0])) {
            $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
        }

        // Skip Excel sep= directive if present (e.g., "sep=,")
        $firstCell = trim($header[0] ?? '');
        if (stripos($firstCell, 'sep=') === 0) {
            $header = fgetcsv($handle, 0, $delimiter);
            if (!$header) {
                fclose($handle);
                return response()->json([
                    'success' => false,
                    'message' => 'CSV file is empty or invalid.',
                ], 422);
            }
            // Clean BOM from new header if present
            if (!empty($header[0])) {
                $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
            }
        }

        // Normalize header names
        $header = array_map(fn($h) => strtolower(trim($h)), $header);

        // Find column indexes
        $nameIndex = array_search('name', $header);
        $emailIndex = array_search('email', $header);
        $phoneIndex = array_search('phone', $header);
        $birthdayIndex = array_search('birthday', $header);
        $categoryIndex = array_search('category', $header);

        if ($nameIndex === false || $birthdayIndex === false) {
            fclose($handle);
            return response()->json([
                'success' => false,
                'message' => 'CSV must contain at least "Name" and "Birthday" columns.',
            ], 422);
        }

        $userId = Auth::id();
        $imported = 0;
        $skipped = 0;
        $errors = [];

        // Cache user's categories by name (case-insensitive)
        $userCategories = Category::pluck('id', 'name')
            ->mapWithKeys(fn($id, $name) => [strtolower($name) => $id])
            ->toArray();

        $rowNumber = 1;
        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rowNumber++;

            $name = $row[$nameIndex] ?? null;
            $email = $emailIndex !== false ? ($row[$emailIndex] ?? null) : null;
            $phone = $phoneIndex !== false ? ($row[$phoneIndex] ?? null) : null;
            $birthday = $row[$birthdayIndex] ?? null;
            $categoryName = $categoryIndex !== false ? ($row[$categoryIndex] ?? null) : null;

            // Validate required fields
            if (empty($name) || empty($birthday)) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Name and Birthday are required.";
                continue;
            }

            // Validate birthday format
            $birthdayDate = date_create($birthday);
            if (!$birthdayDate) {
                $skipped++;
                $errors[] = "Row {$rowNumber}: Invalid birthday format.";
                continue;
            }
            $birthday = $birthdayDate->format('Y-m-d');

            // Skip duplicate emails for this user
            if (!empty($email)) {
                $existingContact = Contact::where('user_id', $userId)
                    ->where('email', $email)
                    ->first();
                if ($existingContact) {
                    $skipped++;
                    $errors[] = "Row {$rowNumber}: Email '{$email}' already exists.";
                    continue;
                }
            }

            // Resolve category
            $categoryId = null;
            if (!empty($categoryName)) {
                $categoryKey = strtolower(trim($categoryName));
                $categoryId = $userCategories[$categoryKey] ?? null;
            }

            // Create contact
            Contact::create([
                'user_id' => $userId,
                'category_id' => $categoryId,
                'name' => trim($name),
                'email' => !empty($email) ? trim($email) : null,
                'phone' => !empty($phone) ? trim($phone) : null,
                'birthday' => $birthday,
                'status' => true,
            ]);

            $imported++;
        }

        fclose($handle);

        return response()->json([
            'success' => true,
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => array_slice($errors, 0, 10), // Return first 10 errors
            'message' => "Imported {$imported} contacts." . ($skipped > 0 ? " Skipped {$skipped} rows." : ''),
        ]);
    }
}
