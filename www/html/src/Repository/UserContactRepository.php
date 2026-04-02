<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\UserContact;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserContact>
 */
class UserContactRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserContact::class);
    }

    /**
     * @return UserContact[]
     */
    public function findByOwnerOrdered(User $owner): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.user = :u')
            ->setParameter('u', $owner)
            ->orderBy('c.lastname', 'ASC')
            ->addOrderBy('c.firstname', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByOwnerAndEmail(User $owner, string $email): ?UserContact
    {
        $emailNorm = mb_strtolower(trim($email));

        return $this->createQueryBuilder('c')
            ->andWhere('c.user = :u')
            ->andWhere('LOWER(TRIM(c.email)) = :email')
            ->setParameter('u', $owner)
            ->setParameter('email', $emailNorm)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findOneByOwnerAndContactUser(User $owner, User $contactUser): ?UserContact
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.user = :u')
            ->andWhere('c.contactUser = :contact')
            ->setParameter('u', $owner)
            ->setParameter('contact', $contactUser)
            ->getQuery()
            ->getOneOrNullResult();
    }

    //    /**
    //     * @return UserContact[] Returns an array of UserContact objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?UserContact
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
