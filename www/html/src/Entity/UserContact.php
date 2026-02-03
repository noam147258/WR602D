<?php

namespace App\Entity;

use App\Repository\UserContactRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserContactRepository::class)]
class UserContact
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $lastname = null;

    #[ORM\Column(length: 255)]
    private ?string $firstname = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\ManyToOne(inversedBy: 'userContacts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /**
     * @var Collection<int, GenerationUserContact>
     */
    #[ORM\OneToMany(targetEntity: GenerationUserContact::class, mappedBy: 'userContact')]
    private Collection $generationUserContacts;

    public function __construct()
    {
        $this->generationUserContacts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, GenerationUserContact>
     */
    public function getGenerationUserContacts(): Collection
    {
        return $this->generationUserContacts;
    }

    public function addGenerationUserContact(GenerationUserContact $generationUserContact): static
    {
        if (!$this->generationUserContacts->contains($generationUserContact)) {
            $this->generationUserContacts->add($generationUserContact);
            $generationUserContact->setUserContact($this);
        }

        return $this;
    }

    public function removeGenerationUserContact(GenerationUserContact $generationUserContact): static
    {
        if ($this->generationUserContacts->removeElement($generationUserContact)) {
            // set the owning side to null (unless already changed)
            if ($generationUserContact->getUserContact() === $this) {
                $generationUserContact->setUserContact(null);
            }
        }

        return $this;
    }
}
