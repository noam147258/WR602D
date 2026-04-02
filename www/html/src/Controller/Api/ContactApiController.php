<?php

namespace App\Controller\Api;

use App\Entity\ContactRequest;
use App\Entity\GenerationUserContact;
use App\Entity\User;
use App\Entity\UserContact;
use App\Repository\ContactRequestRepository;
use App\Repository\GenerationUserContactRepository;
use App\Repository\UserContactRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/contacts')]
class ContactApiController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly UserContactRepository $contacts,
        private readonly ContactRequestRepository $contactRequests,
        private readonly GenerationUserContactRepository $generationUserContacts,
    ) {
    }

    #[Route('', name: 'api_contacts_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $contactItems = array_map(
            fn (UserContact $c) => $this->serializeContact($c),
            $this->contacts->findByOwnerOrdered($user)
        );

        $incoming = array_map(
            fn (ContactRequest $r) => $this->serializeIncomingRequest($r),
            $this->contactRequests->findPendingIncomingFor($user)
        );

        $outgoing = array_map(
            fn (ContactRequest $r) => $this->serializeOutgoingRequest($r),
            $this->contactRequests->findPendingOutgoingFor($user)
        );

        $incomingShares = array_map(
            fn (GenerationUserContact $guc) => $this->serializeIncomingShare($guc),
            $this->generationUserContacts->findPendingIncomingForRecipient($user)
        );

        return $this->json([
            'ok' => true,
            'contacts' => $contactItems,
            'incomingRequests' => $incoming,
            'outgoingPending' => $outgoing,
            'incomingShares' => $incomingShares,
        ]);
    }

    #[Route('', name: 'api_contacts_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $email = trim((string) ($data['email'] ?? ''));

        if ($email === '') {
            return $this->json(['ok' => false, 'error' => 'Email requis'], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['ok' => false, 'error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        $emailNorm = mb_strtolower($email);

        if (mb_strtolower((string) $user->getEmail()) === $emailNorm) {
            return $this->json(['ok' => false, 'error' => 'Vous ne pouvez pas vous ajouter comme contact'], Response::HTTP_BAD_REQUEST);
        }

        $other = $this->findUserByEmailNorm($emailNorm);
        if (!$other) {
            return $this->json(['ok' => false, 'error' => 'Aucun compte inscrit avec cet email'], Response::HTTP_NOT_FOUND);
        }

        if ($this->areAlreadyContacts($user, $other)) {
            return $this->json(['ok' => false, 'error' => 'Vous êtes déjà en contact avec cette personne'], Response::HTTP_CONFLICT);
        }

        // L’autre vous a déjà envoyé une demande en attente : acceptation automatique
        $theirRequest = $this->contactRequests->findOneByRequesterAndRecipient($other, $user);
        if ($theirRequest && $theirRequest->isPending()) {
            $this->finalizeAcceptance($theirRequest);
            $ucMine = $this->contacts->findOneByOwnerAndContactUser($user, $other);

            return $this->json([
                'ok' => true,
                'matched' => true,
                'message' => 'Demande acceptée : vous êtes maintenant en contact.',
                'contact' => $ucMine ? $this->serializeContact($ucMine) : null,
            ], Response::HTTP_CREATED);
        }

        $myRequest = $this->contactRequests->findOneByRequesterAndRecipient($user, $other);
        if ($myRequest) {
            if ($myRequest->isPending()) {
                return $this->json(['ok' => false, 'error' => 'Une demande est déjà en attente pour cette personne'], Response::HTTP_CONFLICT);
            }

            $myRequest
                ->setStatus(ContactRequest::STATUS_PENDING)
                ->setCreatedAt(new \DateTimeImmutable());
            $this->em->flush();

            return $this->json([
                'ok' => true,
                'request' => $this->serializeOutgoingRequest($myRequest),
            ], Response::HTTP_CREATED);
        }

        $cr = new ContactRequest();
        $cr
            ->setRequester($user)
            ->setRecipient($other)
            ->setStatus(ContactRequest::STATUS_PENDING);

        $this->em->persist($cr);
        $this->em->flush();

        return $this->json([
            'ok' => true,
            'request' => $this->serializeOutgoingRequest($cr),
        ], Response::HTTP_CREATED);
    }

    #[Route('/requests/{id}/accept', name: 'api_contacts_request_accept', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function acceptRequest(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $cr = $this->contactRequests->find($id);
        if (!$cr || $cr->getRecipient()?->getId() !== $user->getId() || !$cr->isPending()) {
            return $this->json(['ok' => false, 'error' => 'Demande introuvable'], Response::HTTP_NOT_FOUND);
        }

        $requester = $cr->getRequester();
        $this->finalizeAcceptance($cr);
        $uc = $requester ? $this->contacts->findOneByOwnerAndContactUser($user, $requester) : null;

        return $this->json([
            'ok' => true,
            'contact' => $uc ? $this->serializeContact($uc) : null,
        ]);
    }

    #[Route('/requests/{id}/reject', name: 'api_contacts_request_reject', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function rejectRequest(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $cr = $this->contactRequests->find($id);
        if (!$cr || $cr->getRecipient()?->getId() !== $user->getId() || !$cr->isPending()) {
            return $this->json(['ok' => false, 'error' => 'Demande introuvable'], Response::HTTP_NOT_FOUND);
        }

        $cr->setStatus(ContactRequest::STATUS_REJECTED);
        $this->em->flush();

        return $this->json(['ok' => true]);
    }

    /** Annule une demande envoyée encore en attente. */
    #[Route('/requests/{id}', name: 'api_contacts_request_cancel', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function cancelOutgoingRequest(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $cr = $this->contactRequests->find($id);
        if (!$cr || $cr->getRequester()?->getId() !== $user->getId() || !$cr->isPending()) {
            return $this->json(['ok' => false, 'error' => 'Demande introuvable'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($cr);
        $this->em->flush();

        return $this->json(['ok' => true]);
    }

    #[Route('/{id}', name: 'api_contacts_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $uc = $this->contacts->find($id);
        if (!$uc || $uc->getUser()?->getId() !== $user->getId()) {
            return $this->json(['ok' => false, 'error' => 'Contact introuvable'], Response::HTTP_NOT_FOUND);
        }

        $other = $uc->getContactUser();
        if ($other) {
            $this->removeContactsBothWays($user, $other);
        } else {
            $this->em->remove($uc);
        }

        $this->em->flush();

        return $this->json(['ok' => true]);
    }

    private function findUserByEmailNorm(string $emailNorm): ?User
    {
        return $this->users->createQueryBuilder('u')
            ->where('LOWER(u.email) = :e')
            ->setParameter('e', $emailNorm)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    private function areAlreadyContacts(User $a, User $b): bool
    {
        return $this->contacts->findOneByOwnerAndContactUser($a, $b) !== null
            || $this->contacts->findOneByOwnerAndContactUser($b, $a) !== null;
    }

    private function finalizeAcceptance(ContactRequest $cr): void
    {
        $requester = $cr->getRequester();
        $recipient = $cr->getRecipient();
        if (!$requester || !$recipient) {
            return;
        }

        $this->createAcceptedContacts($requester, $recipient);
        $this->em->remove($cr);
        $this->em->flush();
    }

    private function createAcceptedContacts(User $a, User $b): void
    {
        if (!$this->contacts->findOneByOwnerAndContactUser($a, $b)) {
            $uca = new UserContact();
            $uca
                ->setUser($a)
                ->setContactUser($b)
                ->setFirstname((string) $b->getFirstname())
                ->setLastname((string) $b->getLastname())
                ->setEmail((string) $b->getEmail());
            $this->em->persist($uca);
        }

        if (!$this->contacts->findOneByOwnerAndContactUser($b, $a)) {
            $ucb = new UserContact();
            $ucb
                ->setUser($b)
                ->setContactUser($a)
                ->setFirstname((string) $a->getFirstname())
                ->setLastname((string) $a->getLastname())
                ->setEmail((string) $a->getEmail());
            $this->em->persist($ucb);
        }
    }

    private function removeContactsBothWays(User $a, User $b): void
    {
        $x = $this->contacts->findOneByOwnerAndContactUser($a, $b);
        $y = $this->contacts->findOneByOwnerAndContactUser($b, $a);
        if ($x) {
            $this->em->remove($x);
        }
        if ($y) {
            $this->em->remove($y);
        }

        $req1 = $this->contactRequests->findOneByRequesterAndRecipient($a, $b);
        $req2 = $this->contactRequests->findOneByRequesterAndRecipient($b, $a);
        if ($req1) {
            $this->em->remove($req1);
        }
        if ($req2) {
            $this->em->remove($req2);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeContact(UserContact $c): array
    {
        $linked = $c->getContactUser();

        return [
            'id' => $c->getId(),
            'email' => $c->getEmail(),
            'nom' => $c->getLastname(),
            'prenom' => $c->getFirstname(),
            'photo' => $linked?->getPhoto(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeUserBrief(User $u): array
    {
        return [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'nom' => $u->getLastname(),
            'prenom' => $u->getFirstname(),
            'photo' => $u->getPhoto(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeIncomingRequest(ContactRequest $r): array
    {
        $req = $r->getRequester();

        return [
            'id' => $r->getId(),
            'createdAt' => $r->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'requester' => $req ? $this->serializeUserBrief($req) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeOutgoingRequest(ContactRequest $r): array
    {
        $rec = $r->getRecipient();

        return [
            'id' => $r->getId(),
            'createdAt' => $r->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'recipient' => $rec ? $this->serializeUserBrief($rec) : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeIncomingShare(GenerationUserContact $guc): array
    {
        $uc = $guc->getUserContact();
        $gen = $guc->getGeneration();
        $sender = $uc?->getUser();

        return [
            'id' => $guc->getId(),
            'createdAt' => $guc->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'generation' => [
                'id' => $gen?->getId(),
                'url' => $gen?->getFile(),
                'createdAt' => $gen?->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ],
            'sender' => $sender ? $this->serializeUserBrief($sender) : null,
        ];
    }
}
