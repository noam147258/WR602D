<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260307120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'GenerationUserContact: status, created_at, unique (generation, user_contact)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE generation_user_contact ADD status VARCHAR(20) NOT NULL DEFAULT \'pending\'');
        $this->addSql('UPDATE generation_user_contact SET status = \'accepted\'');
        $this->addSql('ALTER TABLE generation_user_contact ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_gen_share_pair ON generation_user_contact (generation_id, user_contact_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_gen_share_pair ON generation_user_contact');
        $this->addSql('ALTER TABLE generation_user_contact DROP status, DROP created_at');
    }
}
