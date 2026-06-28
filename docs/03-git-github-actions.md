# Git & GitHub Actions

## Repository

This project is stored on GitHub and acts as single source of truth.

## CI/CD Trigger

Every push to `main` triggers GitHub Actions workflow.

## Workflow

- Checkout repository
- Run deployment on self-hosted runner
- Execute Docker Compose
