<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Notification;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Notify admins about new user registration
        $admins = User::where('role', '1')->where('id', '!=', $user->id)->get();
        
        foreach ($admins as $admin) {
            Notification::createInfoNotification(
                $admin->id,
                "New user registered: {$user->name}",
                "A new user has joined the platform.",
                "/users?search=" . urlencode($user->name)
            );
        }
    }
}
