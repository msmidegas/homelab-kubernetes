# Problems & Fixes

## Issue 1: Missing docker-compose.yml

### Problem
Workflow failed with "no configuration file provided"

### Cause
File was not present in GitHub repository, only locally on VM.

### Fix
Moved docker-compose.yml into GitHub repository and committed it.

---

## Issue 2: Wrong working directory

### Problem
Runner could not find expected files

### Fix
Ensured repo structure is flat and compose file is in root.

---

## Issue 3: Networking issues (SSH / port access)

### Fix
Switched to self-hosted runner instead of remote SSH deployment.
