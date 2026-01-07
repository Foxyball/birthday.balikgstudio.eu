<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        return Inertia::render('subscriptions/index');
    }

    public function createCheckoutSession(Request $request)
    {

        $request->validate([
            'price_id' => ['required', 'string'],
        ]);

        $allowedPriceIds = [
            config('cashier.prices.stripe_price_monthly'),
            config('cashier.prices.stripe_price_yearly'),
        ];

        if (! in_array($request->price_id, $allowedPriceIds)) {
            return response()->json(['error' => 'Invalid price ID'], 400);
        }

         return $request->user()
        ->newSubscription('default', '' . $request->price_id)
        ->checkout([
            'success_url' => route('checkout-success'),
            'cancel_url' => route('checkout-cancel'),
        ]);

    }

    public function stripeCheckoutSuccess()
    {
        return Inertia::render('subscriptions/success');
    }

    public function stripeCheckoutCancel()
    {
        return Inertia::render('subscriptions/cancel');
    }

    public function handleStripeWebhook()
    {
        return;
    }
}
