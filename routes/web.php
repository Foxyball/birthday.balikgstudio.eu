<?php

use App\Http\Controllers\BirthdayShareController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SocialAuthLoginController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Stripe webhook
Route::post('stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])->name('cashier.webhook');

// Public birthday page
Route::get('birthday/{token}', [BirthdayShareController::class, 'show'])->name('birthday.public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Birthday sharing settings
    Route::post('birthday-share/toggle', [BirthdayShareController::class, 'toggle'])->name('birthday-share.toggle');
    Route::post('birthday-share/regenerate', [BirthdayShareController::class, 'regenerateToken'])->name('birthday-share.regenerate');
});

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::resource('categories', CategoryController::class);
    Route::resource('users', UserController::class)->except(['destroy', 'show']);
    Route::patch('users/{user}/toggle-lock', [UserController::class, 'toggleLock'])->name('users.toggle-lock');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('contacts', ContactController::class);
    Route::patch('contacts/{contact}/toggle-status', [ContactController::class, 'toggleStatus'])->name('contacts.toggle-status');
    Route::get('contacts-import/template', [ContactController::class, 'importTemplate'])->name('contacts.import.template');
    Route::post('contacts-import', [ContactController::class, 'import'])->name('contacts.import');
    Route::get('contacts-export', [ContactController::class, 'export'])->name('contacts.export');
});

Route::middleware(['auth','verified'])->group(function () {
    Route::prefix('subscription')->group(function () {
        Route::get('/plans', [SubscriptionController::class, 'index'])->name('subscription.index');
        Route::post('/create-checkout-session', [SubscriptionController::class, 'createCheckoutSession'])->name('create-checkout-session');
        Route::get('/checkout/success', [SubscriptionController::class,'stripeCheckoutSuccess'])->name('checkout-success');
        Route::get('/checkout/cancel', [SubscriptionController::class,'stripeCheckoutCancel'])->name('checkout-cancel');
        Route::post('/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
        Route::post('/resume', [SubscriptionController::class, 'resume'])->name('subscription.resume');
    });
});

// Socialite routes
Route::get('/auth/google/redirect', [SocialAuthLoginController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('/auth/google/callback', [SocialAuthLoginController::class, 'handleGoogleCallback'])->name('google.callback');

require __DIR__ . '/settings.php';
