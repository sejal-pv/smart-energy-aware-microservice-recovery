import time, random, requests, psutil

API_URL = "http://localhost:8080/api/metrics"
SERVICES = ["user-service", "order-service", "billing-service", "monitoring-agent"]

def collect_metrics():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().used / (1024 * 1024)  # in MB
    network = round(random.uniform(0.1, 10.0), 2)
    disk = round(random.uniform(0.1, 20.0), 2)
    energy = round(10 + 0.4 * cpu + 0.002 * memory, 2)
    latency = int(random.uniform(50, 250))
    service = random.choice(SERVICES)

    data = {
        "serviceName": service,
        "cpu": cpu,
        "memory": memory,
        "network": network,
        "diskIO": disk,
        "energy": energy,
        "latencyMs": latency
    }

    return data

print("🚀 SmartEnergy Agent started. Sending metrics every 5 seconds...")

while True:
    try:
        metric = collect_metrics()
        response = requests.post(API_URL, json=metric, timeout=5)
        if response.status_code == 200:
            print(f"[✔] Sent → {metric['serviceName']} | CPU: {metric['cpu']} | MEM: {metric['memory']:.2f} MB | Energy: {metric['energy']}")
        else:
            print(f"[❌] Failed ({response.status_code}) → {metric}")
    except Exception as e:
        print(f"[⚠] Error: {e}")
    time.sleep(5)
