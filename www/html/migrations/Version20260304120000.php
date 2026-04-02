<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260304120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add stripe_price_id to plan table for Stripe Checkout.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE plan ADD stripe_price_id VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE plan DROP stripe_price_id');
    }
}
