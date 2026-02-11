"""
FastAPI Backend Server – Integrated with Real HealingController
Project: PES1PG24CA158
Student: Sejal P Vernekar
"""
import sys
import os
from pathlib import Path

# ---------- FIX PYTHON PATH ----------
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))
# --------------------------------------

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import asyncio
import random
from datetime import datetime
from typing import List, Dict
import logging

# ----- YOUR ACTUAL HEALING CONTROLLER -----
from backend.healing_controller import HealingController, HealingStrategy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== LIFESPAN (modern FastAPI) ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Backend starting – real healing controller active")
    simulation_task = asyncio.create_task(simulate_real_time_updates())
    yield
    logger.info("🛑 Shutting down...")
    simulation_task.cancel()
    try:
        await simulation_task
    except asyncio.CancelledError:
        logger.info("Simulation cancelled")
    logger.info("✅ Shutdown complete")

# ========== FastAPI app ==========
app = FastAPI(title="Smart Energy-Aware Recovery API", lifespan=lifespan)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== WebSocket Manager ==========
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ========== Instantiate your HealingController ==========
healing_controller = HealingController()

# ========== Simulated System Data ==========
system_data = {
    "services": [
        {"id": 1, "name": "payment-service-1", "status": "Running", "node": "node-1", "cpu": 45, "memory": 512, "restartCount": 0},
        {"id": 2, "name": "auth-service-1", "status": "Running", "node": "node-2", "cpu": 32, "memory": 256, "restartCount": 0},
        {"id": 3, "name": "inventory-service-1", "status": "Warning", "node": "node-3", "cpu": 85, "memory": 1800, "restartCount": 2},
        {"id": 4, "name": "database-service-1", "status": "Running", "node": "node-1", "cpu": 25, "memory": 2048, "restartCount": 1},
        {"id": 5, "name": "cache-service-1", "status": "Error", "node": "node-2", "cpu": 95, "memory": 512, "restartCount": 3},
    ],
    "logs": [],
    "predictions": [],
    "metrics": {
        "cpu_series": [45, 52, 48, 60, 55, 65, 70],
        "mem_series": [800, 850, 900, 950, 1000, 1050, 1100],
        "network_series": [10, 12, 8, 15, 18, 20, 16],
        "system_health": 85,
        "energy_score": 85
    }
}

# ========== API Endpoints ==========
@app.get("/")
async def root():
    return {"message": "Smart Energy-Aware Recovery API", "version": "1.0.0"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/services")
async def get_services():
    return system_data["services"]

@app.get("/api/logs")
async def get_logs(limit: int = 20):
    return system_data["logs"][-limit:]

@app.get("/api/predictions")
async def get_predictions():
    if system_data["predictions"]:
        return system_data["predictions"][-1]
    return {
        "prediction": "Low Risk",
        "confidence": 85,
        "action": "System is stable, continue monitoring.",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/metrics")
async def get_metrics():
    return system_data["metrics"]

@app.get("/api/stats")
async def get_stats():
    total = len(system_data["services"])
    running = len([s for s in system_data["services"] if s["status"] == "Running"])
    warning = len([s for s in system_data["services"] if s["status"] == "Warning"])
    error = len([s for s in system_data["services"] if s["status"] == "Error"])
    return {
        "total_services": total,
        "running_services": running,
        "warning_services": warning,
        "error_services": error,
        "system_health": system_data["metrics"]["system_health"],
        "energy_score": system_data["metrics"]["energy_score"],
        "cpu_usage": system_data["metrics"]["cpu_series"][-1],
        "memory_usage": system_data["metrics"]["mem_series"][-1],
        "network_io": system_data["metrics"]["network_series"][-1],
    }

# ========== HEALING ENDPOINT – uses your controller ==========
@app.post("/api/healing/{service_id}")
async def trigger_healing(service_id: int):
    service = next((s for s in system_data["services"] if s["id"] == service_id), None)
    if not service:
        return {"error": "Service not found"}

    if service.get("healing_in_progress", False):
        return {"error": "Healing already in progress"}

    asyncio.create_task(auto_heal_service(service))
    return {"success": True, "message": f"Healing initiated for {service['name']}"}

# ========== AUTO-HEALING – now calls real HealingController ==========
async def auto_heal_service(service: dict):
    """Perform healing using your actual HealingController and broadcast results"""
    service["healing_in_progress"] = True

    # ----- Build a prediction dict that your controller expects -----
    # (cluster is derived from CPU/status, probability is simulated)
    cluster = 1 if service["cpu"] > 80 else 2 if service["cpu"] > 60 else 5
    prediction = {
        "cluster": cluster,
        "probability": random.uniform(0.7, 0.95),
        "will_fail": True
    }

    # ----- Broadcast HEALING_STARTED -----
    start_log = {
        "id": len(system_data["logs"]) + 1,
        "service_id": service["id"],
        "service_name": service["name"],
        "action": "AUTO_HEALING_TRIGGERED",
        "status": "HEALING",
        "timestamp": datetime.now().isoformat(),
        "details": f"Auto-healing started for {service['name']} (CPU: {service['cpu']}%)"
    }
    system_data["logs"].append(start_log)
    await manager.broadcast({"type": "healing_started", "service": service, "log": start_log})

    # ----- CALL YOUR REAL HEALING CONTROLLER -----
    result = await healing_controller.execute_healing(
        service_id=str(service["id"]),
        prediction=prediction
    )

    if result["success"]:
        # ----- Update service status -----
        service["status"] = "Running"
        service["cpu"] = random.randint(20, 50)
        service["memory"] = random.randint(256, 1024)
        service["restartCount"] += 1
        service["healing_in_progress"] = False

        # ----- Broadcast HEALING_COMPLETED with real energy savings -----
        complete_log = {
            "id": len(system_data["logs"]) + 1,
            "service_id": service["id"],
            "service_name": service["name"],
            "action": "HEALING_COMPLETED",
            "status": "RECOVERED",
            "timestamp": datetime.now().isoformat(),
            "details": f"Service {service['name']} recovered using {result['strategy']}",
            "energy_saved": round(result.get("energy_saved", 0), 3),
            "carbon_reduced": round(result.get("carbon_reduced", 0), 3)
        }
        system_data["logs"].append(complete_log)
        await manager.broadcast({
            "type": "healing_completed",
            "service": service,
            "log": complete_log
        })

        logger.info(f"✅ Healing success for {service['name']}: {result['strategy']} – "
                    f"Saved {result['energy_saved']:.3f} kWh, "
                    f"Reduced {result['carbon_reduced']:.3f} kg CO2")
    else:
        # ----- Healing failed -----
        service["healing_in_progress"] = False
        logger.error(f"❌ Healing failed for {service['name']}: {result.get('error')}")
        await manager.broadcast({
            "type": "healing_failed",
            "service": service,
            "error": result.get("error", "Unknown error")
        })

# ========== WebSocket Endpoint ==========
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(10)
            await websocket.send_json({"type": "ping", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ========== Background Simulation (triggers your auto-healing) ==========
async def simulate_real_time_updates():
    """Periodically update metrics and trigger auto-healing for high-risk services"""
    while True:
        await asyncio.sleep(5)

        # Random status changes
        for service in system_data["services"]:
            if not service.get("healing_in_progress", False):
                if random.random() < 0.1:
                    service["status"] = random.choice(["Warning", "Error"])
                    service["cpu"] = random.randint(70, 95)
                    service["memory"] = random.randint(1500, 2000)

        # Update time series
        new_cpu = max(10, min(100, system_data["metrics"]["cpu_series"][-1] + random.randint(-5, 5)))
        new_mem = max(500, min(2000, system_data["metrics"]["mem_series"][-1] + random.randint(-50, 50)))
        new_net = max(5, min(30, system_data["metrics"]["network_series"][-1] + random.randint(-2, 2)))
        system_data["metrics"]["cpu_series"].append(new_cpu)
        system_data["metrics"]["mem_series"].append(new_mem)
        system_data["metrics"]["network_series"].append(new_net)
        for key in ["cpu_series", "mem_series", "network_series"]:
            if len(system_data["metrics"][key]) > 50:
                system_data["metrics"][key] = system_data["metrics"][key][-50:]

        # Health & energy score
        running_ratio = len([s for s in system_data["services"] if s["status"] == "Running"]) / len(system_data["services"])
        system_data["metrics"]["system_health"] = int(running_ratio * 100)
        avg_cpu = sum(s["cpu"] for s in system_data["services"]) / len(system_data["services"])
        system_data["metrics"]["energy_score"] = int(max(0, min(100, 100 - (avg_cpu * 0.5))))

        # AI Prediction
        if avg_cpu > 70:
            prediction = {
                "prediction": "High Risk",
                "confidence": random.randint(80, 95),
                "action": "⚠️ Immediate action required!",
                "timestamp": datetime.now().isoformat()
            }
            # Auto-heal troubled services
            troubled = [s for s in system_data["services"]
                        if s["status"] in ["Warning", "Error"] and not s.get("healing_in_progress", False)]
            for svc in troubled[:2]:
                asyncio.create_task(auto_heal_service(svc))
        elif avg_cpu > 50:
            prediction = {
                "prediction": "Medium Risk",
                "confidence": random.randint(70, 85),
                "action": "Monitor closely.",
                "timestamp": datetime.now().isoformat()
            }
        else:
            prediction = {
                "prediction": "Low Risk",
                "confidence": random.randint(85, 95),
                "action": "System stable.",
                "timestamp": datetime.now().isoformat()
            }
        system_data["predictions"].append(prediction)
        if len(system_data["predictions"]) > 10:
            system_data["predictions"] = system_data["predictions"][-10:]

        # Broadcast metrics
        await manager.broadcast({
            "type": "metrics_update",
            "metrics": system_data["metrics"],
            "prediction": prediction
        })

if __name__ == "__main__":
    uvicorn.run("backend.api_server:app", host="0.0.0.0", port=8000, reload=True)