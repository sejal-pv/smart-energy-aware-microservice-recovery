"""
Healing Controller - Executes energy-aware recovery actions
"""
import asyncio
import random
import json
from datetime import datetime
from typing import Dict, List
import logging
from enum import Enum

logger = logging.getLogger(__name__)

class HealingStrategy(Enum):
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    MIGRATE_GREEN = "migrate_green"
    RESTART = "restart"
    THROTTLE = "throttle"
    OPTIMIZE = "optimize"
    DO_NOTHING = "do_nothing"

class HealingController:
    def __init__(self):
        self.strategies = [s.value for s in HealingStrategy]
        self.healing_history = []
        self.energy_savings_total = 0.0
        
        # Energy impact of each strategy (kWh saved)
        self.energy_impact = {
            'scale_up': -0.3,      # Uses more energy
            'scale_down': 0.25,    # Saves energy
            'migrate_green': 0.4,  # Significant savings
            'restart': 0.1,        # Small saving
            'throttle': 0.35,      # Good saving
            'optimize': 0.2,       # Moderate saving
            'do_nothing': 0.0      # No change
        }
    
    async def initialize(self):
        """Initialize healing controller"""
        logger.info("⚙️ Initializing Healing Controller...")
        logger.info(f"Available strategies: {', '.join(self.strategies)}")
        return True
    
    async def execute_healing(self, service_id: str, prediction: Dict) -> Dict:
        """Execute healing action for a service"""
        logger.info(f"🚀 Executing healing for service: {service_id}")
        
        # Determine optimal strategy based on prediction cluster
        strategy = self.determine_strategy(prediction)
        
        # Calculate expected energy savings
        expected_saving = self.energy_impact.get(strategy, 0.0)
        
        try:
            # Simulate healing action execution
            success, execution_time = await self.simulate_healing_action(strategy)
            
            if success:
                # Calculate actual savings (with some randomness)
                actual_saving = expected_saving * random.uniform(0.8, 1.2)
                self.energy_savings_total += max(actual_saving, 0)
                
                # Log the action
                healing_record = {
                    'timestamp': datetime.now().isoformat(),
                    'service_id': service_id,
                    'strategy': strategy,
                    'prediction_cluster': prediction.get('cluster', 0),
                    'prediction_probability': prediction.get('probability', 0),
                    'expected_energy_saving': expected_saving,
                    'actual_energy_saving': actual_saving,
                    'execution_time_seconds': execution_time,
                    'status': 'success',
                    'carbon_reduction_kg': actual_saving * 0.233  # kg CO2 per kWh
                }
                
                self.healing_history.append(healing_record)
                
                logger.info(
                    f"✅ Healing successful for {service_id}: {strategy} "
                    f"(Saved {actual_saving:.2f} kWh, "
                    f"Reduced {healing_record['carbon_reduction_kg']:.2f} kg CO2)"
                )
                
                return {
                    'success': True,
                    'strategy': strategy,
                    'energy_saved': actual_saving,
                    'execution_time': execution_time,
                    'carbon_reduced': healing_record['carbon_reduction_kg'],
                    'message': f"Healing action '{strategy}' executed successfully"
                }
            
        except Exception as e:
            logger.error(f"❌ Healing failed for {service_id}: {e}")
        
        # Fallback: Do nothing
        return {
            'success': False,
            'strategy': 'do_nothing',
            'energy_saved': 0.0,
            'error': 'Healing action failed'
        }
    
    def determine_strategy(self, prediction: Dict) -> str:
        """Determine the best healing strategy based on prediction"""
        cluster = prediction.get('cluster', 0)
        
        # Map clusters to strategies
        cluster_strategy_map = {
            1: HealingStrategy.SCALE_UP,      # Resource exhaustion
            2: HealingStrategy.MIGRATE_GREEN, # Energy spike
            3: HealingStrategy.OPTIMIZE,      # Network issues
            4: HealingStrategy.RESTART,       # High error rate
            5: HealingStrategy.THROTTLE       # General degradation
        }
        
        strategy = cluster_strategy_map.get(cluster, HealingStrategy.DO_NOTHING)
        
        # For energy spikes (cluster 2), prioritize green migration
        if cluster == 2:
            return HealingStrategy.MIGRATE_GREEN.value
        
        return strategy.value
    
    async def simulate_healing_action(self, strategy: str):
        """Simulate healing action execution"""
        # Simulate different execution times
        execution_times = {
            'scale_up': 2.5,
            'scale_down': 1.5,
            'migrate_green': 5.0,
            'restart': 3.0,
            'throttle': 1.0,
            'optimize': 4.0,
            'do_nothing': 0.1
        }
        
        execution_time = execution_times.get(strategy, 2.0)
        
        # Simulate execution with 90% success rate
        await asyncio.sleep(execution_time)
        success = random.random() > 0.1  # 90% success rate
        
        return success, execution_time
    
    def get_healing_history(self, service_id: str = None, limit: int = 50):
        """Get healing history"""
        if service_id:
            history = [h for h in self.healing_history if h['service_id'] == service_id]
        else:
            history = self.healing_history
        
        return history[-limit:]
    
    def get_statistics(self) -> Dict:
        """Get healing controller statistics"""
        if not self.healing_history:
            return {}
        
        successful_actions = [h for h in self.healing_history if h['status'] == 'success']
        
        return {
            'total_actions': len(self.healing_history),
            'successful_actions': len(successful_actions),
            'success_rate': len(successful_actions) / max(1, len(self.healing_history)),
            'total_energy_saved_kwh': self.energy_savings_total,
            'total_carbon_reduced_kg': self.energy_savings_total * 0.233,
            'average_execution_time': sum(h['execution_time_seconds'] 
                                         for h in self.healing_history) / len(self.healing_history),
            'most_used_strategy': self.get_most_used_strategy()
        }
    
    def get_most_used_strategy(self) -> str:
        """Get the most frequently used strategy"""
        if not self.healing_history:
            return 'none'
        
        strategies = [h['strategy'] for h in self.healing_history]
        return max(set(strategies), key=strategies.count)