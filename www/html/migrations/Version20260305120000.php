<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260305120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add contact_user_id to user_contact (lien vers un autre compte utilisateur)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_contact ADD contact_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_contact ADD CONSTRAINT FK_146FF832E628A6FD FOREIGN KEY (contact_user_id) REFERENCES user (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_146FF8323D41F214 ON user_contact (contact_user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_contact DROP FOREIGN KEY FK_146FF832E628A6FD');
        $this->addSql('DROP INDEX IDX_146FF8323D41F214 ON user_contact');
        $this->addSql('ALTER TABLE user_contact DROP contact_user_id');
    }
}
