<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Table contact_request (demandes de contact entre utilisateurs)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE contact_request (id INT AUTO_INCREMENT NOT NULL, requester_id INT NOT NULL, recipient_id INT NOT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', UNIQUE INDEX UNIQ_contact_request_pair (requester_id, recipient_id), INDEX IDX_7F658BAED7D748B8 (requester_id), INDEX IDX_7F658BAEE92F8F78 (recipient_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE contact_request ADD CONSTRAINT FK_7F658BAED7D748B8 FOREIGN KEY (requester_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE contact_request ADD CONSTRAINT FK_7F658BAEE92F8F78 FOREIGN KEY (recipient_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE contact_request DROP FOREIGN KEY FK_7F658BAED7D748B8');
        $this->addSql('ALTER TABLE contact_request DROP FOREIGN KEY FK_7F658BAEE92F8F78');
        $this->addSql('DROP TABLE contact_request');
    }
}
