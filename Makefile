# ============================================
# SmartAppraisal Makefile
# ============================================

.PHONY: help setup start stop restart logs \
        backend frontend mobile \
        install-backend install-frontend install \
        migrate seed test test-backend test-frontend \
        lint format lint-backend lint-frontend \
        build build-backend build-frontend build-docker \
        deploy deploy-prod deploy-staging \
        backup restore \
        clean clean-docker clean-pyc clean-node \
        monitor health shell db-shell redis-shell \
        docs

# ============================================
# Variables
# ============================================
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
PYTHON = python
NPM = npm
PIP = pip
MAKEFLAGS += --silent

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# ============================================
# Help
# ============================================
help: ## Show this help message
	@echo '$(GREEN)SmartAppraisal Makefile Commands:$(NC)'
	@echo ''
	@echo '$(YELLOW)Usage:$(NC)'
	@echo '  make <command>'
	@echo ''
	@echo '$(YELLOW)Development:$(NC)'
	@echo '  $(GREEN)setup$(NC)           Setup development environment'
	@echo '  $(GREEN)start$(NC)           Start all services'
	@echo '  $(GREEN)stop$(NC)            Stop all services'
	@echo '  $(GREEN)restart$(NC)         Restart all services'
	@echo '  $(GREEN)logs$(NC)            View all logs'
	@echo ''
	@echo '$(YELLOW)Installation:$(NC)'
	@echo '  $(GREEN)install$(NC)         Install all dependencies'
	@echo '  $(GREEN)install-backend$(NC) Install backend dependencies'
	@echo '  $(GREEN)install-frontend$(NC)Install frontend dependencies'
	@echo ''
	@echo '$(YELLOW)Database:$(NC)'
	@echo '  $(GREEN)migrate$(NC)         Run database migrations'
	@echo '  $(GREEN)seed$(NC)            Seed database with initial data'
	@echo '  $(GREEN)backup$(NC)          Backup database'
	@echo '  $(GREEN)restore$(NC)         Restore database from backup'
	@echo ''
	@echo '$(YELLOW)Testing:$(NC)'
	@echo '  $(GREEN)test$(NC)            Run all tests'
	@echo '  $(GREEN)test-backend$(NC)    Run backend tests'
	@echo '  $(GREEN)test-frontend$(NC)   Run frontend tests'
	@echo ''
	@echo '$(YELLOW)Linting & Formatting:$(NC)'
	@echo '  $(GREEN)lint$(NC)            Run all linters'
	@echo '  $(GREEN)lint-backend$(NC)    Lint backend code'
	@echo '  $(GREEN)lint-frontend$(NC)   Lint frontend code'
	@echo '  $(GREEN)format$(NC)          Format all code'
	@echo ''
	@echo '$(YELLOW)Building:$(NC)'
	@echo '  $(GREEN)build$(NC)           Build all Docker images'
	@echo '  $(GREEN)build-backend$(NC)   Build backend image'
	@echo '  $(GREEN)build-frontend$(NC)  Build frontend image'
	@echo ''
	@echo '$(YELLOW)Deployment:$(NC)'
	@echo '  $(GREEN)deploy$(NC)          Deploy to production'
	@echo '  $(GREEN)deploy-staging$(NC)  Deploy to staging'
	@echo ''
	@echo '$(YELLOW)Monitoring:$(NC)'
	@echo '  $(GREEN)monitor$(NC)         Start monitoring stack'
	@echo '  $(GREEN)health$(NC)          Check service health'
	@echo ''
	@echo '$(YELLOW)Utilities:$(NC)'
	@echo '  $(GREEN)shell$(NC)           Open Django/Flask shell'
	@echo '  $(GREEN)db-shell$(NC)        Open database shell'
	@echo '  $(GREEN)redis-shell$(NC)     Open Redis shell'
	@echo '  $(GREEN)clean$(NC)           Clean all temporary files'
	@echo '  $(GREEN)docs$(NC)            Generate documentation'
	@echo ''

# ============================================
# Setup
# ============================================
setup: ## Setup development environment
	@echo '$(BLUE)Setting up development environment...$(NC)'
	@cp -n .env.example .env || true
	@make install
	@make migrate
	@make seed
	@echo '$(GREEN)✓ Setup complete!$(NC)'
	@echo 'Next steps:'
	@echo '  1. Edit .env file with your configuration'
	@echo '  2. Run "make start" to start services'

# ============================================
# Installation
# ============================================
install: install-backend install-frontend ## Install all dependencies
	@echo '$(GREEN)✓ All dependencies installed$(NC)'

install-backend: ## Install backend dependencies
	@echo '$(BLUE)Installing backend dependencies...$(NC)'
	@cd backend && $(PYTHON) -m venv venv || true
	@cd backend && source venv/bin/activate && $(PIP) install -r requirements.txt
	@cd backend && source venv/bin/activate && $(PIP) install -r requirements-dev.txt
	@echo '$(GREEN)✓ Backend dependencies installed$(NC)'

install-frontend: ## Install frontend dependencies
	@echo '$(BLUE)Installing frontend dependencies...$(NC)'
	@cd frontend && $(NPM) install
	@echo '$(GREEN)✓ Frontend dependencies installed$(NC)'

# ============================================
# Services
# ============================================
start: ## Start all services
	@echo '$(BLUE)Starting services...$(NC)'
	@$(DOCKER_COMPOSE) up -d
	@echo '$(GREEN)✓ Services started$(NC)'
	@echo 'Frontend: http://localhost:3000'
	@echo 'Backend API: http://localhost:8000/docs'
	@echo 'PGAdmin: http://localhost:5050'

stop: ## Stop all services
	@echo '$(BLUE)Stopping services...$(NC)'
	@$(DOCKER_COMPOSE) down
	@echo '$(GREEN)✓ Services stopped$(NC)'

restart: stop start ## Restart all services

logs: ## View all logs
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## View backend logs
	@$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## View frontend logs
	@$(DOCKER_COMPOSE) logs -f frontend

# ============================================
# Database
# ============================================
migrate: ## Run database migrations
	@echo '$(BLUE)Running migrations...$(NC)'
	@$(DOCKER_COMPOSE) exec backend alembic upgrade head
	@echo '$(GREEN)✓ Migrations complete$(NC)'

migrate-down: ## Rollback last migration
	@echo '$(BLUE)Rolling back migration...$(NC)'
	@$(DOCKER_COMPOSE) exec backend alembic downgrade -1
	@echo '$(GREEN)✓ Rollback complete$(NC)'

seed: ## Seed database with initial data
	@echo '$(BLUE)Seeding database...$(NC)'
	@$(DOCKER_COMPOSE) exec backend python scripts/seed_data.py
	@echo '$(GREEN)✓ Seed complete$(NC)'

backup: ## Backup database
	@echo '$(BLUE)Backing up database...$(NC)'
	@mkdir -p data/backups
	@$(DOCKER_COMPOSE) exec -T postgres pg_dump -U $(DB_USER) -d $(DB_NAME) > data/backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo '$(GREEN)✓ Backup complete$(NC)'

restore: ## Restore database from backup
	@echo '$(BLUE)Restoring database...$(NC)'
	@echo 'Usage: make restore FILE=backup_file.sql'
	@if [ -z "$(FILE)" ]; then echo '$(RED)Please specify FILE variable$(NC)'; exit 1; fi
	@$(DOCKER_COMPOSE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) < $(FILE)
	@echo '$(GREEN)✓ Restore complete$(NC)'

# ============================================
# Testing
# ============================================
test: test-backend test-frontend ## Run all tests
	@echo '$(GREEN)✓ All tests passed$(NC)'

test-backend: ## Run backend tests
	@echo '$(BLUE)Running backend tests...$(NC)'
	@$(DOCKER_COMPOSE) exec backend pytest -v --cov=app --cov-report=html
	@echo '$(GREEN)✓ Backend tests passed$(NC)'

test-frontend: ## Run frontend tests
	@echo '$(BLUE)Running frontend tests...$(NC)'
	@cd frontend && $(NPM) test -- --coverage --watchAll=false
	@echo '$(GREEN)✓ Frontend tests passed$(NC)'

test-e2e: ## Run E2E tests
	@echo '$(BLUE)Running E2E tests...$(NC)'
	@cd tests/e2e && npx playwright test
	@echo '$(GREEN)✓ E2E tests passed$(NC)'

test-load: ## Run load tests
	@echo '$(BLUE)Running load tests...$(NC)'
	@k6 run tests/performance/load-test.js
	@echo '$(GREEN)✓ Load tests complete$(NC)'

# ============================================
# Linting & Formatting
# ============================================
lint: lint-backend lint-frontend ## Run all linters
	@echo '$(GREEN)✓ All linters passed$(NC)'

lint-backend: ## Lint backend code
	@echo '$(BLUE)Linting backend...$(NC)'
	@cd backend && flake8 app --max-line-length=88 --count
	@cd backend && mypy app --ignore-missing-imports
	@cd backend && bandit -r app -c pyproject.toml
	@echo '$(GREEN)✓ Backend linting passed$(NC)'

lint-frontend: ## Lint frontend code
	@echo '$(BLUE)Linting frontend...$(NC)'
	@cd frontend && $(NPM) run lint
	@echo '$(GREEN)✓ Frontend linting passed$(NC)'

format: ## Format all code
	@echo '$(BLUE)Formatting code...$(NC)'
	@cd backend && black app --line-length=88
	@cd backend && isort app --profile=black
	@cd frontend && $(NPM) run format
	@echo '$(GREEN)✓ Formatting complete$(NC)'

# ============================================
# Building
# ============================================
build: build-backend build-frontend ## Build all Docker images
	@echo '$(GREEN)✓ Build complete$(NC)'

build-backend: ## Build backend Docker image
	@echo '$(BLUE)Building backend...$(NC)'
	@docker build -t smartappraisal-backend:latest -f backend/Dockerfile backend/
	@echo '$(GREEN)✓ Backend image built$(NC)'

build-frontend: ## Build frontend Docker image
	@echo '$(BLUE)Building frontend...$(NC)'
	@docker build -t smartappraisal-frontend:latest -f frontend/Dockerfile frontend/
	@echo '$(GREEN)✓ Frontend image built$(NC)'

build-prod: ## Build production images
	@echo '$(BLUE)Building production images...$(NC)'
	@docker build -t smartappraisal-backend:prod -f backend/Dockerfile backend/
	@docker build -t smartappraisal-frontend:prod -f frontend/Dockerfile frontend/
	@docker build -t smartappraisal-nginx:prod -f nginx/Dockerfile nginx/
	@docker build -t smartappraisal-postgres:prod -f postgres/Dockerfile postgres/
	@docker build -t smartappraisal-redis:prod -f redis/Dockerfile redis/
	@echo '$(GREEN)✓ Production images built$(NC)'

# ============================================
# Deployment
# ============================================
deploy: ## Deploy to production
	@echo '$(BLUE)Deploying to production...$(NC)'
	@./scripts/deploy.sh
	@echo '$(GREEN)✓ Deployment complete$(NC)'

deploy-staging: ## Deploy to staging
	@echo '$(BLUE)Deploying to staging...$(NC)'
	@ENVIRONMENT=staging ./scripts/deploy.sh
	@echo '$(GREEN)✓ Staging deployment complete$(NC)'

rollback: ## Rollback deployment
	@echo '$(BLUE)Rolling back...$(NC)'
	@$(DOCKER_COMPOSE_PROD) down
	@$(DOCKER_COMPOSE_PROD) up -d
	@echo '$(GREEN)✓ Rollback complete$(NC)'

# ============================================
# Monitoring
# ============================================
monitor: ## Start monitoring stack
	@echo '$(BLUE)Starting monitoring stack...$(NC)'
	@docker-compose -f docker-compose.monitoring.yml up -d
	@echo '$(GREEN)✓ Monitoring stack started$(NC)'
	@echo 'Grafana: http://localhost:3001'
	@echo 'Prometheus: http://localhost:9090'

health: ## Check service health
	@echo '$(BLUE)Checking service health...$(NC)'
	@curl -s http://localhost:8000/health | jq . || echo '$(RED)Backend not healthy$(NC)'
	@curl -s http://localhost:3000/health | jq . || echo '$(RED)Frontend not healthy$(NC)'
	@echo '$(GREEN)✓ Health check complete$(NC)'

# ============================================
# Shell Access
# ============================================
shell: ## Open backend shell
	@$(DOCKER_COMPOSE) exec backend bash

db-shell: ## Open database shell
	@$(DOCKER_COMPOSE) exec postgres psql -U $(DB_USER) -d $(DB_NAME)

redis-shell: ## Open Redis shell
	@$(DOCKER_COMPOSE) exec redis redis-cli -a $(REDIS_PASSWORD)

# ============================================
# Cleaning
# ============================================
clean: clean-docker clean-pyc clean-node ## Clean all temporary files
	@echo '$(GREEN)✓ Clean complete$(NC)'

clean-docker: ## Clean Docker resources
	@echo '$(BLUE)Cleaning Docker resources...$(NC)'
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f
	@docker volume prune -f
	@echo '$(GREEN)✓ Docker resources cleaned$(NC)'

clean-pyc: ## Clean Python cache files
	@echo '$(BLUE)Cleaning Python cache...$(NC)'
	@find . -type f -name "*.pyc" -delete
	@find . -type d -name "__pycache__" -delete
	@find . -type d -name ".pytest_cache" -delete
	@find . -type d -name ".mypy_cache" -delete
	@find . -type d -name ".coverage" -delete
	@echo '$(GREEN)✓ Python cache cleaned$(NC)'

clean-node: ## Clean Node modules
	@echo '$(BLUE)Cleaning Node modules...$(NC)'
	@rm -rf frontend/node_modules
	@rm -rf frontend/build
	@rm -rf frontend/dist
	@rm -rf mobile/node_modules
	@echo '$(GREEN)✓ Node modules cleaned$(NC)'

# ============================================
# Documentation
# ============================================
docs: ## Generate documentation
	@echo '$(BLUE)Generating documentation...$(NC)'
	@cd backend && pydoc-markdown -p app > ../docs/api/backend.md
	@cd frontend && npm run docgen
	@echo '$(GREEN)✓ Documentation generated$(NC)'

# ============================================
# Version
# ============================================
version: ## Show version information
	@echo '$(BLUE)SmartAppraisal Version Information$(NC)'
	@echo 'Backend: $(shell cd backend && cat pyproject.toml | grep version | cut -d= -f2 | tr -d '"' | tr -d ' ' || echo "unknown")'
	@echo 'Frontend: $(shell cd frontend && cat package.json | grep version | cut -d: -f2 | tr -d '"' | tr -d ',' | tr -d ' ' || echo "unknown")'

# ============================================
# Default target
# ============================================
.DEFAULT_GOAL := help
