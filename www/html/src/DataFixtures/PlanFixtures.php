<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class PlanFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $plans = [
            ['name' => 'free', 'description' => 'Votre présence pèse sur nos serveurs. Un PDF par jour, pour ceux qui ont manifestement plus de temps libre que de capital à investir. Une offre de charité, en somme.', 'limit' => 1, 'role' => 'ROLE_FREE', 'price' => '0.00', 'stripe_price_id' => null],
            ['name' => 'basic', 'description' => 'Le minimum syndical pour éviter l\'humiliation du plan gratuit. 3 PDFs par jour : pour les projets sans ambition et les budgets qui ont peur de l\'avenir.', 'limit' => 3, 'role' => 'ROLE_BASIC', 'price' => '19.99', 'stripe_price_id' => 'price_1T9L7gB7dp701BsdQsNWNygb'],
            ['name' => 'basic+', 'description' => 'Vous essayez, et c\'est mignon. 5 PDFs pour ceux qui veulent se donner l\'illusion d\'une croissance sans jamais vraiment prendre de risques financiers.', 'limit' => 5, 'role' => 'ROLE_BASIC_PLUS', 'price' => '49.99', 'stripe_price_id' => 'price_1T9L8mB7dp701Bsd7McpxaQy'],
            ['name' => 'advanced', 'description' => 'Enfin un début de pertinence. 8 PDFs pour les freelances qui ne veulent plus passer pour des amateurs, mais qui ne sont pas encore tout à fait des professionnels.', 'limit' => 8, 'role' => 'ROLE_ADVANCED', 'price' => '99.99', 'stripe_price_id' => 'price_1T9LAmB7dp701BsdlpBDJihw'],
            ['name' => 'pro', 'description' => 'Vous commencez à exister à nos yeux. 15 PDFs et un support prioritaire, parce qu\'on ne fait pas attendre quelqu\'un qui paie enfin le prix d\'un café par jour.', 'limit' => 15, 'role' => 'ROLE_PRO', 'price' => '199.99', 'stripe_price_id' => 'price_1T9LCNB7dp701BsdD6P385w6'],
            ['name' => 'ultra', 'description' => 'On quitte la zone de confort. 25 PDFs pour les équipes qui ont compris que pour gagner de l\'argent, il fallait d\'abord accepter de nous en donner.', 'limit' => 25, 'role' => 'ROLE_ULTRA', 'price' => '349.99', 'stripe_price_id' => 'price_1T9LDRB7dp701BsdmSb2DGk1'],
            ['name' => 'ultra deluxe', 'description' => 'Le plaisir de l\'excès. 40 PDFs. C\'est l\'abonnement de ceux qui aiment les badges brillants sur leur facture et les quotas qu\'ils ne rempliront jamais.', 'limit' => 40, 'role' => 'ROLE_ULTRA_DELUXE', 'price' => '549.99', 'stripe_price_id' => 'price_1T9LEPB7dp701BsdfMfegw3v'],
            ['name' => 'premium', 'description' => 'Un choix pragmatique pour les leaders. 75 PDFs par jour. Vous n\'êtes plus un utilisateur, vous êtes un partenaire (tant que le virement passe).', 'limit' => 75, 'role' => 'ROLE_PREMIUM', 'price' => '799.99', 'stripe_price_id' => 'price_1T9LF3B7dp701Bsd5SsoywHm'],
            ['name' => 'premium pro', 'description' => 'L\'excellence opérationnelle. 125 PDFs. Pour les entreprises qui ont compris que la productivité se mesure au nombre de zéros sur le bon de commande.', 'limit' => 125, 'role' => 'ROLE_PREMIUM_PRO', 'price' => '1099.99', 'stripe_price_id' => 'price_1T9LG9B7dp701Bsde2J7ojjQ'],
            ['name' => 'ultra premium pro', 'description' => '200 PDFs. La modération est un concept qui ne vous concerne plus. Vous écrasez la concurrence sous le poids de vos documents.', 'limit' => 200, 'role' => 'ROLE_ULTRA_PREMIUM_PRO', 'price' => '1499.99', 'stripe_price_id' => 'price_1T9LGrB7dp701BsdWAmDeOO7'],
            ['name' => 'ultra premium pro +', 'description' => 'Le prestige sans compromis. 350 PDFs. Pour les décideurs qui exigent le meilleur, parce qu\'ils savent qu\'ils le valent bien (et qu\'ils ont le budget pour le prouver).', 'limit' => 350, 'role' => 'ROLE_ULTRA_PREMIUM_PRO_PLUS', 'price' => '1899.99', 'stripe_price_id' => 'price_1T9LITB7dp701BsdAEzAuTJX'],
            ['name' => 'gold', 'description' => 'L\'élite financière. 500 PDFs par jour. Vous ne faites pas la queue, vous ne posez pas de questions. Vous possédez la plateforme, ou presque.', 'limit' => 500, 'role' => 'ROLE_GOLD', 'price' => '2149.99', 'stripe_price_id' => 'price_1T9LJMB7dp701BsdlsztIsnu'],
            ['name' => 'platinium', 'description' => 'Un standard à part. 750 PDFs. On vous répond avant même que vous n\'ayez formulé votre problème. Le luxe, c\'est de ne plus avoir à compter.', 'limit' => 750, 'role' => 'ROLE_PLATINIUM', 'price' => '2349.99', 'stripe_price_id' => 'price_1T9LKUB7dp701Bsd8Ji5FAEO'],
            ['name' => 'legendary', 'description' => 'Le territoire des GOAT. 1000 PDFs par jour. Vous n\'utilisez pas le service, vous le dominez. Réservé à ceux qui ne connaissent aucune limite, sauf celle de leur propre génie.', 'limit' => 1000, 'role' => 'ROLE_LEGENDARY', 'price' => '2499.99', 'stripe_price_id' => 'price_1T9LLoB7dp701Bsddha8CKhe'],
            ['name' => 'pigeon', 'description' => 'L\'Olympe de la consommation. Illimité. Pour les visionnaires qui ont transcendé la notion de valeur marchande. Vous ne payez pas pour un service, vous payez pour le privilège d\'exister au sommet de notre chaîne alimentaire.', 'limit' => null, 'role' => 'ROLE_PIGEON', 'price' => '49999.99', 'stripe_price_id' => 'price_1T9LNPB7dp701BsdGc9gOVvN'],
        ];

        foreach ($plans as $data) {
            $plan = new Plan();
            $plan->setName($data['name']);
            $plan->setDescription($data['description']);
            $plan->setLimitGeneration($data['limit']);
            $plan->setRole($data['role']);
            $plan->setPrice($data['price']);
            $plan->setStripePriceId($data['stripe_price_id'] ?? null);
            $plan->setActive(true);
            $plan->setCreatedAt(new \DateTimeImmutable());
            $manager->persist($plan);
        }

        $manager->flush();
    }
}
