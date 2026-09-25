FROM php:8.2-cli-alpine

RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    ca-certificates \
    && docker-php-ext-install pdo pdo_mysql bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chmod -R 777 storage bootstrap/cache

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public public/index.php"]
