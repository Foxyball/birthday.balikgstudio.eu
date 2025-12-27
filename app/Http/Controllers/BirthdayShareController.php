<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BirthdayShareController extends Controller
{
    /**
     * Display the public birthday page.
     */
    public function show(string $token)
    {
        $user = User::where('share_token', $token)
            ->where('share_enabled', true)
            ->first();

        if (!$user) {
            abort(404, 'Birthday page not found or sharing is disabled.');
        }

        // Get the user's contacts for display (upcoming birthdays)
        $contacts = $user->contacts()
            ->where('status', true)
            ->orderByRaw("CONCAT(LPAD(MONTH(birthday), 2, '0'), '-', LPAD(DAY(birthday), 2, '0'))")
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'birthday' => $contact->birthday,
                    'image_url' => $contact->image_url,
                    'category' => $contact->category?->name,
                ];
            });

        return Inertia::render('birthday/public', [
            'user' => [
                'name' => $user->name,
            ],
            'contacts' => $contacts,
        ]);
    }

    /**
     * Toggle birthday sharing and generate/regenerate token.
     */
    public function toggle(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $shareEnabled = $request->boolean('enabled');
        
        // Generate token if enabling and no token exists
        if ($shareEnabled && !$user->share_token) {
            $user->share_token = Str::random(32);
        }

        $user->share_enabled = $shareEnabled;
        $user->save();

        return back()->with('success', $shareEnabled 
            ? 'Birthday sharing enabled.' 
            : 'Birthday sharing disabled.');
    }

    /**
     * Regenerate the share token.
     */
    public function regenerateToken()
    {
        $user = Auth::user();
        $user->share_token = Str::random(32);
        $user->save();

        return back()->with('success', 'Share link regenerated.');
    }
}
