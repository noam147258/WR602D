<?php

namespace App\Tests\Entity;

use App\Entity\Generation;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class GenerationTest extends TestCase
{
    public function testGetterAndSetter(): void
    {
        $generation = new Generation();

        $file = 'uploads/pdf/document-123.pdf';
        $createdAt = new \DateTimeImmutable();
        $user = new User();

        $generation->setFile($file);
        $generation->setCreatedAt($createdAt);
        $generation->setUser($user);

        $this->assertSame($file, $generation->getFile());
        $this->assertSame($createdAt, $generation->getCreatedAt());
        $this->assertSame($user, $generation->getUser());
    }
}
