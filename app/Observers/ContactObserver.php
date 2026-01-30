<?php

namespace App\Observers;

use App\Models\Contact;
use App\Models\Notification;

class ContactObserver
{
    /**
     * Handle the Contact "created" event.
     */
    public function created(Contact $contact): void
    {
        Notification::createSuccessNotification(
            $contact->user_id,
            "Contact added: {$contact->name}",
            "You've successfully added a new contact.",
            "/contacts?search=" . urlencode($contact->name)
        );
    }
}
