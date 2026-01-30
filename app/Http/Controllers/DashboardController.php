<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $contactsTotal = Contact::where('user_id', Auth::id())->count();
        $usersTotal = User::count();
        $birthdaysToday = Contact::query()
            ->where('user_id', Auth::id())
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            ->count();

        // Upcoming birthdays for the authenticated user (next 30 days)
        $contacts = Contact::query()
            ->where('user_id', Auth::id())
            ->get(['id', 'name', 'birthday', 'image']);

        $upcomingBirthdays = $contacts
            ->map(function ($contact) use ($today) {
                $birth = Carbon::parse($contact->birthday);

                // Handle leap-year birthdays by clamping to the month's max day for the target year
                $makeDateForYear = function (int $year) use ($birth) {
                    $daysInMonth = Carbon::create($year, $birth->month, 1)->daysInMonth;
                    $day = min($birth->day, $daysInMonth);
                    return Carbon::create($year, $birth->month, $day)->startOfDay();
                };

                $next = $makeDateForYear($today->year);
                if ($next->lt($today)) {
                    $next = $makeDateForYear($today->year + 1);
                }

                $daysLeft = $today->diffInDays($next, false);
                $ageTurning = $next->year - $birth->year;

                return [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'birthday' => $birth->toDateString(),
                    'nextBirthday' => $next->toDateString(),
                    'daysLeft' => $daysLeft,
                    'ageTurning' => $ageTurning,
                    'image_url' => $contact->image_url,
                ];
            })
            ->filter(fn ($b) => $b['daysLeft'] >= 0 && $b['daysLeft'] <= 30)
            ->sortBy('daysLeft')
            ->values()
            ->take(10);

        // Recently added contacts (last 5)
        $recentContacts = Contact::query()
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'name', 'email', 'image', 'created_at'])
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'image_url' => $contact->image_url,
                    'created_at' => $contact->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('dashboard', [
            'kpis' => [
                'contacts' => $contactsTotal,
                'users' => $usersTotal,
                'birthdaysToday' => $birthdaysToday,
            ],
            'upcomingBirthdays' => $upcomingBirthdays,
            'recentContacts' => $recentContacts,
        ]);
    }
}
