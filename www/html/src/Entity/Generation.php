<?php

namespace App\Entity;

use App\Repository\GenerationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GenerationRepository::class)]
class Generation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $file = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\ManyToOne(inversedBy: 'generations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /** Utilisateur qui a partagé cette conversion (rempli pour les copies reçues). */
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'shared_by_user_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $sharedBy = null;

    /**
     * @var Collection<int, GenerationUserContact>
     */
    #[ORM\OneToMany(targetEntity: GenerationUserContact::class, mappedBy: 'generation', cascade: ['remove'])]
    private Collection $generationUserContacts;

    public function __construct()
    {
        $this->generationUserContacts = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFile(): ?string
    {
        return $this->file;
    }

    public function setFile(?string $file): static
    {
        $this->file = $file;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(?\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

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

    public function getSharedBy(): ?User
    {
        return $this->sharedBy;
    }

    public function setSharedBy(?User $sharedBy): static
    {
        $this->sharedBy = $sharedBy;

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
            $generationUserContact->setGeneration($this);
        }

        return $this;
    }

    public function removeGenerationUserContact(GenerationUserContact $generationUserContact): static
    {
        if ($this->generationUserContacts->removeElement($generationUserContact)) {
            // set the owning side to null (unless already changed)
            if ($generationUserContact->getGeneration() === $this) {
                $generationUserContact->setGeneration(null);
            }
        }

        return $this;
    }
}
