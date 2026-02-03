# Guide - Création des entités Doctrine

## Étape 1 : Création de la branche Git

```bash
git checkout develop
git pull origin develop
git checkout -b feature/make-entities
```

## Étape 2 : Installation de Doctrine et Maker

```bash
docker-compose exec web composer require symfony/orm-pack
docker-compose exec web composer require --dev symfony/maker-bundle
```

## Étape 3 : Configuration de la base de données

### 3.1 - Ajouter DATABASE_URL dans le fichier .env

Ouvrez le fichier `www/html/.env` et ajoutez à la fin :

```
###> doctrine/doctrine-bundle ###
DATABASE_URL="mysql://symfony:PASSWORD@db:3306/symfony?serverVersion=10.8&charset=utf8mb4"
###< doctrine/doctrine-bundle ###
```

**Note :** Remplacez `PASSWORD` par le mot de passe défini dans votre docker-compose.yml (actuellement `PASSWORD`).

### 3.2 - Créer la base de données

```bash
docker-compose exec web php bin/console doctrine:database:create
```

**Vérification :** Vous pouvez vérifier dans phpMyAdmin (http://localhost:8080) que la base de données `symfony` a été créée.

## Étape 4 : Création des entités

### 4.1 - Entité User

```bash
docker-compose exec web php bin/console make:entity User
```

**Lorsque la commande vous demande les champs, ajoutez-les un par un :**

1. `email` → type: `string`, length: `255`, nullable: `no`, unique: `yes`
2. `password` → type: `string`, length: `255`, nullable: `no`
3. `lastname` → type: `string`, length: `255`, nullable: `yes`
4. `firstname` → type: `string`, length: `255`, nullable: `yes`
5. `dob` → type: `date`, nullable: `yes` (date of birth)
6. `photo` → type: `string`, length: `255`, nullable: `yes`
7. `favorite_color` → type: `string`, length: `50`, nullable: `yes`
8. `phone` → type: `string`, length: `20`, nullable: `yes`

**Pour terminer, appuyez sur Entrée sans rien saisir.**

**Ensuite, ajoutez les relations :**

1. `userContacts` → type: `OneToMany`, target: `UserContact`, mappedBy: `user`
2. `generations` → type: `OneToMany`, target: `Generation`, mappedBy: `user`

### 4.2 - Entité UserContact

```bash
docker-compose exec web php bin/console make:entity UserContact
```

**Champs à ajouter :**

1. `lastname` → type: `string`, length: `255`, nullable: `yes`
2. `firstname` → type: `string`, length: `255`, nullable: `yes`
3. `email` → type: `string`, length: `255`, nullable: `yes`

**Relations à ajouter :**

1. `user` → type: `ManyToOne`, target: `User`, inversedBy: `userContacts`
2. `generationUserContacts` → type: `OneToMany`, target: `GenerationUserContact`, mappedBy: `userContact`

### 4.3 - Entité Plan

```bash
docker-compose exec web php bin/console make:entity Plan
```

**Champs à ajouter :**

1. `name` → type: `string`, length: `100`, nullable: `no`
2. `description` → type: `text`, nullable: `yes`
3. `limit_generation` → type: `integer`, nullable: `yes` (limite de PDF par jour)
4. `image` → type: `string`, length: `255`, nullable: `yes`
5. `role` → type: `string`, length: `50`, nullable: `yes`
6. `price` → type: `decimal`, precision: `10`, scale: `2`, nullable: `yes`
7. `special_price` → type: `decimal`, precision: `10`, scale: `2`, nullable: `yes`
8. `special_price_from` → type: `datetime`, nullable: `yes`
9. `special_price_to` → type: `datetime`, nullable: `yes`
10. `active` → type: `boolean`, nullable: `no` (par défaut: `true`)
11. `created_at` → type: `datetime_immutable`, nullable: `yes`

**Pas de relations pour cette entité.**

### 4.4 - Entité Generation

```bash
docker-compose exec web php bin/console make:entity Generation
```

**Champs à ajouter :**

1. `file` → type: `string`, length: `255`, nullable: `yes` (chemin du fichier PDF)
2. `created_at` → type: `datetime_immutable`, nullable: `yes`

**Relations à ajouter :**

1. `user` → type: `ManyToOne`, target: `User`, inversedBy: `generations`
2. `generationUserContacts` → type: `OneToMany`, target: `GenerationUserContact`, mappedBy: `generation`

### 4.5 - Entité GenerationUserContact (Table de liaison)

```bash
docker-compose exec web php bin/console make:entity GenerationUserContact
```

**Pas de champs simples, seulement des relations :**

1. `generation` → type: `ManyToOne`, target: `Generation`, inversedBy: `generationUserContacts`
2. `userContact` → type: `ManyToOne`, target: `UserContact`, inversedBy: `generationUserContacts`

## Étape 5 : Configuration des dates automatiques (optionnel mais recommandé)

Pour les champs `created_at`, vous pouvez ajouter automatiquement la date lors de la création.

**Dans chaque entité (User, Plan, Generation), ajoutez :**

1. En haut de la classe, ajoutez : `#[ORM\HasLifecycleCallbacks]`
2. Créez une méthode :

```php
#[ORM\PrePersist]
public function setCreatedAtValue(): void
{
    $this->created_at = new \DateTimeImmutable();
}
```

## Étape 6 : Génération des migrations

```bash
docker-compose exec web php bin/console make:migration
```

Cette commande va créer un fichier de migration dans `www/html/migrations/`.

## Étape 7 : Exécution des migrations

```bash
docker-compose exec web php bin/console doctrine:migrations:migrate
```

**Confirmez avec `yes` lorsque demandé.**

**Vérification :** Dans phpMyAdmin, vous devriez voir toutes les tables créées :
- `user`
- `user_contact`
- `plan`
- `generation`
- `generation_user_contact`
- `doctrine_migration_versions`

## Étape 8 : Vérification des entités

Vérifiez que tous les fichiers sont bien créés dans `www/html/src/Entity/` :
- `User.php`
- `UserContact.php`
- `Plan.php`
- `Generation.php`
- `GenerationUserContact.php`

## Étape 9 : Commit et Pull Request

```bash
git add .
git commit -m "feat: create entities (User, UserContact, Plan, Generation, GenerationUserContact)"
git push -u origin feature/make-entities
```

Ensuite, créez une Pull Request de `feature/make-entities` vers `develop` sur GitHub.

---

## Notes importantes

- **Pour le champ `password`** : Plus tard, vous devrez utiliser `symfony/password-hasher` pour le hachage des mots de passe. Pour l'instant, laissez-le en string.

- **Pour les champs `decimal`** : La précision (10) et l'échelle (2) signifient que vous pouvez stocker des nombres avec 2 décimales (ex: 99999999.99).

- **Pour `limit_generation`** : Si la valeur est `null`, cela signifie "illimité".

- **La table `GenerationUserContact`** est une table de liaison Many-to-Many entre `Generation` et `UserContact`.
