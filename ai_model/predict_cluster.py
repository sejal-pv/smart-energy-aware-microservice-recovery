import time
import joblib
import requests
import numpy as np
import pandas as pd

MODEL_PATH = r"C:\Users\verne\SmartEnergy\ai_model\cloud_cluster_model.pkl"
API_URL = "http://localhost:9191/api/alerts"

print("🤖 Loading trained cluster pipeline...")
pipeline = joblib.load(MODEL_PATH)

scaler = pipeline["scaler"]
kmeans = pipeline["kmeans"]
classifier = pipeline["classifier"]
feature_cols = pipeline["feature_cols"]

print("✅ Cluster pipeline loaded successfully!")

def generate_dummy_metrics():
    return {
        "CPU_Usage (%)": np.random.uniform(10, 95),
        "Memory_Usage (MB)": np.random.uniform(500, 8000),
        "Network_Usage (MBps)": np.random.uniform(1, 500),
        "Disk_IO (MBps)": np.random.uniform(10, 200),
        "Energy_Consumption (Watts)": np.random.uniform(50, 300),
        "Service_Latency (ms)": np.random.uniform(1, 200),
        "Predicted_Workload (%)": np.random.uniform(10, 100),
        "Task_Priority": np.random.randint(1, 5),
        "Workload_Type": np.random.randint(0, 2)
    }

def predict_cluster(metrics_dict):
    df = pd.DataFrame([metrics_dict])
    
    df["cpu_mem_ratio"] = df["CPU_Usage (%)"] / (df["Memory_Usage (MB)"] + 1)
    df["network_disk_ratio"] = df["Network_Usage (MBps)"] / (df["Disk_IO (MBps)"] + 1)
    df["energy_latency_ratio"] = df["Energy_Consumption (Watts)"] / (df["Service_Latency (ms)"] + 1)

    df = df[feature_cols]

    pred = classifier.predict(df)[0]
    return int(pred)

def send_to_backend(cluster, metrics):
    payload = {
        "serviceName": "smart-energy-service",
        "cluster": cluster,
        "metrics": metrics
    }

    try:
        res = requests.post(API_URL, json=payload)
        if res.status_code == 200:
            print(f"[✔] Sent cluster {cluster} → backend")
        else:
            print(f"[⚠] Backend error: {res.status_code}")
    except Exception as e:
        print(f"[❌] Connection Error: {e}")

print("🚀 Cluster Predictor Started — sending every 10 seconds...")

while True:
    metrics = generate_dummy_metrics()
    cluster = predict_cluster(metrics)
    send_to_backend(cluster, metrics)
    time.sleep(10)
