<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Cashier\Cashier;

class SubscriptionController extends Controller
{
    public function index()
    {
        $monthlyPriceId = config('cashier.prices.stripe_price_monthly');
        $yearlyPriceId = config('cashier.prices.stripe_price_yearly');

        $stripe = Cashier::stripe();
        
        // Fetch price details from Stripe
        $monthlyPrice = null;
        $yearlyPrice = null;

            if ($monthlyPriceId) {
                $monthlyStripePrice = $stripe->prices->retrieve($monthlyPriceId);
                $monthlyPrice = [
                    'id' => $monthlyPriceId,
                    'amount' => $monthlyStripePrice->unit_amount / 100, // Convert from cents
                    'currency' => strtoupper($monthlyStripePrice->currency),
                    'interval' => $monthlyStripePrice->recurring->interval ?? 'month',
                ];
            }

            if ($yearlyPriceId) {
                $yearlyStripePrice = $stripe->prices->retrieve($yearlyPriceId);
                $yearlyPrice = [
                    'id' => $yearlyPriceId,
                    'amount' => $yearlyStripePrice->unit_amount / 100, // Convert from cents
                    'currency' => strtoupper($yearlyStripePrice->currency),
                    'interval' => $yearlyStripePrice->recurring->interval ?? 'year',
                ];
            }

        return Inertia::render('subscriptions/index', [
            'prices' => [
                'monthly' => $monthlyPrice,
                'yearly' => $yearlyPrice,
            ],
        ]);
    }

    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'price_id' => ['required', 'string'],
        ]);

        $allowedPriceIds = array_filter([
            config('cashier.prices.stripe_price_monthly'),
            config('cashier.prices.stripe_price_yearly'),
        ]);

        if (! in_array($request->price_id, $allowedPriceIds, true)) {
            return response()->json(['error' => 'Invalid price ID'], 400);
        }

        try {
            $checkout = $request->user()
                ->newSubscription('default', $request->price_id)
                ->checkout([
                    'success_url' => route('checkout-success'),
                    'cancel_url' => route('checkout-cancel'),
                    'customer_update' => [
                        'address' => 'auto',
                    ],
                ]);

            return response()->json([
                'url' => $checkout->url,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to create checkout session: ' . $e->getMessage()
            ], 500);
        }
    }

    public function stripeCheckoutSuccess()
    {
        return Inertia::render('subscriptions/success');
    }

    public function stripeCheckoutCancel()
    {
        return Inertia::render('subscriptions/cancel');
    }

}
