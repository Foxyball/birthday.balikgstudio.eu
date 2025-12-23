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
        $contactsTotal = Contact::count();
        $usersTotal = User::count();
        $birthdaysToday = Contact::query()
            ->where('user_id', Auth::id())
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            ->count();

        return Inertia::render('dashboard', [
            'kpis' => [
                'contacts' => $contactsTotal,
                'users' => $usersTotal,
                'birthdaysToday' => $birthdaysToday,
            ],
        ]);
    }
}
