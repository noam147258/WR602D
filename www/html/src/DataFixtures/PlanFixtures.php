<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class PlanFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Plan FREE
        $planFree = new Plan();
        $planFree->setName('FREE');
        $planFree->setDescription('Plan gratuit avec limitations');
        $planFree->setLimitGeneration(2);
        $planFree->setRole('ROLE_FREE');
        $planFree->setPrice(0.00);
        $planFree->setActive(true);
        $planFree->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planFree);

        // Plan BASIC
        $planBasic = new Plan();
        $planBasic->setName('BASIC');
        $planBasic->setDescription('Plan basique avec plus de fonctionnalités');
        $planBasic->setLimitGeneration(10);
        $planBasic->setRole('ROLE_BASIC');
        $planBasic->setPrice(9.99);
        $planBasic->setActive(true);
        $planBasic->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planBasic);

        // Plan PREMIUM
        $planPremium = new Plan();
        $planPremium->setName('PREMIUM');
        $planPremium->setDescription('Plan premium avec accès illimité');
        $planPremium->setLimitGeneration(null); // null = illimité
        $planPremium->setRole('ROLE_PREMIUM');
        $planPremium->setPrice(29.99);
        $planPremium->setActive(true);
        $planPremium->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planPremium);

        $manager->flush();
    }
}
