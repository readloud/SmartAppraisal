# postgres/Dockerfile
# Custom PostgreSQL with extensions and init scripts

FROM postgres:15-alpine

# Install additional extensions
RUN apk add --no-cache \
    postgresql-contrib \
    postgresql-pgvector \
    && rm -rf /var/cache/apk/*

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY migrations/ /docker-entrypoint-initdb.d/migrations/

# Custom PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Create non-root user
RUN chown -R postgres:postgres /var/lib/postgresql/data

USER postgres

# Expose port
EXPOSE 5432

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
