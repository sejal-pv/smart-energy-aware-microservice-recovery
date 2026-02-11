import requests
import time
import random

MODEL_URL = "http://localhost:5005/predict"
BACKEND_URL = "http://localhost:9191/api/alerts/process"

def generate_metrics():
    return {
        "cpu": round(random.uniform(10, 95), 2),
        "memory": round(random.uniform(100, 900), 2),
        "disk": round(random.uniform(1, 40), 2),
        "network": round(random.uniform(1, 15), 2),
        "latency": round(random.uniform(10, 200), 2)
    }

while True:
    metrics = generate_metrics()

    # 1️⃣ Send real metrics to ML model
    ml_response = requests.post(MODEL_URL, json=metrics).json()
    cluster = ml_response["cluster"]

    # 2️⃣ Forward prediction to backend
    payload = {
        "serviceName": "backend",
        "cluster": cluster,
        "metrics": metrics
    }

    print(f"📤 Predicted cluster {cluster}, sending to backend...")
    requests.post(BACKEND_URL, json=payload)

    time.sleep(10)
