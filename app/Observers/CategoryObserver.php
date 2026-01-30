<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class CategoryObserver
{
    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        // Only create notification if there's an authenticated user
        if (Auth::check()) {
            Notification::createSuccessNotification(
                Auth::id(),
                "Category added: {$category->name}",
                "You've successfully created a new category.",
                "/categories?search=" . urlencode($category->name)
            );
        }
    }
}
