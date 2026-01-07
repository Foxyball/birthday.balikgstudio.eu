<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Cashier\Http\Controllers\WebhookController;

class StripeWebhookController extends WebhookController
{
    /**
     * Handle a Stripe webhook for subscription created.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionCreated(array $payload)
    {
        // Let Cashier create the subscription first
        parent::handleCustomerSubscriptionCreated($payload);
        
        // Then unlock user contacts
        $this->unlockUserContacts($payload);
        
        return $this->successMethod();
    }

    /**
     * Handle a Stripe webhook for subscription updated.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionUpdated(array $payload)
    {
        // Let Cashier update the subscription first
        parent::handleCustomerSubscriptionUpdated($payload);
        
        $subscription = $payload['data']['object'];
        $status = $subscription['status'];

        // If subscription is active, unlock contacts
        if (in_array($status, ['active', 'trialing'])) {
            $this->unlockUserContacts($payload);
        }
        // If subscription is canceled, expired, or unpaid, lock contacts
        elseif (in_array($status, ['canceled', 'unpaid', 'past_due', 'incomplete_expired'])) {
            $this->lockUserContacts($payload);
        }

        return $this->successMethod();
    }

    /**
     * Handle a Stripe webhook for subscription deleted.
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCustomerSubscriptionDeleted(array $payload)
    {
        // Let Cashier handle the deletion first
        parent::handleCustomerSubscriptionDeleted($payload);
        
        // Then lock user contacts
        $this->lockUserContacts($payload);
        
        return $this->successMethod();
    }

    /**
     * Handle checkout session completed event.
     * This fires immediately when payment succeeds, before subscription.created
     *
     * @param  array  $payload
     * @return \Symfony\Component\HttpFoundation\Response
     */
    protected function handleCheckoutSessionCompleted(array $payload)
    {
        $session = $payload['data']['object'];
        
        // Only process if this was for a subscription
        if ($session['mode'] === 'subscription' && isset($session['customer'])) {
            $this->unlockUserContactsByCustomerId($session['customer']);
        }
        
        return $this->successMethod();
    }

    /**
     * Unlock all locked contacts for the user.
     *
     * @param  array  $payload
     * @return void
     */
    protected function unlockUserContacts(array $payload)
    {
        $user = $this->getUserByStripeId($payload['data']['object']['customer']);
        
        if ($user) {
            $user->contacts()
                ->where('is_locked', true)
                ->update([
                    'is_locked' => false,
                    'locked_at' => null,
                ]);
        }
    }

    /**
     * Unlock all locked contacts for the user by customer ID.
     *
     * @param  string  $customerId
     * @return void
     */
    protected function unlockUserContactsByCustomerId(string $customerId)
    {
        $user = $this->getUserByStripeId($customerId);
        
        if ($user) {
            $user->contacts()
                ->where('is_locked', true)
                ->update([
                    'is_locked' => false,
                    'locked_at' => null,
                ]);
        }
    }

    /**
     * Lock contacts exceeding the free tier limit (20 contacts).
     *
     * @param  array  $payload
     * @return void
     */
    protected function lockUserContacts(array $payload)
    {
        $user = $this->getUserByStripeId($payload['data']['object']['customer']);
        
        if (!$user) {
            return;
        }

        // Admins have unlimited contacts
        if ($user->role === 1) {
            return;
        }

        // If user has more than 20 contacts, lock the newest ones (by ID desc)
        $totalContacts = $user->contacts()->count();
        
        if ($totalContacts > 20) {
            $contactsToLock = $user->contacts()
                ->orderBy('id', 'desc')
                ->skip(20) // Keep the oldest 20 contacts
                ->pluck('id');

            $user->contacts()
                ->whereIn('id', $contactsToLock)
                ->update([
                    'is_locked' => true,
                    'locked_at' => now(),
                ]);
        }
    }

}
