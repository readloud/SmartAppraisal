# redis/Dockerfile
# Custom Redis with persistence and modules

FROM redis:7-alpine

# Install Redis modules
RUN apk add --no-cache \
    build-base \
    curl \
    && rm -rf /var/cache/apk/*

# Copy Redis configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Copy initialization script
COPY init.sh /docker-entrypoint-initdb.d/

# Create data directory
RUN mkdir -p /data && \
    chown -R redis:redis /data

USER redis

EXPOSE 6379

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
