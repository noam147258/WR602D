<?php

namespace App\Controller\Api;

use App\Entity\Generation;
use App\Entity\GenerationUserContact;
use App\Entity\User;
use App\Repository\GenerationRepository;
use App\Repository\GenerationUserContactRepository;
use App\Repository\PlanRepository;
use App\Repository\UserContactRepository;
use App\Service\PdfClient;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class PdfApiController extends AbstractController
{
    public function __construct(
        private readonly PdfClient $pdfClient,
        private readonly GenerationRepository $generationRepository,
        private readonly PlanRepository $planRepository,
        private readonly EntityManagerInterface $em,
        private readonly GenerationUserContactRepository $generationUserContacts,
        private readonly UserContactRepository $userContacts,
    ) {
    }

    #[Route('/api/pdf/generate-from-url', name: 'api_pdf_generate_from_url', methods: ['POST'])]
    public function generateFromUrl(Request $request): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérification du quota journalier en fonction du plan
        $planName = $user->getPlan() ?? 'free';
        $plan = $this->planRepository->findOneBy(['name' => $planName]);
        if (!$plan) {
            $plan = $this->planRepository->findOneBy(['name' => 'free']);
        }

        $limit = $plan?->getLimitGeneration();
        if ($limit !== null) {
            $todayStart = new DateTimeImmutable('today');

            // Reset éventuel du quota après un changement de plan
            $resetAt = $request->getSession()->get('quota_reset_at');
            if (is_string($resetAt)) {
                try {
                    $resetDate = new DateTimeImmutable($resetAt);
                    if ($resetDate > $todayStart) {
                        $todayStart = $resetDate;
                    }
                } catch (\Throwable) {
                    // Valeur invalide, on ignore
                }
            }

            $qb = $this->generationRepository->createQueryBuilder('g')
                ->select('COUNT(g.id)')
                ->where('g.user = :user')
                ->andWhere('g.created_at >= :today')
                ->setParameter('user', $user)
                ->setParameter('today', $todayStart);

            $countToday = (int) $qb->getQuery()->getSingleScalarResult();

            if ($countToday >= $limit) {
                return new JsonResponse(
                    [
                        'error' => "Vous avez atteint votre quota de conversions pour aujourd'hui avec votre plan \"{$planName}\".",
                        'remaining' => 0,
                    ],
                    Response::HTTP_TOO_MANY_REQUESTS
                );
            }
        }

        $payload = json_decode($request->getContent(), true);
        $url = $payload['url'] ?? null;

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            return new JsonResponse(['error' => 'URL invalide ou manquante'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->pdfClient->generatePdfFromUrl($url);
        } catch (\Throwable $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        $generation = new Generation();
        $generation->setUser($user);
        $generation->setFile($url);
        $generation->setCreatedAt(new DateTimeImmutable());
        $this->em->persist($generation);
        $this->em->flush();

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename=\"document.pdf\"',
        ]);
    }

    #[Route('/api/pdf/generations', name: 'api_pdf_generations', methods: ['GET'])]
    public function listGenerations(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $generations = $this->generationRepository->findBy(
            ['user' => $user],
            ['created_at' => 'DESC'],
            100
        );

        $items = array_map(static function (Generation $g) {
            return [
                'id' => $g->getId(),
                'url' => $g->getFile(),
                'createdAt' => $g->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ];
        }, $generations);

        return $this->json(['ok' => true, 'generations' => $items]);
    }

    #[Route('/api/pdf/generations/imported', name: 'api_pdf_generations_imported', methods: ['GET'])]
    public function listImportedGenerations(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $generations = $this->generationRepository->findImportedForUser($user);
        $items = array_map(fn (Generation $g) => $this->serializeImportedGeneration($g), $generations);

        return $this->json(['ok' => true, 'generations' => $items]);
    }

    /**
     * Régénère le PDF à partir de l’URL stockée, sans créer une nouvelle ligne (conversions importées).
     */
    #[Route('/api/pdf/generations/{id}/open', name: 'api_pdf_generation_open', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function openImportedGeneration(int $id): Response
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $generation = $this->generationRepository->find($id);
        if (!$generation || $generation->getUser()?->getId() !== $user->getId() || $generation->getSharedBy() === null) {
            return new JsonResponse(['error' => 'Conversion importée introuvable'], Response::HTTP_NOT_FOUND);
        }

        $url = $generation->getFile();
        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            return new JsonResponse(['error' => 'URL invalide'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->pdfClient->generatePdfFromUrl($url);
        } catch (\Throwable $e) {
            return new JsonResponse(
                ['error' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="document.pdf"',
        ]);
    }

    #[Route('/api/pdf/stats-today', name: 'api_pdf_stats_today', methods: ['GET'])]
    public function statsToday(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $planName = $user->getPlan() ?? 'free';
        $plan = $this->planRepository->findOneBy(['name' => $planName]);
        if (!$plan) {
            $plan = $this->planRepository->findOneBy(['name' => 'free']);
        }

        $limit = $plan?->getLimitGeneration();

        $todayStart = new DateTimeImmutable('today');

        // Prend en compte un éventuel reset de quota après changement de plan
        $resetAt = $request->getSession()->get('quota_reset_at');
        if (is_string($resetAt)) {
            try {
                $resetDate = new DateTimeImmutable($resetAt);
                if ($resetDate > $todayStart) {
                    $todayStart = $resetDate;
                }
            } catch (\Throwable) {
                // valeur invalide, on ignore
            }
        }

        $qb = $this->generationRepository->createQueryBuilder('g')
            ->select('COUNT(g.id)')
            ->where('g.user = :user')
            ->andWhere('g.created_at >= :today')
            ->setParameter('user', $user)
            ->setParameter('today', $todayStart);

        $countToday = (int) $qb->getQuery()->getSingleScalarResult();

        $percent = 0;
        if ($limit !== null && $limit > 0) {
            $percent = (int) min(100, round(($countToday / $limit) * 100));
        }

        return $this->json([
            'ok' => true,
            'countToday' => $countToday,
            'limit' => $limit,
            'remaining' => $limit === null ? null : max(0, $limit - $countToday),
            'percent' => $percent,
            'plan' => $planName,
        ]);
    }

    #[Route('/api/pdf/generations/{id}/share', name: 'api_pdf_generation_share', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function shareGeneration(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $generation = $this->generationRepository->find($id);
        if (!$generation || $generation->getUser()?->getId() !== $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Conversion introuvable'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $userContactId = (int) ($data['userContactId'] ?? 0);
        if ($userContactId <= 0) {
            return $this->json(['ok' => false, 'error' => 'Contact requis (userContactId)'], Response::HTTP_BAD_REQUEST);
        }

        $uc = $this->userContacts->find($userContactId);
        if (!$uc || $uc->getUser()?->getId() !== $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Contact introuvable'], Response::HTTP_NOT_FOUND);
        }

        $recipient = $uc->getContactUser();
        if (!$recipient) {
            return $this->json(['ok' => false, 'error' => 'Ce contact ne peut pas recevoir de partage'], Response::HTTP_BAD_REQUEST);
        }

        if ($recipient->getId() === $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Contact invalide'], Response::HTTP_BAD_REQUEST);
        }

        $existing = $this->generationUserContacts->findOneBy([
            'generation' => $generation,
            'userContact' => $uc,
        ]);

        if ($existing) {
            if ($existing->getStatus() === GenerationUserContact::STATUS_PENDING) {
                return $this->json(['ok' => false, 'error' => 'Cette conversion est déjà en attente chez ce contact'], Response::HTTP_CONFLICT);
            }
            if ($existing->getStatus() === GenerationUserContact::STATUS_ACCEPTED) {
                return $this->json(['ok' => false, 'error' => 'Cette conversion a déjà été partagée avec ce contact'], Response::HTTP_CONFLICT);
            }
            $existing
                ->setStatus(GenerationUserContact::STATUS_PENDING)
                ->setCreatedAt(new DateTimeImmutable());
            $this->em->flush();

            return $this->json([
                'ok' => true,
                'share' => ['id' => $existing->getId()],
            ], Response::HTTP_CREATED);
        }

        $guc = new GenerationUserContact();
        $guc
            ->setGeneration($generation)
            ->setUserContact($uc)
            ->setStatus(GenerationUserContact::STATUS_PENDING);

        $this->em->persist($guc);
        $this->em->flush();

        return $this->json([
            'ok' => true,
            'share' => ['id' => $guc->getId()],
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/pdf/shares/{shareId}/accept', name: 'api_pdf_share_accept', methods: ['POST'], requirements: ['shareId' => '\d+'])]
    public function acceptShare(int $shareId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $guc = $this->generationUserContacts->find($shareId);
        if (!$guc || $guc->getStatus() !== GenerationUserContact::STATUS_PENDING) {
            return $this->json(['ok' => false, 'error' => 'Partage introuvable'], Response::HTTP_NOT_FOUND);
        }

        $recipient = $guc->getUserContact()?->getContactUser();
        if (!$recipient || $recipient->getId() !== $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Partage introuvable'], Response::HTTP_NOT_FOUND);
        }

        $source = $guc->getGeneration();
        if (!$source || !$source->getFile()) {
            return $this->json(['ok' => false, 'error' => 'Conversion source invalide'], Response::HTTP_BAD_REQUEST);
        }

        $sender = $guc->getUserContact()?->getUser();

        $copy = new Generation();
        $copy
            ->setUser($user)
            ->setFile($source->getFile())
            ->setCreatedAt(new DateTimeImmutable());
        if ($sender) {
            $copy->setSharedBy($sender);
        }

        $guc->setStatus(GenerationUserContact::STATUS_ACCEPTED);

        $this->em->persist($copy);
        $this->em->flush();

        return $this->json([
            'ok' => true,
            'generation' => [
                'id' => $copy->getId(),
                'url' => $copy->getFile(),
                'createdAt' => $copy->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'sharedBy' => $sender ? [
                    'id' => $sender->getId(),
                    'email' => $sender->getEmail(),
                    'nom' => $sender->getLastname(),
                    'prenom' => $sender->getFirstname(),
                ] : null,
            ],
        ]);
    }

    #[Route('/api/pdf/shares/{shareId}/reject', name: 'api_pdf_share_reject', methods: ['POST'], requirements: ['shareId' => '\d+'])]
    public function rejectShare(int $shareId): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $guc = $this->generationUserContacts->find($shareId);
        if (!$guc || $guc->getStatus() !== GenerationUserContact::STATUS_PENDING) {
            return $this->json(['ok' => false, 'error' => 'Partage introuvable'], Response::HTTP_NOT_FOUND);
        }

        $recipient = $guc->getUserContact()?->getContactUser();
        if (!$recipient || $recipient->getId() !== $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Partage introuvable'], Response::HTTP_NOT_FOUND);
        }

        $guc->setStatus(GenerationUserContact::STATUS_REJECTED);
        $this->em->flush();

        return $this->json(['ok' => true]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeImportedGeneration(Generation $g): array
    {
        $s = $g->getSharedBy();

        return [
            'id' => $g->getId(),
            'url' => $g->getFile(),
            'createdAt' => $g->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'sharedBy' => $s ? [
                'id' => $s->getId(),
                'email' => $s->getEmail(),
                'nom' => $s->getLastname(),
                'prenom' => $s->getFirstname(),
            ] : null,
        ];
    }
}
