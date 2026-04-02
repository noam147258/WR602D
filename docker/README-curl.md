# Extension PHP curl

L’image **mmi3docker/symfony-2024** ne fournit pas l’extension PHP `curl` (fichier `curl.so` absent).  
On ne monte donc pas de `99-curl.ini` pour éviter l’erreur au démarrage de PHP.

Composer fonctionne sans curl en utilisant un autre transport (plus lent) ; l’avertissement est normal et peut être ignoré.

## Pour avoir curl (optionnel)

Il faudrait une image personnalisée qui installe l’extension, par exemple un Dockerfile :

```dockerfile
FROM mmi3docker/symfony-2024
RUN apt-get update && apt-get install -y php8.3-curl && apt-get clean && rm -rf /var/lib/apt/lists/*
```

Puis dans `docker-compose.yml`, remplacer `image: mmi3docker/symfony-2024` par `build: .` (avec ce Dockerfile à la racine du projet).
