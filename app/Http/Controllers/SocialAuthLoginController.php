<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthLoginController extends Controller
{
    public function redirectToGoogle()
    {
         return Socialite::driver('google')->redirect();
    }

     public function handleGoogleCallback()
    {
        $user = Socialite::driver('google')->user();
        $existingUser = User::where('email', $user->getEmail())->first();
        
       if ($existingUser) {
            Auth::login($existingUser);
        } else {
            $newUser = User::create([
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'email_verified_at' => now(),
            ]);

            Auth::login($newUser);
        }

        return redirect()->route('dashboard');
    }
}
