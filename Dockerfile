# syntax=docker/dockerfile:1
# Build SPA (base /spa/ pour cohabiter avec Symfony sur le même domaine)
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_BASE=/spa/
ENV VITE_BASE=$VITE_BASE
RUN npm run build

FROM php:8.3-apache-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libicu-dev libpng-dev libxml2-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) intl pdo pdo_mysql opcache zip curl xml \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY docker/render/apache-render.conf /etc/apache2/sites-available/000-default.conf

COPY docker/render/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

WORKDIR /var/www/html

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY www/html/ .
# bin/console (cache:clear) exige un fichier .env ; Render fournit les vraies variables au runtime.
RUN cp .env.example .env \
    && sed -i 's/^APP_ENV=.*/APP_ENV=prod/' .env \
    && sed -i 's/^APP_SECRET=.*/APP_SECRET=build-time-placeholder/' .env

ENV APP_RUNTIME_MODE=prod

RUN mkdir -p var/cache var/log var/sessions public/spa \
    && composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data var public

COPY --from=frontend /app/dist ./public/spa
RUN chown -R www-data:www-data public/spa

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
