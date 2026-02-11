from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained model
MODEL_PATH = "trained_cluster_model.pkl"
model = joblib.load(MODEL_PATH)

# Expected feature names (must match JSON request)
FEATURES = [
    "CPU_Usage (%)",
    "Memory_Usage (MB)",
    "Network_Usage (MBps)",
    "Disk_Usage (%)",
    "IO_Load",
    "Latency",
    "Requests",
    "Temp",
    "Voltage",
    "Power"
]

@app.route("/predict", methods=["POST"])
def predict_cluster():
    data = request.json

    # Validate all required features
    for f in FEATURES:
        if f not in data:
            return jsonify({"error": f"Missing feature: {f}"}), 400

    # Convert to numpy array
    features = np.array([data[f] for f in FEATURES]).reshape(1, -1)

    # Predict
    cluster = int(model.predict(features)[0])

    return jsonify({"cluster": cluster})

if __name__ == "__main__":
    print("🚀 Prediction server running on port 5005")
    app.run(host="0.0.0.0", port=5005)
