# ⚡ Smart Energy-Aware Microservice Recovery Framework

A cloud-native intelligent recovery system designed to optimize microservice fault handling while minimizing energy consumption in distributed cloud environments.

This project integrates AI-driven decision making with Kubernetes-based recovery mechanisms to ensure high availability and sustainable cloud operations.

---

## 📌 Problem Statement

Traditional microservice recovery mechanisms restart or scale services without considering energy efficiency.  
This leads to:

- Unnecessary scaling
- Resource wastage
- Increased operational costs
- Higher energy consumption

This framework introduces **energy-aware intelligent recovery decisions** using machine learning.

---

## 🏗 System Architecture

The system consists of the following components:

1. **React Frontend Dashboard**
   - Real-time monitoring
   - Metrics visualization
   - Alert display

2. **Spring Boot Backend**
   - Core recovery engine
   - REST APIs
   - Healing decision logic
   - Kubernetes interaction

3. **Flask AI Service**
   - Energy prediction model
   - Failure probability estimation
   - Smart recovery recommendations

4. **Kubernetes Cluster**
   - Pod management
   - Service scaling
   - Automated recovery execution

5. **Prometheus Monitoring**
   - Metrics collection
   - Performance tracking

---

## ⚙️ Tech Stack

### Backend
- Java
- Spring Boot
- REST APIs

### AI Service
- Python
- Flask
- CatBoost / ML Models

### Frontend
- React
- Chart.js

### DevOps & Cloud
- Docker
- Docker Compose
- Kubernetes
- Prometheus

---

## 🔄 Core Features

- ✅ Real-time microservice health monitoring
- ✅ AI-based energy consumption prediction
- ✅ Intelligent healing decision engine
- ✅ Kubernetes pod restart & scaling automation
- ✅ Centralized logging
- ✅ Interactive analytics dashboard
- ✅ Energy-aware optimization strategy

---

## 🐳 Running with Docker

Make sure Docker is installed.

```bash
docker-compose up --build
