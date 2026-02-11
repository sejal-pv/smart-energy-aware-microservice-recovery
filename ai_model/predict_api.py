from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load trained KMeans model
MODEL_PATH = "trained_cluster_model.pkl"
model = joblib.load(MODEL_PATH)

@app.route("/predict", methods=["POST"])
def predict_cluster():
    data = request.json
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400

    required = [
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

    # Check if all features exist
    for key in required:
        if key not in data:
            return jsonify({"error": f"Missing feature: {key}"}), 400

    # Convert to numpy array
    features = np.array([data[key] for key in required]).reshape(1, -1)

    # Predict cluster
    cluster = int(model.predict(features)[0])

    return jsonify({
        "cluster": cluster,
        "received_features": data
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
