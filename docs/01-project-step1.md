# Homelab CI/CD Project

## Overview

This project demonstrates a full CI/CD pipeline using:

- GitHub repository
- GitHub Actions
- Self-hosted GitHub runner (Ubuntu VM on Hyper-V)
- Docker & Docker Compose
- Local network deployment

## Goal

To automate application deployment using Git push → automatic Docker deployment on a VM.

## Final result

After each push to main branch, application is automatically deployed and accessible via:

http://192.168.1.114:8080
