"""
Failure Prediction Service - Uses AI models to predict failures
"""
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class FailurePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.cluster_model = None
        self.prediction_history = []
        
        # Feature columns expected by the model
        self.feature_columns = [
            'cpu_usage_percent',
            'memory_usage_percent',
            'disk_io_percent',
            'network_latency_ms',
            'energy_consumption_watts',
            'request_rate',
            'error_rate',
            'response_time_ms'
        ]
    
    async def initialize(self):
        """Initialize the predictor and load models"""
        logger.info("🤖 Initializing Failure Predictor...")
        
        try:
            # Load pre-trained models
            model_path = "ai_model/trained_cluster_model.pkl"
            scaler_path = "ai_model/scaler.pkl"
            cluster_path = "ai_model/cloud_cluster_model.pkl"
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info("✅ Loaded failure prediction model")
            else:
                logger.warning("❌ Model file not found, using rule-based prediction")
            
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            if os.path.exists(cluster_path):
                self.cluster_model = joblib.load(cluster_path)
            
            logger.info("✅ Failure Predictor initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize predictor: {e}")
            return False
    
    async def predict(self, metrics: Dict[str, Dict]) -> Dict[str, Dict]:
        """Predict failures for all services"""
        predictions = {}
        
        for service_id, service_metrics in metrics.items():
            try:
                prediction = await self.predict_service(service_id, service_metrics)
                predictions[service_id] = prediction
                
                # Store in history
                self.prediction_history.append({
                    'timestamp': datetime.now(),
                    'service_id': service_id,
                    'prediction': prediction
                })
                
            except Exception as e:
                logger.error(f"Prediction failed for {service_id}: {e}")
                predictions[service_id] = self.get_default_prediction()
        
        # Keep only last 1000 predictions
        if len(self.prediction_history) > 1000:
            self.prediction_history = self.prediction_history[-1000:]
        
        logger.info(f"🔮 Made predictions for {len(predictions)} services")
        return predictions
    
    async def predict_service(self, service_id: str, metrics: Dict) -> Dict:
        """Predict failure for a single service"""
        if self.model is None:
            # Fallback to rule-based prediction
            return self.rule_based_prediction(metrics)
        
        try:
            # Prepare features
            features = self.extract_features(metrics)
            
            if features is None:
                return self.rule_based_prediction(metrics)
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict failure probability
            probability = self.model.predict_proba(features_scaled)[0][1]
            
            # Determine cluster
            cluster = self.determine_cluster(features, probability)
            
            prediction = {
                'service_id': service_id,
                'will_fail': probability > 0.7,  # Threshold
                'probability': float(probability),
                'cluster': cluster,
                'confidence': self.calculate_confidence(probability),
                'features_used': self.feature_columns,
                'timestamp': datetime.now().isoformat(),
                'model_used': 'ml'
            }
            
            if prediction['will_fail']:
                logger.warning(f"🔴 Failure predicted for {service_id}: "
                             f"{probability:.1%} (Cluster: {cluster})")
            
            return prediction
            
        except Exception as e:
            logger.error(f"ML prediction failed for {service_id}: {e}")
            return self.rule_based_prediction(metrics)
    
    def extract_features(self, metrics: Dict) -> np.ndarray:
        """Extract features from metrics"""
        try:
            features = []
            for col in self.feature_columns:
                if col in metrics:
                    features.append(float(metrics[col]))
                else:
                    # Use default value if missing
                    default_values = {
                        'cpu_usage_percent': 0.0,
                        'memory_usage_percent': 0.0,
                        'disk_io_percent': 0.0,
                        'network_latency_ms': 0.0,
                        'energy_consumption_watts': 0.0,
                        'request_rate': 0.0,
                        'error_rate': 0.0,
                        'response_time_ms': 0.0
                    }
                    features.append(default_values.get(col, 0.0))
            
            return np.array(features)
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            return None
    
    def determine_cluster(self, features: np.ndarray, probability: float) -> int:
        """Determine failure cluster"""
        if self.cluster_model is not None:
            try:
                return int(self.cluster_model.predict([features])[0])
            except:
                pass
        
        # Rule-based clustering
        cpu_usage = features[0] if len(features) > 0 else 0
        memory_usage = features[1] if len(features) > 1 else 0
        energy_consumption = features[4] if len(features) > 4 else 0
        error_rate = features[6] if len(features) > 6 else 0
        response_time = features[7] if len(features) > 7 else 0
        
        if cpu_usage > 90 or memory_usage > 90:
            return 1  # Resource exhaustion
        elif energy_consumption > 200:
            return 2  # Energy spike
        elif response_time > 1000:
            return 3  # Network issues
        elif error_rate > 0.1:
            return 4  # High error rate
        elif probability > 0.5:
            return 5  # General degradation
        
        return 0  # No specific cluster
    
    def rule_based_prediction(self, metrics: Dict) -> Dict:
        """Rule-based prediction as fallback"""
        # Simple rules based on thresholds
        will_fail = False
        probability = 0.0
        
        if metrics.get('cpu_usage_percent', 0) > 90:
            will_fail = True
            probability = 0.85
        elif metrics.get('memory_usage_percent', 0) > 90:
            will_fail = True
            probability = 0.80
        elif metrics.get('error_rate', 0) > 0.2:
            will_fail = True
            probability = 0.75
        elif metrics.get('energy_consumption_watts', 0) > 250:
            will_fail = True
            probability = 0.70
        
        # Determine cluster
        cluster = self.determine_cluster(
            self.extract_features(metrics) or np.zeros(len(self.feature_columns)),
            probability
        )
        
        return {
            'service_id': metrics.get('service_id', 'unknown'),
            'will_fail': will_fail,
            'probability': probability,
            'cluster': cluster,
            'confidence': self.calculate_confidence(probability),
            'features_used': list(metrics.keys()),
            'timestamp': datetime.now().isoformat(),
            'model_used': 'rule_based'
        }
    
    def calculate_confidence(self, probability: float) -> float:
        """Calculate prediction confidence"""
        # Confidence is higher when probability is close to 0 or 1
        return 1 - abs(probability - 0.5) * 2
    
    def get_default_prediction(self) -> Dict:
        """Get default prediction"""
        return {
            'will_fail': False,
            'probability': 0.0,
            'cluster': 0,
            'confidence': 0.0,
            'model_used': 'none',
            'error': 'Prediction failed'
        }
    
    def get_prediction_history(self, service_id: str = None):
        """Get prediction history"""
        if service_id:
            return [p for p in self.prediction_history if p['service_id'] == service_id]
        return self.prediction_history
    
    def get_prediction_stats(self) -> Dict:
        """Get prediction statistics"""
        if not self.prediction_history:
            return {}
        
        total = len(self.prediction_history)
        failure_predictions = sum(1 for p in self.prediction_history 
                                 if p['prediction']['will_fail'])
        
        return {
            'total_predictions': total,
            'failure_predictions': failure_predictions,
            'failure_rate_percentage': (failure_predictions / total * 100) if total > 0 else 0,
            'average_confidence': sum(p['prediction']['confidence'] 
                                     for p in self.prediction_history) / total if total > 0 else 0,
            'ml_predictions': sum(1 for p in self.prediction_history 
                                 if p['prediction']['model_used'] == 'ml'),
            'rule_based_predictions': sum(1 for p in self.prediction_history 
                                         if p['prediction']['model_used'] == 'rule_based')
        }