# IP Reverser

A lightweight Kubernetes-deployable application that performs IP lookup / reverse IP resolution through a simple web interface and backend **API**.

This project is packaged as a **Helm chart** for easy deployment into Kubernetes environments.

---

## 📦 Project Structure

ip-reverser/ ├── templates/ │ ├── backend.yaml │ ├── frontend.yaml │ ├── ingress.yaml │ ├── Chart.yaml ├── values.yaml ├── .helmignore └── **README**.md

---

## 🚀 Features

- Reverse IP lookup capability
- Frontend and Backend separation
- Kubernetes-native deployment
- Helm chart packaging
- Ingress support
- Configurable via `values.yaml`

---

## 🛠 Requirements

- Kubernetes cluster (v1.20+ recommended)
- Helm v3+

---

## 📥 Installation

### 1️⃣ Clone the repository

```bash git clone [https://github.com/<your-username>/ip-reverser.git](https://github.com/<your-username>/ip-reverser.git) cd ip-reverser 2️⃣ Install using Helm helm install ip-reverser . Install with custom values:

helm install ip-reverser . -f values.yaml ⚙️ Configuration All configurable parameters are located in:

values.yaml Example configuration:

backend:
    replicaCount: 2
    image:
    repository: your-backend-image
    tag: latest

frontend: replicaCount: 1 You can configure:

Image repositories and tags

Replica counts

Service types (ClusterIP / NodePort / LoadBalancer)

Ingress host and annotations

Resource requests and limits

🌐 Accessing the Application If using Ingress:

kubectl get ingress If using NodePort:

kubectl get svc Update your /etc/hosts if required to map the ingress host.

🔄 Upgrade helm upgrade ip-reverser . 🗑 Uninstall helm uninstall ip-reverser 🧪 Verify Deployment kubectl get pods kubectl get svc kubectl get ingress 🧱 Architecture User → Ingress → Frontend Service → Backend Service Ingress routes external traffic

Frontend handles user interaction

Backend processes IP reverse lookup logic

🛡 Production Recommendations Use a production-grade ingress controller (**NGINX**, Traefik, etc.)

Configure resource limits

Avoid using latest image tags

Enable **TLS** for secure access

Consider adding Horizontal Pod Autoscaler (**HPA**)

Logging improvements

Automated testing
