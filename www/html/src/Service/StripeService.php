<?php

namespace App\Service;

use App\Entity\Plan;
use App\Entity\User;
use App\HttpClient\StripeStreamClient;
use Stripe\ApiRequestor;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    public function __construct(
        private string $secretKey,
        private string $webhookSecret,
        private string $checkoutMode = 'payment',
    ) {
        Stripe::setApiKey($this->secretKey);
        ApiRequestor::setHttpClient(new StripeStreamClient());
    }

    /**
     * Crée une Checkout Session Stripe pour le plan.
     * - mode "payment" : prix uniques (one-time) dans le Dashboard Stripe.
     * - mode "subscription" : prix récurrents (mensuel / annuel) uniquement.
     */
    public function createCheckoutSession(
        User $user,
        Plan $plan,
        string $successUrl,
        string $cancelUrl,
    ): string {
        $mode = strtolower(trim($this->checkoutMode)) === 'subscription' ? 'subscription' : 'payment';

        $meta = [
            'user_id' => (string) $user->getId(),
            'plan_id' => (string) $plan->getId(),
        ];

        $params = [
            'mode' => $mode,
            'customer_email' => $user->getEmail(),
            'line_items' => [[
                'price' => $plan->getStripePriceId(),
                'quantity' => 1,
            ]],
            'success_url' => $successUrl . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'metadata' => $meta,
        ];

        if ($mode === 'subscription') {
            $params['subscription_data'] = ['metadata' => $meta];
        }

        $session = Session::create($params);

        return $session->url;
    }

    /**
     * Récupère une session Checkout (ex. après redirection ?session_id=… sur /payment/success).
     */
    public function retrieveCheckoutSession(string $sessionId): Session
    {
        return Session::retrieve($sessionId);
    }

    public function constructWebhookEvent(string $payload, string $sigHeader): \Stripe\Event
    {
        return Webhook::constructEvent($payload, $sigHeader, $this->webhookSecret);
    }
}
