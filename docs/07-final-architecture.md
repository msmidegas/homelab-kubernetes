# Final Architecture

## System flow

GitHub Push
   ↓
GitHub Actions
   ↓
Self-hosted Runner (Ubuntu VM)
   ↓
Docker Compose
   ↓
Running Container (nginx)
   ↓
Accessible via browser

## Access URL

http://192.168.1.114:8080

## Summary

This system removes manual deployment and fully automates infrastructure updates via Git.
