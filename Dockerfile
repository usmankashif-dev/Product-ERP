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
    nginx supervisor \
    && docker-php-ext-install pdo pdo_mysql mbstring zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy app files
COPY . .

# Copy built frontend
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies first (before running artisan commands)
RUN composer install --no-dev --optimize-autoloader

# Create .env file from .env.example
RUN cp .env.example .env && \
    php artisan key:generate --force

# Create required directories and set permissions for www-data user
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views && \
    mkdir -p bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Copy supervisord and nginx configs
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/nginx.conf /etc/nginx/sites-available/default
RUN mkdir -p /var/log/nginx /var/log/supervisor && \
    chmod 755 /var/log/nginx /var/log/supervisor

# Copy start script
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Entrypoint
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
