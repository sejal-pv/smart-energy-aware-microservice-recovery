"""
Dashboard Server - Provides web interface for monitoring
"""
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import asyncio
import json
from typing import Dict, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class DashboardServer:
    def __init__(self, host="0.0.0.0", port=8080):
        self.host = host
        self.port = port
        self.app = FastAPI(title="Energy-Aware Recovery Dashboard")
        self.connected_clients = []
        self.stats = {}
        
        self.setup_routes()
    
    def setup_routes(self):
        """Setup API routes"""
        
        @self.app.get("/")
        async def dashboard():
            return HTMLResponse(self.get_dashboard_html())
        
        @self.app.get("/api/stats")
        async def get_stats():
            return self.stats
        
        @self.app.get("/api/health")
        async def health():
            return {"status": "healthy", "timestamp": datetime.now().isoformat()}
        
        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()
            self.connected_clients.append(websocket)
            
            try:
                while True:
                    # Keep connection alive
                    await asyncio.sleep(10)
                    await websocket.send_json({"type": "ping", "timestamp": datetime.now().isoformat()})
            except:
                pass
            finally:
                self.connected_clients.remove(websocket)
    
    def get_dashboard_html(self) -> str:
        """Get dashboard HTML"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Smart Energy-Aware Microservice Recovery</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .chart-container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
                .alert { background: #ffebee; color: #c62828; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .success { background: #e8f5e9; color: #2e7d32; }
                .warning { background: #fff3e0; color: #f57c00; }
                h1, h2, h3 { margin-top: 0; }
                .metric { font-size: 2em; font-weight: bold; }
                .metric-label { color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🌱 Smart Energy-Aware Microservice Recovery</h1>
                <p>Project: PES1PG24CA158 | Student: Sejal P Vernekar</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Energy Saved</h3>
                    <div class="metric" id="energy-saved">0.00 kWh</div>
                    <div class="metric-label" id="energy-percent">0% reduction</div>
                </div>
                <div class="stat-card">
                    <h3>Carbon Reduced</h3>
                    <div class="metric" id="carbon-reduced">0.00 kg</div>
                    <div class="metric-label">CO₂ emissions saved</div>
                </div>
                <div class="stat-card">
                    <h3>Recovery Success</h3>
                    <div class="metric" id="recovery-rate">0%</div>
                    <div class="metric-label">Successful healing actions</div>
                </div>
                <div class="stat-card">
                    <h3>Cost Savings</h3>
                    <div class="metric" id="cost-savings">$0.00</div>
                    <div class="metric-label">Monthly savings</div>
                </div>
            </div>
            
            <div class="chart-container">
                <h2>Energy Consumption Over Time</h2>
                <canvas id="energy-chart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <h2>Service Health Status</h2>
                <div id="health-chart"></div>
            </div>
            
            <div class="chart-container">
                <h2>Recent Healing Actions</h2>
                <div id="healing-actions">
                    <p>No healing actions yet...</p>
                </div>
            </div>
            
            <script>
                // WebSocket connection
                const ws = new WebSocket(`ws://${window.location.host}/ws`);
                
                // Charts
                const energyCtx = document.getElementById('energy-chart').getContext('2d');
                const energyChart = new Chart(energyCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Energy Consumption (Watts)',
                            data: [],
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: 'Real-time Energy Monitoring' }
                        }
                    }
                });
                
                // Health chart
                const healthChart = new ApexCharts(document.querySelector("#health-chart"), {
                    chart: { type: 'radialBar', height: 350 },
                    plotOptions: {
                        radialBar: {
                            dataLabels: {
                                name: { fontSize: '22px' },
                                value: { fontSize: '16px' },
                                total: {
                                    show: true,
                                    label: 'Overall Health',
                                    formatter: function (w) { return '85%' }
                                }
                            }
                        }
                    },
                    series: [85, 92, 78, 95],
                    labels: ['User Service', 'Payment Service', 'Auth Service', 'Database']
                });
                healthChart.render();
                
                // Update stats
                async function updateStats() {
                    try {
                        const response = await fetch('/api/stats');
                        const stats = await response.json();
                        
                        // Update metrics
                        document.getElementById('energy-saved').textContent = 
                            (stats.energy_saved_kwh || 0).toFixed(2) + ' kWh';
                        document.getElementById('energy-percent').textContent = 
                            (stats.energy_savings_percentage || 0) + '% reduction';
                        document.getElementById('carbon-reduced').textContent = 
                            (stats.carbon_reduced_kg || 0).toFixed(2) + ' kg';
                        document.getElementById('recovery-rate').textContent = 
                            (stats.recovery_success_rate || 0) + '%';
                        document.getElementById('cost-savings').textContent = 
                            '$' + (stats.cost_savings_usd || 0).toFixed(2);
                        
                    } catch (error) {
                        console.error('Failed to update stats:', error);
                    }
                }
                
                // Initial update
                updateStats();
                setInterval(updateStats, 5000);
            </script>
        </body>
        </html>
        """
    
    async def start(self):
        """Start the dashboard server"""
        logger.info(f"🚀 Starting Dashboard Server on {self.host}:{self.port}")
        
        config = uvicorn.Config(
            app=self.app,
            host=self.host,
            port=self.port,
            log_level="info"
        )
        
        self.server = uvicorn.Server(config)
        
        # Run server in background
        asyncio.create_task(self.server.serve())
        
        logger.info("✅ Dashboard Server started successfully")
    
    async def update_stats(self, stats: Dict):
        """Update dashboard statistics"""
        self.stats = stats
        
        # Broadcast to connected WebSocket clients
        message = {
            'type': 'stats_update',
            'timestamp': datetime.now().isoformat(),
            'data': stats
        }
        
        for client in self.connected_clients:
            try:
                await client.send_json(message)
            except:
                pass
    
    async def stop(self):
        """Stop the dashboard server"""
        if hasattr(self, 'server'):
            self.server.should_exit = True
            logger.info("🛑 Dashboard Server stopped")