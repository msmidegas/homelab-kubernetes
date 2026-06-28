# Docker Compose

## Purpose

Defines application services in a reproducible way.

## Current setup

```yaml

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"

## Explanation

nginx container runs web server
port 8080 exposed to local network

## PostgreSQL Service

Added database service using PostgreSQL 16.

### Why?

To simulate real-world application architecture with backend storage.

### Data persistence

Used Docker volume:
db_data → persists database data across container restarts.
