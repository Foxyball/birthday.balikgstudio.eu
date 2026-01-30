<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Contact;
use App\Models\User;
use App\Observers\CategoryObserver;
use App\Observers\ContactObserver;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS URLs when APP_URL uses HTTPS
        if (config('app.url') && str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // Enable automatic tax calculation for Cashier
        Cashier::calculateTaxes();

        // Register observers
        Contact::observe(ContactObserver::class);
        Category::observe(CategoryObserver::class);
        User::observe(UserObserver::class);
    }
}
