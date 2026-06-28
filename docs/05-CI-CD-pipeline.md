## Flow

Git push → GitHub → Actions → Self-hosted runner → Docker deploy

## Workflow file

.github/workflows/deploy.yml

## Steps

1. Detect push to main branch
2. Trigger workflow
3. Run job on self-hosted runner
4. Execute `docker compose up -d --build`
