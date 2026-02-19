<?php

namespace App\Tests\Entity;

use App\Entity\Plan;
use PHPUnit\Framework\TestCase;

class PlanTest extends TestCase
{
    public function testGetterAndSetter(): void
    {
        $plan = new Plan();

        $name = 'Premium';
        $description = 'Plan premium avec accès illimité';
        $limitGeneration = 100;
        $image = 'premium.png';
        $role = 'ROLE_PREMIUM';
        $price = '99.99';
        $specialPrice = '79.99';
        $specialPriceFrom = new \DateTime('2025-01-01');
        $specialPriceTo = new \DateTime('2025-12-31');
        $active = true;
        $createdAt = new \DateTimeImmutable();

        $plan->setName($name);
        $plan->setDescription($description);
        $plan->setLimitGeneration($limitGeneration);
        $plan->setImage($image);
        $plan->setRole($role);
        $plan->setPrice($price);
        $plan->setSpecialPrice($specialPrice);
        $plan->setSpecialPriceFrom($specialPriceFrom);
        $plan->setSpecialPriceTo($specialPriceTo);
        $plan->setActive($active);
        $plan->setCreatedAt($createdAt);

        $this->assertSame($name, $plan->getName());
        $this->assertSame($description, $plan->getDescription());
        $this->assertSame($limitGeneration, $plan->getLimitGeneration());
        $this->assertSame($image, $plan->getImage());
        $this->assertSame($role, $plan->getRole());
        $this->assertSame($price, $plan->getPrice());
        $this->assertSame($specialPrice, $plan->getSpecialPrice());
        $this->assertSame($specialPriceFrom, $plan->getSpecialPriceFrom());
        $this->assertSame($specialPriceTo, $plan->getSpecialPriceTo());
        $this->assertSame($active, $plan->isActive());
        $this->assertSame($createdAt, $plan->getCreatedAt());
    }
}
