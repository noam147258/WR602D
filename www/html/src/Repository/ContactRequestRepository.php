<?php

namespace App\Repository;

use App\Entity\ContactRequest;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ContactRequest>
 */
class ContactRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContactRequest::class);
    }

    public function findOneByRequesterAndRecipient(User $requester, User $recipient): ?ContactRequest
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.requester = :req')
            ->andWhere('r.recipient = :rec')
            ->setParameter('req', $requester)
            ->setParameter('rec', $recipient)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return ContactRequest[]
     */
    public function findPendingIncomingFor(User $recipient): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.recipient = :u')
            ->andWhere('r.status = :st')
            ->setParameter('u', $recipient)
            ->setParameter('st', ContactRequest::STATUS_PENDING)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return ContactRequest[]
     */
    public function findPendingOutgoingFor(User $requester): array
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.requester = :u')
            ->andWhere('r.status = :st')
            ->setParameter('u', $requester)
            ->setParameter('st', ContactRequest::STATUS_PENDING)
            ->orderBy('r.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
