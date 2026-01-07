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

    public function manage()
    {
        $user = Auth::user();
        $subscription = $user->subscription('default');

        $subscriptionData = null;

        if ($subscription) {
            $stripeSubscription = $subscription->asStripeSubscription();
            
            $subscriptionData = [
                'name' => $subscription->name,
                'stripe_status' => $subscription->stripe_status,
                'stripe_price' => $subscription->stripe_price,
                'quantity' => $subscription->quantity,
                'ends_at' => $subscription->ends_at?->toISOString(),
                'current_period_end' => $stripeSubscription->current_period_end 
                    ? \Carbon\Carbon::createFromTimestamp($stripeSubscription->current_period_end)->toISOString() 
                    : null,
                'trial_ends_at' => $subscription->trial_ends_at?->toISOString(),
                'on_grace_period' => $subscription->onGracePeriod(),
                'canceled' => $subscription->canceled(),
                'active' => $subscription->active(),
            ];
        }

        return Inertia::render('settings/subscription', [
            'subscription' => $subscriptionData,
        ]);
    }

    public function cancel(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription('default');

        if (!$subscription || !$subscription->active()) {
            return back()->withErrors(['subscription' => 'No active subscription found.']);
        }

        $subscription->cancel();

        return back()->with('success', 'Your subscription has been canceled. You can continue using Pro features until the end of your billing period.');
    }

    public function resume(Request $request)
    {
        $user = $request->user();
        $subscription = $user->subscription('default');

        if (!$subscription || !$subscription->onGracePeriod()) {
            return back()->withErrors(['subscription' => 'No canceled subscription to resume.']);
        }

        $subscription->resume();

        return back()->with('success', 'Your subscription has been resumed successfully!');
    }

}
