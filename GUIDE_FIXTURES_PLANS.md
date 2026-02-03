# Guide - Création des fixtures pour les Plans

## Étape 1 : Création de la branche Git

```bash
git checkout develop
git pull origin develop
git checkout -b feature/fixtures-plans
```

## Étape 2 : Installation de DoctrineFixturesBundle

```bash
docker-compose exec web composer require --dev orm-fixtures
```

## Étape 3 : Création de la classe Fixture

```bash
docker-compose exec web php bin/console make:fixtures PlanFixtures
```

Cette commande va créer le fichier `www/html/src/DataFixtures/PlanFixtures.php`.

## Étape 4 : Édition de la classe PlanFixtures

Ouvrez le fichier `www/html/src/DataFixtures/PlanFixtures.php` et remplacez le contenu par :

```php
<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class PlanFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Plan FREE
        $planFree = new Plan();
        $planFree->setName('FREE');
        $planFree->setDescription('Plan gratuit avec limitations');
        $planFree->setLimitGeneration(2);
        $planFree->setRole('ROLE_FREE');
        $planFree->setPrice(0.00);
        $planFree->setActive(true);
        $planFree->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planFree);

        // Plan BASIC
        $planBasic = new Plan();
        $planBasic->setName('BASIC');
        $planBasic->setDescription('Plan basique avec plus de fonctionnalités');
        $planBasic->setLimitGeneration(10);
        $planBasic->setRole('ROLE_BASIC');
        $planBasic->setPrice(9.99);
        $planBasic->setActive(true);
        $planBasic->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planBasic);

        // Plan PREMIUM
        $planPremium = new Plan();
        $planPremium->setName('PREMIUM');
        $planPremium->setDescription('Plan premium avec accès illimité');
        $planPremium->setLimitGeneration(null); // null = illimité
        $planPremium->setRole('ROLE_PREMIUM');
        $planPremium->setPrice(29.99);
        $planPremium->setActive(true);
        $planPremium->setCreatedAt(new \DateTimeImmutable());
        $manager->persist($planPremium);

        $manager->flush();
    }
}
```

## Étape 5 : Charger les fixtures

```bash
docker-compose exec web php bin/console doctrine:fixtures:load
```

⚠️ **Attention** : Cette commande va **vider la base de données** et la remplir avec les fixtures.

**Si vous voulez ajouter les fixtures sans supprimer les données existantes :**

```bash
docker-compose exec web php bin/console doctrine:fixtures:load --append
```

**Confirmez avec `yes` lorsque demandé.**

## Étape 6 : Vérification

### Option 1 : En ligne de commande

```bash
docker-compose exec web php bin/console doctrine:query:sql "SELECT * FROM plan"
```

### Option 2 : Dans phpMyAdmin

1. Allez sur http://localhost:8080
2. Connectez-vous avec :
   - Serveur : `db`
   - Utilisateur : `symfony`
   - Mot de passe : `PASSWORD`
3. Sélectionnez la base de données `symfony`
4. Cliquez sur la table `plan`
5. Vous devriez voir les 3 plans : FREE, BASIC, PREMIUM

## Étape 7 : Commit et Pull Request

```bash
git add .
git commit -m "feat: add fixtures for plans (FREE, BASIC, PREMIUM)"
git push -u origin feature/fixtures-plans
```

Ensuite, créez une Pull Request de `feature/fixtures-plans` vers `develop` sur GitHub.

---

## Détails des plans créés

### Plan FREE
- **Limite de génération** : 2 PDFs par jour
- **Prix** : 0.00 €
- **Rôle** : ROLE_FREE

### Plan BASIC
- **Limite de génération** : 10 PDFs par jour
- **Prix** : 9.99 €
- **Rôle** : ROLE_BASIC

### Plan PREMIUM
- **Limite de génération** : Illimité (null)
- **Prix** : 29.99 €
- **Rôle** : ROLE_PREMIUM
