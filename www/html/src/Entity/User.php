<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $lastname = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $dob = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $photo = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $favorite_color = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $plan = null;

    /**
     * @var Collection<int, UserContact>
     */
    #[ORM\OneToMany(targetEntity: UserContact::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $userContacts;

    /**
     * @var Collection<int, Generation>
     */
    #[ORM\OneToMany(targetEntity: Generation::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $generations;

    public function __construct()
    {
        $this->userContacts = new ArrayCollection();
        $this->generations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @return list<string>
     */
    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function eraseCredentials(): void
    {
        // Clear temporary or sensitive data if any; password is already hashed in DB.
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getDob(): ?\DateTime
    {
        return $this->dob;
    }

    public function setDob(?\DateTime $dob): static
    {
        $this->dob = $dob;

        return $this;
    }

    public function getPhoto(): ?string
    {
        return $this->photo;
    }

    public function setPhoto(?string $photo): static
    {
        $this->photo = $photo;

        return $this;
    }

    public function getFavoriteColor(): ?string
    {
        return $this->favorite_color;
    }

    public function setFavoriteColor(?string $favorite_color): static
    {
        $this->favorite_color = $favorite_color;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getPlan(): ?string
    {
        return $this->plan;
    }

    public function setPlan(?string $plan): static
    {
        $this->plan = $plan;

        return $this;
    }

    /**
     * @return Collection<int, UserContact>
     */
    public function getUserContacts(): Collection
    {
        return $this->userContacts;
    }

    public function addUserContact(UserContact $userContact): static
    {
        if (!$this->userContacts->contains($userContact)) {
            $this->userContacts->add($userContact);
            $userContact->setUser($this);
        }

        return $this;
    }

    public function removeUserContact(UserContact $userContact): static
    {
        if ($this->userContacts->removeElement($userContact)) {
            // set the owning side to null (unless already changed)
            if ($userContact->getUser() === $this) {
                $userContact->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Generation>
     */
    public function getGenerations(): Collection
    {
        return $this->generations;
    }

    public function addGeneration(Generation $generation): static
    {
        if (!$this->generations->contains($generation)) {
            $this->generations->add($generation);
            $generation->setUser($this);
        }

        return $this;
    }

    public function removeGeneration(Generation $generation): static
    {
        if ($this->generations->removeElement($generation)) {
            // set the owning side to null (unless already changed)
            if ($generation->getUser() === $this) {
                $generation->setUser(null);
            }
        }

        return $this;
    }
}
