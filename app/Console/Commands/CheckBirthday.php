<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\BirthdayReminderMail;
use Carbon\Carbon;

class CheckBirthday extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-birthday';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Daily at 9:00 AM, check for contacts with birthdays today and send notification emails to the user.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        $contacts = Contact::query()
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            ->get();

        if ($contacts->isEmpty()) {
            $this->info('No birthdays today.');
            return 0;
        }

        $grouped = $contacts->groupBy('user_id');

        foreach ($grouped as $userId => $userContacts) {
            $user = User::find($userId);
            if (!$user || empty($user->email)) {
                $this->warn("Skipping user {$userId}: missing record or email.");
                continue;
            }

            $list = $userContacts->map(function (Contact $c) use ($today) {
                $birthday = Carbon::parse($c->birthday);
                return [
                    'name' => $c->name,
                    'date' => $birthday->toFormattedDateString(), // e.g., Dec 23, 2025
                    'age' => $birthday->age, // age as of today
                ];
            })->values()->all();

            Mail::to($user->email)->send(new BirthdayReminderMail($user, $list, $today));
            $this->info("Sent birthday reminder to {$user->email} for " . count($list) . ' contact(s).');
        }

        return 0;
    }
}
