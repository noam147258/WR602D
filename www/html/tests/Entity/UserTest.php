<?php

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testGetterAndSetter(): void
    {
        $user = new User();

        $email = 'test@test.com';
        $password = 'hashedpassword';
        $lastname = 'Dupont';
        $firstname = 'Jean';
        $dob = new \DateTime('1990-05-15');
        $photo = 'photo.jpg';
        $favoriteColor = 'blue';
        $phone = '0612345678';

        $user->setEmail($email);
        $user->setPassword($password);
        $user->setLastname($lastname);
        $user->setFirstname($firstname);
        $user->setDob($dob);
        $user->setPhoto($photo);
        $user->setFavoriteColor($favoriteColor);
        $user->setPhone($phone);

        $this->assertSame($email, $user->getEmail());
        $this->assertSame($password, $user->getPassword());
        $this->assertSame($lastname, $user->getLastname());
        $this->assertSame($firstname, $user->getFirstname());
        $this->assertSame($dob, $user->getDob());
        $this->assertSame($photo, $user->getPhoto());
        $this->assertSame($favoriteColor, $user->getFavoriteColor());
        $this->assertSame($phone, $user->getPhone());
    }
}
