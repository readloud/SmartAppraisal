#!/bin/sh
# redis/init.sh
# Redis initialization script

echo "Initializing Redis..."
redis-cli SET system:initialized "true"
redis-cli SET system:version "1.0.0"
redis-cli SET config:cache_ttl "3600"

# Create default keyspace notifications
redis-cli CONFIG SET notify-keyspace-events KEA

echo "Redis initialization complete!"
