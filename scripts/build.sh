#!/bin/bash
# scripts/build.sh - Build and push Docker images

set -e

REGISTRY=${DOCKER_REGISTRY:-ghcr.io}
REPOSITORY=${GITHUB_REPOSITORY:-company/smartappraisal}
TAG=${TAG:-latest}

# Build images
echo "📦 Building Docker images..."

docker build -t ${REGISTRY}/${REPOSITORY}/backend:${TAG} -f backend/Dockerfile backend/
docker build -t ${REGISTRY}/${REPOSITORY}/frontend:${TAG} -f frontend/Dockerfile frontend/
docker build -t ${REGISTRY}/${REPOSITORY}/nginx:${TAG} -f nginx/Dockerfile nginx/
docker build -t ${REGISTRY}/${REPOSITORY}/postgres:${TAG} -f postgres/Dockerfile postgres/
docker build -t ${REGISTRY}/${REPOSITORY}/redis:${TAG} -f redis/Dockerfile redis/

# Tag as latest if not specified
if [ "${TAG}" != "latest" ]; then
    docker tag ${REGISTRY}/${REPOSITORY}/backend:${TAG} ${REGISTRY}/${REPOSITORY}/backend:latest
    docker tag ${REGISTRY}/${REPOSITORY}/frontend:${TAG} ${REGISTRY}/${REPOSITORY}/frontend:latest
    docker tag ${REGISTRY}/${REPOSITORY}/nginx:${TAG} ${REGISTRY}/${REPOSITORY}/nginx:latest
    docker tag ${REGISTRY}/${REPOSITORY}/postgres:${TAG} ${REGISTRY}/${REPOSITORY}/postgres:latest
    docker tag ${REGISTRY}/${REPOSITORY}/redis:${TAG} ${REGISTRY}/${REPOSITORY}/redis:latest
fi

# Push images
echo "📤 Pushing images..."

docker push ${REGISTRY}/${REPOSITORY}/backend:${TAG}
docker push ${REGISTRY}/${REPOSITORY}/frontend:${TAG}
docker push ${REGISTRY}/${REPOSITORY}/nginx:${TAG}
docker push ${REGISTRY}/${REPOSITORY}/postgres:${TAG}
docker push ${REGISTRY}/${REPOSITORY}/redis:${TAG}

# Push latest tags
if [ "${TAG}" != "latest" ]; then
    docker push ${REGISTRY}/${REPOSITORY}/backend:latest
    docker push ${REGISTRY}/${REPOSITORY}/frontend:latest
    docker push ${REGISTRY}/${REPOSITORY}/nginx:latest
    docker push ${REGISTRY}/${REPOSITORY}/postgres:latest
    docker push ${REGISTRY}/${REPOSITORY}/redis:latest
fi

echo "✅ Build and push complete!"
echo "Images pushed to: ${REGISTRY}/${REPOSITORY}"
