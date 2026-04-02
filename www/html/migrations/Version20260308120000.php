<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260308120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Generation.shared_by_user_id — conversions reçues d\'un contact';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE generation ADD shared_by_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE generation ADD CONSTRAINT FK_8D93A649F6B8A8D3 FOREIGN KEY (shared_by_user_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_8D93A649F6B8A8D3 ON generation (shared_by_user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE generation DROP FOREIGN KEY FK_8D93A649F6B8A8D3');
        $this->addSql('DROP INDEX IDX_8D93A649F6B8A8D3 ON generation');
        $this->addSql('ALTER TABLE generation DROP shared_by_user_id');
    }
}
