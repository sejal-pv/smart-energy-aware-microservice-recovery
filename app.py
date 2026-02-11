from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load model (adjust path as needed)
try:
    with open('trained_cluster_model.pld', 'rb') as f:
        model = pickle.load(f)
except:
    model = None

@app.route("/")
def home():
    return jsonify({
        "cpu": 55, "memory": 356, "network": 12, "disk": 45,
        "io": 30, "latency": 120, "requests": 240,
        "temp": 62, "voltage": 228, "power": 70
    })

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400
    
    try:
        # Process data and make prediction
        # Adjust this based on your model's requirements
        features = pd.DataFrame([data])
        prediction = model.predict(features)
        
        return jsonify({
            "prediction": prediction.tolist(),
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5005, debug=True)