<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\PlanRepository;
use App\Repository\UserRepository;
use App\Service\StripeService;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/payment')]
class PaymentController extends AbstractController
{
    /**
     * Crée une Checkout Session Stripe et redirige l'utilisateur vers Stripe.
     * {name} = identifiant du plan (ex: basic, basic+, premium).
     */
    #[IsGranted('ROLE_USER')]
    #[Route('/checkout/{name}', name: 'app_payment_checkout', requirements: ['name' => '.+'])]
    public function checkout(
        string $name,
        PlanRepository $planRepository,
        StripeService $stripeService,
    ): Response {
        $name = trim($name);

        $plan = $planRepository->findOneBy(['name' => $name])
            ?? $planRepository->findOneBy(['name' => strtoupper($name)]);

        if (!$plan) {
            return $this->redirectWithError('Plan introuvable.');
        }

        if ($plan->getStripePriceId() === null || $plan->getStripePriceId() === '') {
            return $this->redirectWithError('Ce plan est gratuit, aucun paiement requis.');
        }

        $successUrl = $this->generateUrl(
            'app_payment_success',
            [],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
        $cancelUrl = $this->generateUrl(
            'app_payment_cancel',
            [],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        try {
            $checkoutUrl = $stripeService->createCheckoutSession(
                $this->getUser(),
                $plan,
                $successUrl,
                $cancelUrl,
            );
        } catch (\Throwable $e) {
            $debug = sprintf('[Stripe] %s', $e->getMessage());
            return $this->redirectWithError($debug);
        }

        return $this->redirect($checkoutUrl);
    }

    private function redirectWithError(string $message): RedirectResponse
    {
        $frontendUrl = $this->getParameter('frontend_url');
        $frontendUrl = is_string($frontendUrl) ? trim($frontendUrl) : '';
        if ($frontendUrl !== '') {
            $url = rtrim($frontendUrl, '/') . '/plans?payment_error=' . rawurlencode($message);
            return new RedirectResponse($url);
        }
        $this->addFlash('error', $message);
        return $this->redirectToRoute('app_home');
    }

    /**
     * Page affichée après un paiement réussi.
     * Met à jour le plan depuis la session Stripe (?session_id=) car le webhook n’est pas toujours disponible en local.
     */
    #[Route('/success', name: 'app_payment_success')]
    public function success(
        Request $request,
        StripeService $stripeService,
        UserRepository $userRepository,
        PlanRepository $planRepository,
        EntityManagerInterface $em,
    ): Response {
        $planSynced = false;
        $sessionId = $request->query->get('session_id');
        $user = $this->getUser();

        if ($sessionId && $user instanceof User) {
            try {
                $checkout = $stripeService->retrieveCheckoutSession($sessionId);
                if ($checkout->status === 'complete' && $this->isCheckoutSessionPaid($checkout)) {
                    $userId = $checkout->metadata->user_id ?? null;
                    $planId = $checkout->metadata->plan_id ?? null;
                    if ($userId && $planId && (int) $userId === $user->getId()) {
                        $dbUser = $userRepository->find((int) $userId);
                        $plan = $planRepository->find((int) $planId);
                        if ($dbUser && $plan) {
                            $request->getSession()->set(
                                'quota_reset_at',
                                (new DateTimeImmutable())->format(\DateTimeInterface::ATOM)
                            );
                            $dbUser->setPlan($plan->getName());
                            $em->flush();
                            $planSynced = true;
                        }
                    }
                }
            } catch (\Throwable) {
            }
        }

        return $this->render('payment/success.html.twig', [
            'frontend_url' => $this->getParameter('frontend_url'),
            'plan_synced' => $planSynced,
        ]);
    }

    private function isCheckoutSessionPaid(\Stripe\Checkout\Session $session): bool
    {
        $status = $session->payment_status ?? '';
        if ($session->mode === 'subscription') {
            return in_array($status, ['paid', 'no_payment_required'], true);
        }

        return $status === 'paid';
    }

    /**
     * Page affichée si l'utilisateur annule le paiement.
     */
    #[Route('/cancel', name: 'app_payment_cancel')]
    public function cancel(): Response
    {
        return $this->render('payment/cancel.html.twig', [
            'frontend_url' => $this->getParameter('frontend_url'),
        ]);
    }
}
