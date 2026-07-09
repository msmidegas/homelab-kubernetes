# Homelab Kubernetes Architecture - Namespace Migration

## 1. Project Overview

This project runs a Node.js web application and a PostgreSQL database inside a Kubernetes cluster.

The goal of the project is to build a production-like homelab Kubernetes environment using:

* k3s Kubernetes distribution
* Kubernetes Deployments
* Services
* Ingress routing
* Persistent Storage
* Secrets
* ConfigMaps
* Git-based infrastructure management

High-level architecture:

```
User Browser / curl
        |
        |
        v
DNS / hosts file
        |
        |
        v
Traefik Ingress Controller
        |
        |
        v
Kubernetes Service
        |
        |
        v
Node.js Application Pod
        |
        |
        v
PostgreSQL Service
        |
        |
        v
PostgreSQL Pod
        |
        |
        v
Persistent Storage
```

---

# 2. Kubernetes Cluster

The Kubernetes cluster consists of:

* Kubernetes control plane components
* Worker node(s)
* Application workloads

Current environment:

```
Ubuntu VM
    |
    |
    v
k3s Kubernetes Cluster
```

Traefik is used as the default Ingress Controller.

---

# 3. Initial State

Initially, all application resources were deployed inside the default namespace.

Initial structure:

```
Cluster

└── default

    ├── homelab-web Deployment
    ├── PostgreSQL Deployment
    ├── Services
    ├── Secret
    ├── ConfigMap
    ├── PVC
    └── PV
```

This worked, but it is not a good long-term structure.

Problems:

* all resources are mixed together
* harder maintenance
* harder troubleshooting
* difficult to scale when adding more applications

---

# 4. Creating a Dedicated Namespace

A dedicated namespace was created:

```
homelab
```

Namespaces provide logical separation inside the same Kubernetes cluster.

New structure:

```
Cluster

├── kube-system
│
├── default
│
└── homelab

    ├── Node.js application
    ├── PostgreSQL
    ├── Services
    ├── Secrets
    ├── ConfigMaps
    └── Storage
```

A namespace is not a virtual machine.

It is a logical organization boundary for Kubernetes resources.

---

# 5. Persistent Storage Migration

The PostgreSQL database originally used:

```
PostgreSQL Pod

        |
        |
        v

postgres-pvc (default namespace)

        |
        |
        v

postgres-pv

        |
        |
        v

/data/postgres
```

The problem:

PVCs are namespace-scoped resources.

A PVC from the `default` namespace cannot be directly used by a Deployment inside the `homelab` namespace.

---

# 6. Persistent Volume (PV)

A Persistent Volume represents actual storage available to Kubernetes.

Example:

```
postgres-pv

Capacity:
5Gi

Storage:
 /data/postgres
```

Important:

Persistent Volumes are cluster-wide resources.

They do not belong to a namespace.

---

# 7. Persistent Volume Claim (PVC)

A Persistent Volume Claim is a request from an application for storage.

Example:

```
postgres-pvc

Namespace:
homelab

Requested storage:
5Gi
```

The relationship:

```
Application Pod

      |
      |
      v

Persistent Volume Claim

      |
      |
      v

Persistent Volume

      |
      |
      v

Physical disk
```

After migration:

```
homelab namespace

PostgreSQL Pod

      |
      |
      v

postgres-pvc

      |
      |
      v

postgres-pv

      |
      |
      v

/data/postgres
```

The database data remains persistent.

---

# 8. Persistent Volume Reclaim Policy

The PV uses:

```
persistentVolumeReclaimPolicy: Retain
```

Meaning:

If the PVC is deleted:

* Kubernetes does not delete the data
* the disk remains available
* an administrator can reconnect it later

This is safer for databases.

---

# 9. PostgreSQL Deployment

PostgreSQL was migrated into the:

```
homelab
```

namespace.

A Deployment defines:

* container image
* number of replicas
* environment variables
* storage mounts
* pod configuration

Deployment hierarchy:

```
Deployment

      |
      |
      v

ReplicaSet

      |
      |
      v

Pod

      |
      |
      v

Container
```

---

# 10. Kubernetes Secrets

Sensitive values are stored inside Kubernetes Secrets.

Examples:

* database username
* database password
* database name

Before migration:

```
default namespace

postgres-secret
```

After migration:

```
homelab namespace

postgres-secret
```

The Deployment reads values using:

```
secretKeyRef
```

Flow:

```
Pod

 |
 |
 v

Secret

 |
 |
 v

Environment Variables
```

---

# 11. ConfigMaps

ConfigMaps store application configuration that is not sensitive.

Example:

```
homelab-web-config

LOG_LEVEL=info
NODE_ENV=production
PORT=3000
```

The application receives these values through environment variables.

Flow:

```
Deployment

      |
      |
      v

ConfigMap

      |
      |
      v

Application Environment
```

---

# 12. Node.js Application

The web application runs as a Kubernetes Deployment.

Architecture:

```
homelab-web Deployment

        |
        |
        v

Node.js Pod

        |
        |
        v

Node.js Container

        |
        |
        v

Port 3000
```

Container image:

```
ghcr.io/msmidegas/homelab-web:latest
```

---

# 13. Kubernetes Service

Pods are temporary.

A Pod can restart and receive a new name:

```
homelab-web-6857445885-xxxxx
```

A Service provides a stable network endpoint.

Example:

```
homelab-web-service
```

Traffic flow:

```
Ingress

 |
 |
 v

Service

 |
 |
 v

Pod
```

---

# 14. Ingress and Traefik

Ingress provides HTTP routing.

The application is accessed through:

```
http://homelab.local
```

Traffic flow:

```
Browser

 |
 |
 v

hosts file / DNS

 |
 |
 v

Traefik

 |
 |
 v

Ingress Rule

 |
 |
 v

homelab-web-service

 |
 |
 v

Node.js Pod
```

---

# 15. Local DNS Configuration

A local DNS entry is used:

```
192.168.x.x homelab.local
```

This can be configured in:

Windows:

```
C:\Windows\System32\drivers\etc\hosts
```

Linux:

```
/etc/hosts
```

This allows:

```
curl http://homelab.local
```

---

# 16. Why Direct IP Access Does Not Work

Using:

```
curl http://IP_ADDRESS
```

sends:

```
Host: IP_ADDRESS
```

The Ingress rule expects:

```
Host: homelab.local
```

Traefik uses the Host header to decide where traffic should go.

Testing with IP:

```
curl -H "Host: homelab.local" http://IP_ADDRESS
```

will work because the correct Host header is provided.

---

# 17. Final Architecture

```
                 User

                  |
                  |

            homelab.local

                  |
                  |

             Traefik

                  |
                  |

              Ingress

                  |
                  |

       homelab-web-service

                  |
                  |

          Node.js Pod

                  |
                  |

          PostgreSQL Service

                  |
                  |

          PostgreSQL Pod

                  |
                  |

          postgres-pvc

                  |
                  |

          postgres-pv

                  |
                  |

          /data/postgres
```

---

# 18. Kubernetes Components Used

| Component  | Purpose                         |
| ---------- | ------------------------------- |
| Namespace  | Logical separation of resources |
| Deployment | Manages application lifecycle   |
| Pod        | Runs containers                 |
| Container  | Application runtime             |
| Service    | Stable network endpoint         |
| Ingress    | HTTP routing                    |
| ConfigMap  | Application configuration       |
| Secret     | Sensitive configuration         |
| PV         | Persistent storage              |
| PVC        | Storage request                 |

---

# 19. Current Project Status

Completed:

✅ Kubernetes namespace separation
✅ PostgreSQL persistent storage
✅ Secret management
✅ ConfigMap management
✅ Kubernetes Services
✅ Traefik Ingress
✅ Local DNS routing
✅ Git-managed Kubernetes manifests

Next improvements:

1. Remove hardcoded values from YAML files
2. Improve Secret handling
3. Add readiness and liveness probes
4. Add CPU and memory resource limits
5. Improve CI/CD pipeline
6. Add monitoring with Prometheus and Grafana
7. Add automated database backups

---

# Conclusion

The project now follows a more realistic Kubernetes architecture.

The application is separated into logical resources, storage is persistent, configuration is managed through Kubernetes primitives, and external traffic is routed through an Ingress controller.

This creates a foundation that can later be expanded with monitoring, automation, security improvements, and additional services.

