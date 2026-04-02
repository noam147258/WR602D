<?php

namespace App\Repository;

use App\Entity\GenerationUserContact;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<GenerationUserContact>
 */
class GenerationUserContactRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, GenerationUserContact::class);
    }

    /**
     * @return GenerationUserContact[]
     */
    public function findPendingIncomingForRecipient(User $recipient): array
    {
        return $this->createQueryBuilder('guc')
            ->innerJoin('guc.userContact', 'uc')
            ->innerJoin('guc.generation', 'gen')
            ->andWhere('uc.contactUser = :recipient')
            ->andWhere('guc.status = :st')
            ->setParameter('recipient', $recipient)
            ->setParameter('st', GenerationUserContact::STATUS_PENDING)
            ->orderBy('guc.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return GenerationUserContact[] Returns an array of GenerationUserContact objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('g.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?GenerationUserContact
    //    {
    //        return $this->createQueryBuilder('g')
    //            ->andWhere('g.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
