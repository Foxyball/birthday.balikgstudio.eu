<?php

use App\Http\Controllers\BirthdayShareController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Public birthday page (no auth required)
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

require __DIR__ . '/settings.php';
