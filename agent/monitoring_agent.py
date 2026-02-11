import asyncio
import random
import psutil
import socket
from datetime import datetime
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class MetricsAgent:
    def __init__(self):
        self.services = []
        self.metrics_history = []
    
    async def initialize(self):
        """Initialize the metrics agent"""
        logger.info("📊 Initializing Metrics Agent...")
        self.services = self.discover_services()
        logger.info(f"✅ Discovered {len(self.services)} services")
        return True
    
    def discover_services(self) -> List[Dict]:
        """Discover microservices in the environment"""
        # In real implementation, this would query Kubernetes, Docker, or service registry
        services = [
            {
                'id': 'user-service-001',
                'name': 'User Service',
                'type': 'backend',
                'endpoint': 'http://user-service:8080',
                'criticality': 'high',
                'energy_profile': 'medium'
            },
            {
                'id': 'payment-service-001',
                'name': 'Payment Service',
                'type': 'backend',
                'endpoint': 'http://payment-service:8081',
                'criticality': 'critical',
                'energy_profile': 'high'
            },
            {
                'id': 'auth-service-001',
                'name': 'Authentication Service',
                'type': 'security',
                'endpoint': 'http://auth-service:8082',
                'criticality': 'high',
                'energy_profile': 'low'
            },
            {
                'id': 'database-service-001',
                'name': 'Database Service',
                'type': 'database',
                'endpoint': 'http://database:5432',
                'criticality': 'critical',
                'energy_profile': 'high'
            },
            {
                'id': 'cache-service-001',
                'name': 'Cache Service',
                'type': 'cache',
                'endpoint': 'http://cache:6379',
                'criticality': 'medium',
                'energy_profile': 'medium'
            }
        ]
        return services
    
    async def collect_metrics(self) -> Dict[str, Dict]:
        """Collect metrics for all services"""
        all_metrics = {}
        
        for service in self.services:
            try:
                metrics = await self.collect_service_metrics(service)
                all_metrics[service['id']] = metrics
                
                # Store in history
                self.metrics_history.append({
                    'timestamp': datetime.now(),
                    'service_id': service['id'],
                    'metrics': metrics
                })
                
            except Exception as e:
                logger.error(f"Failed to collect metrics for {service['id']}: {e}")
                # Return default metrics
                all_metrics[service['id']] = self.get_default_metrics()
        
        # Keep only last 1000 entries
        if len(self.metrics_history) > 1000:
            self.metrics_history = self.metrics_history[-1000:]
        
        logger.info(f"✅ Collected metrics for {len(all_metrics)} services")
        return all_metrics
    
    async def collect_service_metrics(self, service: Dict) -> Dict:
        """Collect metrics for a single service"""
        # Simulate collecting metrics (replace with actual collection)
        await asyncio.sleep(0.1)  # Simulate network delay
        
        # System metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        # Service-specific metrics (simulated)
        metrics = {
            'service_id': service['id'],
            'service_name': service['name'],
            'timestamp': datetime.now().isoformat(),
            
            # System metrics
            'cpu_usage_percent': cpu_percent,
            'memory_usage_percent': memory.percent,
            'memory_available_gb': memory.available / (1024**3),
            'disk_io_percent': random.uniform(0, 100),
            'network_latency_ms': random.uniform(10, 500),
            
            # Application metrics
            'request_rate': random.uniform(50, 1000),
            'error_rate': random.uniform(0.001, 0.05),
            'response_time_ms': random.uniform(50, 800),
            'active_connections': random.randint(10, 500),
            
            # Energy metrics (simulated)
            'energy_consumption_watts': self.calculate_energy_consumption(service),
            'carbon_footprint_kg': self.calculate_carbon_footprint(service),
            'energy_efficiency_score': random.uniform(0.7, 0.95),
            
            # Health status
            'health_score': self.calculate_health_score(service),
            'status': 'healthy' if random.random() > 0.1 else 'unhealthy'
        }
        
        return metrics
    
    def calculate_energy_consumption(self, service: Dict) -> float:
        """Calculate energy consumption for a service"""
        base_energy = {
            'low': 50,    # watts
            'medium': 150,
            'high': 300
        }.get(service['energy_profile'], 100)
        
        # Add variation based on load
        variation = random.uniform(0.8, 1.5)
        return base_energy * variation
    
    def calculate_carbon_footprint(self, service: Dict) -> float:
        """Calculate carbon footprint in kg CO2"""
        energy_consumption = self.calculate_energy_consumption(service)
        # Assuming 0.233 kg CO2 per kWh (US average)
        # Convert watts to kW and assume 1 hour of operation
        return (energy_consumption / 1000) * 0.233
    
    def calculate_health_score(self, service: Dict) -> float:
        """Calculate health score (0-100)"""
        # Simulate health score calculation
        base_score = 85.0
        variation = random.uniform(-15, 15)
        return max(0, min(100, base_score + variation))
    
    def get_default_metrics(self) -> Dict:
        """Get default metrics when collection fails"""
        return {
            'cpu_usage_percent': 0.0,
            'memory_usage_percent': 0.0,
            'energy_consumption_watts': 0.0,
            'health_score': 0.0,
            'status': 'unknown',
            'error': 'Metrics collection failed'
        }
    
    def get_metrics_history(self, service_id: str = None, limit: int = 100):
        """Get metrics history for a service or all services"""
        if service_id:
            return [m for m in self.metrics_history if m['service_id'] == service_id][-limit:]
        return self.metrics_history[-limit:]