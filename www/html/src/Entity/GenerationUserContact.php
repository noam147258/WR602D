<?php

namespace App\Entity;

use App\Repository\GenerationUserContactRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GenerationUserContactRepository::class)]
#[ORM\Table(name: 'generation_user_contact')]
#[ORM\UniqueConstraint(name: 'UNIQ_gen_share_pair', columns: ['generation_id', 'user_contact_id'])]
class GenerationUserContact
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'generationUserContacts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Generation $generation = null;

    #[ORM\ManyToOne(inversedBy: 'generationUserContacts')]
    #[ORM\JoinColumn(nullable: false)]
    private ?UserContact $userContact = null;

    #[ORM\Column(length: 20)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGeneration(): ?Generation
    {
        return $this->generation;
    }

    public function setGeneration(?Generation $generation): static
    {
        $this->generation = $generation;

        return $this;
    }

    public function getUserContact(): ?UserContact
    {
        return $this->userContact;
    }

    public function setUserContact(?UserContact $userContact): static
    {
        $this->userContact = $userContact;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
