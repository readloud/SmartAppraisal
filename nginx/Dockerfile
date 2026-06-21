# nginx/Dockerfile
# Custom Nginx reverse proxy with SSL support

FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate for development
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/appraisal.key \
    -out /etc/nginx/ssl/appraisal.crt \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Company/CN=appraisal.company.com"

# Create non-root user
RUN adduser -D -g '' -u 1000 appuser && \
    chown -R appuser:appuser /etc/nginx/ssl /var/cache/nginx /var/run

USER appuser

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
