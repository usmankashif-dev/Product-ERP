# ================================
# Stage 1: Build frontend assets
# ================================
FROM node:18 AS frontend

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ================================
# Stage 2: PHP + Laravel + Composer
# ================================
FROM php:8.2-fpm

# Install system deps
RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libonig-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy app files
COPY . .

# Copy built frontend
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Laravel cache
RUN php artisan config:clear && \
    php artisan route:clear && \
    php artisan view:clear

# Entrypoint
CMD ["php-fpm"]
