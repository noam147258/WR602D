<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    private const FIREWALL_NAME = 'main';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly TokenStorageInterface $tokenStorage,
    ) {
    }

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($email === '' || $password === '') {
            return $this->json(['ok' => false, 'error' => 'Email et mot de passe sont obligatoires'], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['ok' => false, 'error' => 'Email invalide'], Response::HTTP_BAD_REQUEST);
        }

        if ($this->users->findOneBy(['email' => $email])) {
            return $this->json(['ok' => false, 'error' => 'Un compte existe déjà avec cet email'], Response::HTTP_CONFLICT);
        }

        if (strlen($password) < 4) {
            return $this->json(['ok' => false, 'error' => 'Le mot de passe doit contenir au moins 4 caractères'], Response::HTTP_BAD_REQUEST);
        }

        $planId = (string) ($data['planId'] ?? 'free');

        $user = new User();
        $user
            ->setEmail($email)
            ->setPassword(password_hash($password, PASSWORD_DEFAULT))
            ->setLastname((string) ($data['nom'] ?? ''))
            ->setFirstname((string) ($data['prenom'] ?? ''))
            ->setPlan($planId !== '' ? $planId : 'free')
            ->setFavoriteColor($data['couleurPref'] ?? null)
            ->setPhone($data['telephone'] ?? null);

        if (!empty($data['dateNaissance'])) {
            try {
                $user->setDob(new DateTime($data['dateNaissance']));
            } catch (\Throwable) {
                // ignore invalid date, keep null
            }
        }

        if (!empty($data['photo'])) {
            $photo = (string) $data['photo'];
            // Avoid DB errors if the base64/data URL is too long for our VARCHAR column.
            if (\strlen($photo) <= 250) {
                $user->setPhoto($photo);
            }
        }

        $this->em->persist($user);
        $this->em->flush();

        $this->loginUser($request, $user);

        return $this->json([
            'ok' => true,
            'user' => $this->serializeUser($user),
        ], Response::HTTP_CREATED);
    }

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $emailOrName = trim((string) ($data['identifier'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($emailOrName === '' || $password === '') {
            return $this->json(['ok' => false, 'error' => 'Identifiant et mot de passe sont obligatoires'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->users->findOneBy(['email' => $emailOrName]);
        if (!$user) {
            // try by name "prenom nom"
            $qb = $this->users->createQueryBuilder('u');
            $qb
                ->where($qb->expr()->like('LOWER(CONCAT(u.firstname, \' \', u.lastname))', ':q'))
                ->setParameter('q', '%' . mb_strtolower($emailOrName) . '%')
                ->setMaxResults(1);
            $user = $qb->getQuery()->getOneOrNullResult();
        }

        if (!$user || !password_verify($password, (string) $user->getPassword())) {
            return $this->json(['ok' => false, 'error' => 'Email / nom ou mot de passe incorrect'], Response::HTTP_UNAUTHORIZED);
        }

        $request->getSession()->migrate(true);
        $this->loginUser($request, $user);

        return $this->json([
            'ok' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $id = $session->get('user_id');
        if (!$id) {
            return $this->json(['ok' => false, 'user' => null], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->users->find($id);
        if (!$user) {
            $session->remove('user_id');
            return $this->json(['ok' => false, 'user' => null], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'ok' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $this->tokenStorage->setToken(null);
        $request->getSession()->invalidate();

        return $this->json(['ok' => true]);
    }

    #[Route('/account', name: 'api_auth_delete_account', methods: ['DELETE'])]
    public function deleteAccount(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $id = $session->get('user_id');
        if (!$id) {
            return $this->json(['ok' => false, 'error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->users->find($id);
        if (!$user) {
            $session->remove('user_id');
            return $this->json(['ok' => false, 'error' => 'Utilisateur introuvable'], Response::HTTP_UNAUTHORIZED);
        }

        $this->em->remove($user);
        $this->em->flush();

        $this->tokenStorage->setToken(null);
        $request->getSession()->invalidate();

        return $this->json(['ok' => true]);
    }

    #[Route('/profile', name: 'api_auth_update_profile', methods: ['PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $id = $session->get('user_id');
        if (!$id) {
            return $this->json(['ok' => false, 'error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->users->find($id);
        if (!$user) {
            $session->remove('user_id');
            return $this->json(['ok' => false, 'error' => 'Utilisateur introuvable'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        $email = trim((string) ($data['email'] ?? ''));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $existing = $this->users->findOneBy(['email' => $email]);
            if ($existing && $existing->getId() !== $user->getId()) {
                return $this->json(['ok' => false, 'error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
            }
            $user->setEmail($email);
        }

        if (isset($data['nom'])) {
            $user->setLastname((string) $data['nom']);
        }
        if (isset($data['prenom'])) {
            $user->setFirstname((string) $data['prenom']);
        }
        if (isset($data['couleurPref'])) {
            $user->setFavoriteColor($data['couleurPref'] ? (string) $data['couleurPref'] : null);
        }
        if (isset($data['telephone'])) {
            $user->setPhone($data['telephone'] ? (string) $data['telephone'] : null);
        }
        if (isset($data['photo'])) {
            $photo = (string) $data['photo'];
            $user->setPhoto(\strlen($photo) <= 250 ? $photo : null);
        }
        if (!empty($data['dateNaissance'])) {
            try {
                $user->setDob(new DateTime($data['dateNaissance']));
            } catch (\Throwable) {
                $user->setDob(null);
            }
        } elseif (array_key_exists('dateNaissance', $data) && ($data['dateNaissance'] === '' || $data['dateNaissance'] === null)) {
            $user->setDob(null);
        }

        if (!empty($data['password']) && strlen((string) $data['password']) >= 4) {
            $user->setPassword(password_hash((string) $data['password'], PASSWORD_DEFAULT));
        }

        $this->em->flush();

        return $this->json([
            'ok' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    #[Route('/plan', name: 'api_auth_change_plan', methods: ['POST'])]
    public function changePlan(Request $request): JsonResponse
    {
        $session = $request->getSession();
        $id = $session->get('user_id');
        if (!$id) {
            return $this->json(['ok' => false, 'error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->users->find($id);
        if (!$user) {
            $session->remove('user_id');
            return $this->json(['ok' => false, 'error' => 'Utilisateur introuvable'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $planId = trim((string) ($data['planId'] ?? ''));
        if ($planId === '') {
            return $this->json(['ok' => false, 'error' => 'Plan invalide'], Response::HTTP_BAD_REQUEST);
        }

        // En changeant de plan, on réinitialise le compteur de conversions
        $session->set('quota_reset_at', (new DateTimeImmutable())->format(\DateTimeInterface::ATOM));

        $user->setPlan($planId);
        $this->em->flush();

        return $this->json([
            'ok' => true,
            'user' => $this->serializeUser($user),
        ]);
    }

    private function loginUser(Request $request, User $user): void
    {
        $token = new UsernamePasswordToken($user, self::FIREWALL_NAME, $user->getRoles());
        $this->tokenStorage->setToken($token);
        $request->getSession()->set('_security_' . self::FIREWALL_NAME, serialize($token));
        $request->getSession()->set('user_id', $user->getId());
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'planId' => $user->getPlan(),
            'nom' => $user->getLastname(),
            'prenom' => $user->getFirstname(),
            'dateNaissance' => $user->getDob()?->format('Y-m-d'),
            'photo' => $user->getPhoto(),
            'couleurPref' => $user->getFavoriteColor(),
            'telephone' => $user->getPhone(),
        ];
    }
}

