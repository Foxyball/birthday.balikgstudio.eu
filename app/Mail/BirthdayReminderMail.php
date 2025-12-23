<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class BirthdayReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $contacts, // [ ['name' => string, 'date' => string, 'age' => int], ... ]
        public Carbon $today
    ) {}

    public function build()
    {
        return $this
            ->subject('Birthday Reminder')
            ->view('emails.birthday-reminder')
            ->with([
                'user' => $this->user,
                'contacts' => $this->contacts,
                'today' => $this->today,
            ]);
    }
}
