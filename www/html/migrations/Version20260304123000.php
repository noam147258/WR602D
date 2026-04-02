<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260304123000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Set Stripe price IDs for all paid plans';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9L7gB7dp701BsdQsNWNygb' WHERE name = 'basic'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9L8mB7dp701Bsd7McpxaQy' WHERE name = 'basic+'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LAmB7dp701BsdlpBDJihw' WHERE name = 'advanced'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LCNB7dp701BsdD6P385w6' WHERE name = 'pro'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LDRB7dp701BsdmSb2DGk1' WHERE name = 'ultra'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LEPB7dp701BsdfMfegw3v' WHERE name = 'ultra deluxe'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LF3B7dp701Bsd5SsoywHm' WHERE name = 'premium'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LG9B7dp701Bsde2J7ojjQ' WHERE name = 'premium pro'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LGrB7dp701BsdWAmDeOO7' WHERE name = 'ultra premium pro'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LITB7dp701BsdAEzAuTJX' WHERE name = 'ultra premium pro +'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LJMB7dp701BsdlsztIsnu' WHERE name = 'gold'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LKUB7dp701Bsd8Ji5FAEO' WHERE name = 'platinium'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LLoB7dp701Bsddha8CKhe' WHERE name = 'legendary'");
        $this->addSql("UPDATE plan SET stripe_price_id = 'price_1T9LNPB7dp701BsdGc9gOVvN' WHERE name = 'pigeon'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("UPDATE plan SET stripe_price_id = NULL");
    }
}

