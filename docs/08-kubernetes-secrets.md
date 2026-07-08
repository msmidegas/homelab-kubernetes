#Kubernetes Secrets

## Overview 
A Kubernetes Secret is an object that is used to separate confidential data from an application's code, making that information safer because it isn't exposed within the code itself.
It can store sensitive info such as:
 - database passwords
 - API keys
 - tokens
 - certificates etc.

---

# Problem Before Secrets

Before introducing Secrets, env variables were directly stored into the Deployment file. 
