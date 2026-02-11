import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./index.css";
import Chart from 'chart.js/auto';

const API_BASE = "http://localhost:8080";

/* ================= SIDEBAR COMPONENT ================= */
const Sidebar = ({ matrixMode, setMatrixMode, systemHealth, isConnected }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: "📊", label: "Dashboard", name: "dashboard" },
    { path: "/services", icon: "📦", label: "Services", name: "services" },
    { path: "/monitoring", icon: "📈", label: "Monitoring", name: "monitoring" },
    { path: "/ai-insights", icon: "🤖", label: "AI Insights", name: "ai-insights" },
    { path: "/healing", icon: "⚡", label: "Healing", name: "healing" },
    { path: "/alerts", icon: "⚠️", label: "Alerts", name: "alerts", badge: 3 },
    { path: "/settings", icon: "⚙️", label: "Settings", name: "settings" },
  ];

  return (
    <aside className={`sidebar ${matrixMode ? 'matrix' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className={`logo-icon ${matrixMode ? 'matrix' : ''}`}>
            {matrixMode ? '⟁' : '⚡'}
          </div>
          <h1 className={`logo-text ${matrixMode ? 'matrix' : ''}`}>
            <span className="logo-primary">EnergyAware</span>
            <span className="logo-secondary">microservices-Recovery</span>
          </h1>
        </div>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''} ${matrixMode ? 'matrix' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </Link>
        ))}
      </div>

      
        <div className="health-display">
          <div className="health-label">System Health</div>
          <div className="health-value">{systemHealth}%</div>
        </div>
        
        
     
    </aside>
  );
};

/* ================= DASHBOARD PAGE ================= */
const DashboardPage = ({ 
  prediction, 
  matrixMode, 
  systemHealth, 
  cpuSeries = [], 
  memSeries = [], 
  networkSeries = [],
  realTimePods = [],
  realTimeLogs = [],
  energyScore = 0,
  onShowSpeedometer,
  onTriggerHealing,
  onQuickAction
}) => {
  const [quickActions] = useState([
    { id: 1, name: "Run Health Check", icon: "🔍", color: "#00D4FF" },
    { id: 2, name: "Optimize Resources", icon: "⚡", color: "#10B981" },
    { id: 3, name: "Backup Systems", icon: "💾", color: "#8B5CF6" },
    { id: 4, name: "Run Diagnostics", icon: "📊", color: "#F59E0B" },
  ]);
  
  const [activeActions, setActiveActions] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [liveMetrics, setLiveMetrics] = useState({
    activeAlerts: 0,
    averageResponseTime: 42,
    errorRate: 0.5,
    throughput: 1250,
  });
  const [notification, setNotification] = useState(null);

  // Simulate live data updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update live metrics
      setLiveMetrics(prev => ({
        activeAlerts: Math.max(0, prev.activeAlerts + (Math.random() > 0.7 ? 1 : -1)),
        averageResponseTime: Math.max(20, prev.averageResponseTime + (Math.random() - 0.5) * 10),
        errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.2),
        throughput: Math.max(800, prev.throughput + (Math.random() - 0.5) * 100),
      }));

      // Random notifications
      if (Math.random() > 0.8) {
        const services = ['auth-service', 'payment-service', 'database-service', 'cache-service'];
        const randomService = services[Math.floor(Math.random() * services.length)];
        setNotification({
          id: Date.now(),
          message: `${randomService} performance optimized`,
          type: 'success',
          timestamp: new Date().toISOString(),
        });
        
        setTimeout(() => setNotification(null), 5000);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleQuickActionClick = async (actionId) => {
    setActiveActions(prev => ({ ...prev, [actionId]: 'loading' }));
    try {
      await onQuickAction(actionId);
      setActiveActions(prev => ({ ...prev, [actionId]: 'success' }));
      setTimeout(() => {
        setActiveActions(prev => ({ ...prev, [actionId]: null }));
      }, 3000);
    } catch (error) {
      setActiveActions(prev => ({ ...prev, [actionId]: 'error' }));
      setTimeout(() => {
        setActiveActions(prev => ({ ...prev, [actionId]: null }));
      }, 3000);
    }
  };
  
  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
    if (!autoRefresh) {
      setNotification({
        id: Date.now(),
        message: 'Live monitoring activated',
        type: 'info',
      });
    }
  };

  const healthyServices = realTimePods.filter(p => p.status === 'Running').length;
  const warningServices = realTimePods.filter(p => p.status === 'Warning').length;
  const errorServices = realTimePods.filter(p => p.status === 'Error').length;
  
  const handleCardClick = () => {
    console.log("🎯 Dashboard AI Prediction card clicked!");
    if (onShowSpeedometer) {
      onShowSpeedometer();
    }
  };
  
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onShowSpeedometer) {
      handleCardClick();
    }
  };

  return (
    <div className="dashboard-page">
      {/* Live Notification */}
      {notification && (
        <div className={`live-notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : 
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Dashboard Header with Live Controls */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>
            <span className="title-icon">📊</span>
            System Dashboard
            <span className={`live-indicator ${autoRefresh ? 'active' : ''}`}>
              {autoRefresh ? '● LIVE' : '○ PAUSED'}
            </span>
          </h1>
          <p className="header-subtitle">
            Real-time monitoring of microservices health and performance
          </p>
        </div>
        <div className="header-controls">
          <div className="refresh-controls">
            <button 
              className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
              onClick={handleAutoRefreshToggle}
              style={{
                background: matrixMode ? (autoRefresh ? '#00ff41' : '#333') : (autoRefresh ? '#00D4FF' : '#334155'),
                color: matrixMode ? '#000' : '#fff'
              }}
            >
              {autoRefresh ? '⏸️ Pause' : '▶️ Resume'}
            </button>
          </div>
          <div className="last-updated">
            <span style={{ color: matrixMode ? '#00cc33' : '#64748b' }}>
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Live Metrics Ticker */}
      <div className={`live-metrics-ticker ${matrixMode ? 'matrix' : ''}`}>
        <div className="ticker-header">
          <span className="ticker-title" style={{ color: matrixMode ? '#00ff41' : '#00D4FF' }}>
            📈 Live Metrics
          </span>
          <div className="ticker-stats">
            <div className="ticker-stat">
              <span className="stat-name">Active Alerts:</span>
              <span className="stat-value">{liveMetrics.activeAlerts}</span>
            </div>
            <div className="ticker-stat">
              <span className="stat-name">Avg Response:</span>
              <span className="stat-value">{liveMetrics.averageResponseTime.toFixed(0)}ms</span>
            </div>
            <div className="ticker-stat">
              <span className="stat-name">Error Rate:</span>
              <span className="stat-value">{liveMetrics.errorRate.toFixed(1)}%</span>
            </div>
            <div className="ticker-stat">
              <span className="stat-name">Throughput:</span>
              <span className="stat-value">{liveMetrics.throughput.toLocaleString()}/s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className={`stat-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{realTimePods.length}</div>
            <div className="stat-label">Total Services</div>
          </div>
        </div>
        
        <div className={`stat-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{energyScore}</div>
            <div className="stat-label">Energy Score</div>
          </div>
        </div>
        
        <div className={`stat-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">{realTimeLogs.filter(l => l.status === 'HEALING' || l.status === 'RECOVERED').length}</div>
            <div className="stat-label">Recoveries</div>
          </div>
        </div>
        
        <div className={`stat-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-column">
          <div 
            className={`prediction-card ${matrixMode ? 'matrix' : ''} clickable`}
            onClick={handleCardClick}
            onKeyDown={handleKeyDown}
            style={{ 
              borderColor: matrixMode ? '#00ff41' : (prediction ? 
                (prediction.prediction?.includes('High') ? '#FF3D71' : 
                 prediction.prediction?.includes('Medium') ? '#FFB800' : '#00D4AA') : '#00D4FF'),
              cursor: 'pointer'
            }}
            role="button"
            tabIndex={0}
          >
            <div className="prediction-header">
              <div className="prediction-title">
                <span className="prediction-icon">🤖</span>
                <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>AI Prediction Engine</h3>
              </div>
              <div className="prediction-status">
                {prediction?.prediction || "Low Risk"}
              </div>
            </div>
            <p className="prediction-message">
              {prediction?.action || "System is stable, continue monitoring."}
            </p>
            <div className="prediction-footer">
              <span className="confidence">Confidence: {prediction?.confidence || 85}%</span>
              <span className="click-hint">Click for details →</span>
            </div>
          </div>

          <div className={`health-overview-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Services Health</h3>
            <div className="health-bars">
              <div className="health-bar-item">
                <span className="bar-label">Healthy</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill healthy" 
                    style={{ width: `${(healthyServices / Math.max(realTimePods.length, 1)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{healthyServices}</span>
              </div>
              <div className="health-bar-item">
                <span className="bar-label">Warning</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill warning" 
                    style={{ width: `${(warningServices / Math.max(realTimePods.length, 1)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{warningServices}</span>
              </div>
              <div className="health-bar-item">
                <span className="bar-label">Error</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill error" 
                    style={{ width: `${(errorServices / Math.max(realTimePods.length, 1)) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{errorServices}</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className={`activities-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="activities-header">
              <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Recent Activities</h3>
              <Link to="/alerts" className="view-all-link">View All →</Link>
            </div>
            <div className="activities-list">
              {realTimeLogs.slice(0, 5).map(log => (
                <div key={log.id} className="activity-item">
                  <div className="activity-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="activity-content">
                    <div className="activity-service">{log.serviceName}</div>
                    <div className="activity-message">{log.actionTaken}</div>
                  </div>
                  <div 
                    className={`activity-status ${log.status?.toLowerCase()}`}
                    style={{ 
                      backgroundColor: 
                        log.status === 'HEALING' ? '#0088FF' :
                        log.status === 'SUCCESS' ? '#00D4AA' :
                        log.status === 'RECOVERED' ? '#00FF88' : '#FFB800'
                    }}
                  >
                    {log.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className={`resource-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Resource Utilization</h3>
            <div className="resource-metrics">
              <div className="resource-metric">
                <div className="metric-header">
                  <span className="metric-name">CPU Usage</span>
                  <span className="metric-value">{cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill cpu"
                    style={{ width: `${cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="resource-metric">
                <div className="metric-header">
                  <span className="metric-name">Memory Usage</span>
                  <span className="metric-value">{memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0}MB</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill memory"
                    style={{ width: `${(memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0) / 20}%` }}
                  />
                </div>
              </div>
              
              <div className="resource-metric">
                <div className="metric-header">
                  <span className="metric-name">Network I/O</span>
                  <span className="metric-value">{networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0}MB/s</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill network"
                    style={{ width: `${(networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0) * 3}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Mini Chart for Resource Trends */}
            <div className="resource-trend">
              <div className="trend-header">
                <span style={{ color: matrixMode ? '#00cc33' : '#94a3b8' }}>24h Trend</span>
                <div className="trend-indicator">
                  <span style={{ color: matrixMode ? '#00ff41' : '#00D4AA' }}>↑ 12%</span>
                </div>
              </div>
              <div className="trend-chart">
                {[40, 55, 65, 45, 60, 70, 65].map((value, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{
                      height: `${value}%`,
                      background: matrixMode ? '#00ff41' : '#00D4FF'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights Card */}
          <div className={`insights-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="insights-header">
              <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Performance Insights</h3>
              <span className="insights-badge">AI Analysis</span>
            </div>
            <div className="insights-list">
              <div className="insight-item positive">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <div className="insight-title">Database optimized</div>
                  <div className="insight-desc">Query response time improved by 25%</div>
                </div>
              </div>
              <div className="insight-item warning">
                <div className="insight-icon">⚠️</div>
                <div className="insight-content">
                  <div className="insight-title">Cache saturation</div>
                  <div className="insight-desc">Redis cache at 92% capacity</div>
                </div>
              </div>
              <div className="insight-item positive">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <div className="insight-title">Energy efficient</div>
                  <div className="insight-desc">Services running in optimal power mode</div>
                </div>
              </div>
              <div className="insight-item info">
                <div className="insight-icon">🔄</div>
                <div className="insight-content">
                  <div className="insight-title">Auto-healing active</div>
                  <div className="insight-desc">3 services recovered in last hour</div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health moved to middle column */}
          <div className={`health-gauge-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>System Health</h3>
            <div className="gauge-container">
              <div className="gauge">
                <div 
                  className="gauge-fill"
                  style={{ 
                    height: `${systemHealth}%`,
                    backgroundColor: 
                      systemHealth >= 80 ? '#00D4AA' :
                      systemHealth >= 60 ? '#FFB800' : '#FF3D71'
                  }}
                />
              </div>
              <div className="gauge-info">
                <div className="gauge-value">{systemHealth}%</div>
                <div className="gauge-label">
                  {systemHealth >= 80 ? 'Excellent' : 
                   systemHealth >= 60 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className={`status-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>System Status</h3>
            <div className="status-items">
              <div className="status-item">
                <span className="status-name">Backend API</span>
                <span className="status-dot connected"></span>
              </div>
              <div className="status-item">
                <span className="status-name">Database</span>
                <span className="status-dot connected"></span>
              </div>
              <div className="status-item">
                <span className="status-name">Cache</span>
                <span className="status-dot connected"></span>
              </div>
              <div className="status-item">
                <span className="status-name">Message Queue</span>
                <span className="status-dot warning"></span>
              </div>
              <div className="status-item">
                <span className="status-name">File Storage</span>
                <span className="status-dot connected"></span>
              </div>
            </div>
          </div>

          <div className={`top-services-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Top Services by CPU</h3>
            <div className="services-list">
              {[...realTimePods]
                .sort((a, b) => b.cpu - a.cpu)
                .slice(0, 4)
                .map(pod => (
                  <div key={pod.id} className="service-item">
                    <div className="service-info">
                      <span className="service-icon">📦</span>
                      <div className="service-details">
                        <div className="service-name">{pod.name}</div>
                        <div className="service-node">{pod.node}</div>
                      </div>
                    </div>
                    <div className="service-metrics">
                      <div className="cpu-indicator">
                        <div 
                          className="cpu-bar"
                          style={{ width: `${pod.cpu}%` }}
                        />
                        <span className="cpu-value">{pod.cpu}%</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className={`quick-stats-card ${matrixMode ? 'matrix' : ''}`}>
            <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Quick Stats</h3>
            <div className="stats-grid-mini">
              <div className="mini-stat">
                <div className="mini-icon">🔒</div>
                <div className="mini-content">
                  <div className="mini-value">98%</div>
                  <div className="mini-label">Security</div>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-icon">⚡</div>
                <div className="mini-content">
                  <div className="mini-value">2.4s</div>
                  <div className="mini-label">Avg Response</div>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-icon">💰</div>
                <div className="mini-content">
                  <div className="mini-value">$142</div>
                  <div className="mini-label">Cost Saved</div>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-icon">🌿</div>
                <div className="mini-content">
                  <div className="mini-value">87%</div>
                  <div className="mini-label">Eco Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
};

/* ================= SERVICES PAGE ================= */
const ServicesPage = ({ 
  realTimePods = [], 
  matrixMode, 
  onTriggerHealing,
  searchQuery,
  setSearchQuery,
  activeServiceTab,
  setActiveServiceTab
}) => {
  const filteredPods = useMemo(() => {
    return realTimePods.filter(pod => {
      const matchesSearch = searchQuery === '' || 
        pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pod.node.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeServiceTab === 'healthy') return matchesSearch && pod.status === 'Running';
      if (activeServiceTab === 'issues') return matchesSearch && pod.status !== 'Running';
      return matchesSearch;
    });
  }, [realTimePods, activeServiceTab, searchQuery]);

  const stats = {
    total: realTimePods.length,
    running: realTimePods.filter(p => p.status === 'Running').length,
    warning: realTimePods.filter(p => p.status === 'Warning').length,
    error: realTimePods.filter(p => p.status === 'Error').length,
  };

  return (
    <div className="services-page">
      <div className="page-header">
        <div className="header-left">
          <h2>Services Management</h2>
          <p>Monitor and manage all your microservices</p>
        </div>
      </div>

      <div className="service-stats">
        <div className="stat-item">
          <div className="stat-icon total">📦</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Services</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon running">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.running}</div>
            <div className="stat-label">Running</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.warning}</div>
            <div className="stat-label">Warning</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon error">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.error}</div>
            <div className="stat-label">Error</div>
          </div>
        </div>
      </div>

      <div className={`service-controls ${matrixMode ? 'matrix' : ''}`}>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`tab ${activeServiceTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveServiceTab('all')}
          >
            All ({stats.total})
          </button>
          <button 
            className={`tab ${activeServiceTab === 'healthy' ? 'active' : ''}`}
            onClick={() => setActiveServiceTab('healthy')}
          >
            Healthy ({stats.running})
          </button>
          <button 
            className={`tab ${activeServiceTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveServiceTab('issues')}
          >
            Issues ({stats.warning + stats.error})
          </button>
        </div>

        
      </div>

      <div className={`services-table ${matrixMode ? 'matrix' : ''}`}>
        <div className="table-header">
          <div className="col name">Service Name</div>
          <div className="col status">Status</div>
          <div className="col node">Node</div>
          <div className="col cpu">CPU</div>
          <div className="col memory">Memory</div>
          <div className="col restarts">Restarts</div>
        </div>
        
        <div className="table-body">
          {filteredPods.map(pod => (
            <div key={pod.id} className={`table-row ${pod.status?.toLowerCase()}`}>
              <div className="col name">
                <span className="service-icon">📦</span>
                <span className="service-name">{pod.name}</span>
              </div>
              
              <div className="col status">
                <span 
                  className={`status-badge ${pod.status?.toLowerCase()}`}
                  style={{ 
                    backgroundColor: 
                      pod.status === 'Running' ? '#00D4AA20' :
                      pod.status === 'Warning' ? '#FFB80020' : '#FF3D7120',
                    color: 
                      pod.status === 'Running' ? '#00D4AA' :
                      pod.status === 'Warning' ? '#FFB800' : '#FF3D71'
                  }}
                >
                  {pod.status}
                </span>
              </div>
              
              <div className="col node">{pod.node}</div>
              
              <div className="col cpu">
                <div className="metric-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${pod.cpu}%`,
                      backgroundColor: pod.cpu > 80 ? '#FF3D71' : pod.cpu > 60 ? '#FFB800' : '#00D4AA'
                    }}
                  />
                  <span className="metric-value">{pod.cpu}%</span>
                </div>
              </div>
              
              <div className="col memory">
                <div className="metric-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(pod.memory / 2048) * 100}%`,
                      backgroundColor: pod.memory > 1500 ? '#FF3D71' : pod.memory > 1000 ? '#FFB800' : '#00D4AA'
                    }}
                  />
                  <span className="metric-value">{pod.memory}MB</span>
                </div>
              </div>
              
              <div className="col restarts">
                {pod.restartCount > 0 ? (
                  <span className="restart-badge">
                    🔄 {pod.restartCount}
                  </span>
                ) : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`service-details-panel ${matrixMode ? 'matrix' : ''}`}>
        <h3>Service Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Total Services</span>
            <span className="detail-value">{stats.total}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Avg CPU Usage</span>
            <span className="detail-value">
              {realTimePods.length > 0 ? 
                Math.round(realTimePods.reduce((sum, p) => sum + p.cpu, 0) / realTimePods.length) : 0}%
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Avg Memory Usage</span>
            <span className="detail-value">
              {realTimePods.length > 0 ? 
                Math.round(realTimePods.reduce((sum, p) => sum + p.memory, 0) / realTimePods.length) : 0}MB
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Restarts</span>
            <span className="detail-value">
              {realTimePods.reduce((sum, p) => sum + p.restartCount, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= MONITORING PAGE ================= */
const MonitoringPage = ({ 
  cpuSeries = [], 
  memSeries = [], 
  networkSeries = [], 
  chartOptions,
  matrixMode,
  timestamps = []
}) => {
  const SimpleLineChart = ({ data, options, height = "200px", title, color }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
      });

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
        }
      };
    }, [data, options]);

    return (
      <div style={{ height, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </div>
    );
  };

  const chartLabels = useMemo(() => 
    timestamps.map(ts => 
      ts.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    ), [timestamps]);

  const cpuChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: 'CPU Usage',
      data: cpuSeries,
      borderColor: matrixMode ? '#00ff41' : '#00D4FF',
      backgroundColor: matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(0, 212, 255, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  }), [cpuSeries, matrixMode, chartLabels]);

  const memChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: 'Memory Usage',
      data: memSeries,
      borderColor: matrixMode ? '#00ff41' : '#00FF9D',
      backgroundColor: matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(0, 255, 157, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  }), [memSeries, matrixMode, chartLabels]);

  const networkChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: 'Network Throughput',
      data: networkSeries,
      borderColor: matrixMode ? '#00ff41' : '#FF6B9D',
      backgroundColor: matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 107, 157, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  }), [networkSeries, matrixMode, chartLabels]);

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <div className="header-left">
          <h2>Performance Monitoring</h2>
          <p>Real-time metrics and performance analytics</p>
        </div>
      </div>

      <div className="current-metrics">
        <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="metric-header">
            <div className="metric-title">
              <span className="metric-icon">🖥️</span>
              <h3>CPU Utilization</h3>
            </div>
            <div className="metric-value">{cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0}%</div>
          </div>
          <div className="metric-trend">
            <span className={`trend ${(cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0) > 70 ? 'up' : 'down'}`}>
              {(cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0) > 70 ? '↑ High' : '↓ Normal'}
            </span>
          </div>
        </div>
        
        <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="metric-header">
            <div className="metric-title">
              <span className="metric-icon">🧠</span>
              <h3>Memory Usage</h3>
            </div>
            <div className="metric-value">{memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0}MB</div>
          </div>
          <div className="metric-trend">
            <span className={`trend ${(memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0) > 1200 ? 'up' : 'down'}`}>
              {(memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0) > 1200 ? '↑ High' : '↓ Normal'}
            </span>
          </div>
        </div>
        
        <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
          <div className="metric-header">
            <div className="metric-title">
              <span className="metric-icon">🌐</span>
              <h3>Network I/O</h3>
            </div>
            <div className="metric-value">{networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0}MB/s</div>
          </div>
          <div className="metric-trend">
            <span className={`trend ${(networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0) > 15 ? 'up' : 'down'}`}>
              {(networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0) > 15 ? '↑ High' : '↓ Normal'}
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className={`chart-container ${matrixMode ? 'matrix' : ''}`}>
          <div className="chart-header">
            <h3>CPU Usage Over Time</h3>
            <span className="chart-stat">{cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0}%</span>
          </div>
          <SimpleLineChart 
            data={cpuChartData} 
            options={chartOptions}
            height="250px"
          />
        </div>
        
        <div className={`chart-container ${matrixMode ? 'matrix' : ''}`}>
          <div className="chart-header">
            <h3>Memory Usage Over Time</h3>
            <span className="chart-stat">{memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0}MB</span>
          </div>
          <SimpleLineChart 
            data={memChartData} 
            options={chartOptions}
            height="250px"
          />
        </div>
        
        <div className={`chart-container ${matrixMode ? 'matrix' : ''}`}>
          <div className="chart-header">
            <h3>Network Throughput Over Time</h3>
            <span className="chart-stat">{networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0}MB/s</span>
          </div>
          <SimpleLineChart 
            data={networkChartData} 
            options={chartOptions}
            height="250px"
          />
        </div>
      </div>

      <div className="additional-metrics">
        <div className={`metrics-panel ${matrixMode ? 'matrix' : ''}`}>
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-label">Response Time</div>
              <div className="metric-value">23ms</div>
              <div className="metric-change positive">↓ 2ms</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Error Rate</div>
              <div className="metric-value">0.2%</div>
              <div className="metric-change negative">↑ 0.1%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Request Rate</div>
              <div className="metric-value">1.2k/sec</div>
              <div className="metric-change positive">↑ 200</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Cache Hit Ratio</div>
              <div className="metric-value">94%</div>
              <div className="metric-change positive">↑ 3%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= AI INSIGHTS PAGE ================= */
const AIInsightsPage = ({ 
  prediction, 
  matrixMode, 
  onShowSpeedometer,
  cpuSeries = [],
  memSeries = [],
  networkSeries = [],
  energyScore = 0
}) => {
  const insights = [
    {
      id: 1,
      title: "CPU Optimization Opportunity",
      description: "High CPU usage detected in payment services. Consider horizontal scaling.",
      severity: "high",
      icon: "🖥️",
      action: "Scale Services",
      timestamp: "Just now"
    },
    {
      id: 2,
      title: "Memory Leak Detection",
      description: "Memory usage trending upward. Potential memory leak in cache service.",
      severity: "medium",
      icon: "🧠",
      action: "Investigate",
      timestamp: "Just now"
    },
    {
      id: 3,
      title: "Network Latency Alert",
      description: "Increased network latency between services. Check load balancer configuration.",
      severity: "medium",
      icon: "🌐",
      action: "Optimize",
      timestamp: "Just now"
    },
    {
      id: 4,
      title: "Energy Efficiency High",
      description: "System operating at optimal energy efficiency levels.",
      severity: "low",
      icon: "⚡",
      action: "Maintain",
      timestamp: "Just now"
    },
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      high: { bg: '#FF3D7120', text: '#FF3D71' },
      medium: { bg: '#FFB80020', text: '#FFB800' },
      low: { bg: '#00D4AA20', text: '#00D4AA' }
    };
    return colors[severity] || colors.low;
  };

  const getTrendStatus = (value, type) => {
    switch(type) {
      case 'cpu':
        return value > 70 ? 'High' : 'Normal';
      case 'memory':
        return value > 1200 ? 'High' : 'Normal';
      case 'network':
        return value > 15 ? 'High' : 'Normal';
      case 'energy':
        if (value > 80) return 'Excellent';
        if (value > 60) return 'Good';
        return 'Poor';
      default:
        return 'Normal';
    }
  };

  const handleCardClick = () => {
    console.log("🎯 AI Insights main card clicked!");
    if (onShowSpeedometer) {
      onShowSpeedometer();
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    console.log("🎯 View Details button clicked!");
    if (onShowSpeedometer) {
      onShowSpeedometer();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onShowSpeedometer) {
      handleCardClick();
    }
  };

  return (
    <div className="ai-insights-page">
      <div className="page-header">
        <div className="header-left">
          <h2>AI Insights & Predictions</h2>
          <p>Intelligent analysis and predictive recommendations</p>
        </div>
      </div>

      {/* AI Prediction Card */}
      <div 
        className={`ai-prediction-main ${matrixMode ? 'matrix' : ''} clickable`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
      >
        <div className="prediction-header">
          <div className="prediction-title">
            <span className="prediction-icon">🚀</span>
            <h3>AI Predictive Analysis</h3>
          </div>
          <div 
            className="prediction-status"
            style={{ 
              backgroundColor: 
                prediction?.prediction?.includes('High') ? '#FF3D71' :
                prediction?.prediction?.includes('Medium') ? '#FFB800' : '#00D4AA'
            }}
          >
            {prediction?.prediction || "Low Risk"}
          </div>
        </div>
        <div className="prediction-content">
          <div className="prediction-message">
            <p>{prediction?.action || "System is stable, continue monitoring."}</p>
          </div>
          <div className="prediction-metrics">
            <div className="metric">
              <div className="metric-label">Confidence</div>
              <div className="metric-value">{prediction?.confidence || 85}%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Accuracy</div>
              <div className="metric-value">94.2%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Response Time</div>
              <div className="metric-value">23ms</div>
            </div>
          </div>
        </div>
        <div className="prediction-footer">
          <button 
            className="view-details-btn"
            onClick={handleButtonClick}
          >
            View Detailed Analysis →
          </button>
        </div>
      </div>

      <div className="insights-grid">
        {insights.map(insight => {
          const severityColors = getSeverityColor(insight.severity);
          return (
            <div 
              key={insight.id} 
              className={`insight-card ${matrixMode ? 'matrix' : ''} ${insight.severity}`}
            >
              <div className="insight-header">
                <div className="insight-icon" role="img" aria-label={insight.title}>
                  {insight.icon}
                </div>
                <div 
                  className="insight-severity"
                  style={{ 
                    backgroundColor: severityColors.bg,
                    color: severityColors.text
                  }}
                >
                  {insight.severity.toUpperCase()}
                </div>
              </div>
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-description">{insight.description}</p>
              <div className="insight-footer">
                <button className="insight-action-btn">
                  {insight.action} →
                </button>
                <span className="insight-timestamp">{insight.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="current-metrics-section">
        <h3>Current System Metrics</h3>
        <div className="metrics-cards">
          <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="metric-icon" role="img" aria-label="CPU Usage">🖥️</div>
            <div className="metric-content">
              <div className="metric-value">{cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0}%</div>
              <div className="metric-label">CPU Usage</div>
              <div className="metric-trend">
                {getTrendStatus(cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0, 'cpu')}
              </div>
            </div>
          </div>
          
          <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="metric-icon" role="img" aria-label="Memory Usage">🧠</div>
            <div className="metric-content">
              <div className="metric-value">{memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0}MB</div>
              <div className="metric-label">Memory Usage</div>
              <div className="metric-trend">
                {getTrendStatus(memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0, 'memory')}
              </div>
            </div>
          </div>
          
          <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="metric-icon" role="img" aria-label="Network I/O">🌐</div>
            <div className="metric-content">
              <div className="metric-value">{networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0}MB/s</div>
              <div className="metric-label">Network I/O</div>
              <div className="metric-trend">
                {getTrendStatus(networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0, 'network')}
              </div>
            </div>
          </div>
          
          <div className={`metric-card ${matrixMode ? 'matrix' : ''}`}>
            <div className="metric-icon" role="img" aria-label="Energy Score">⚡</div>
            <div className="metric-content">
              <div className="metric-value">{energyScore}</div>
              <div className="metric-label">Energy Score</div>
              <div className="metric-trend">
                {getTrendStatus(energyScore, 'energy')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`recommendations-section ${matrixMode ? 'matrix' : ''}`}>
        <h3>AI Recommendations</h3>
        <div className="recommendations-list">
          <div className="recommendation">
            <div className="recommendation-icon" aria-hidden="true">✓</div>
            <div className="recommendation-content">
              <h4>Scale payment-service to 3 replicas</h4>
              <p>Based on current CPU usage patterns</p>
            </div>
          </div>
          <div className="recommendation">
            <div className="recommendation-icon" aria-hidden="true">✓</div>
            <div className="recommendation-content">
              <h4>Optimize database connection pool</h4>
              <p>Reduce connection overhead by 30%</p>
            </div>
          </div>
          <div className="recommendation">
            <div className="recommendation-icon" aria-hidden="true">✓</div>
            <div className="recommendation-content">
              <h4>Implement caching for auth-service</h4>
              <p>Expected to reduce response time by 40%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HEALING PAGE ================= */
const HealingPage = ({ 
  matrixMode, 
  healingInProgress, 
  onTriggerHealingAction,
  realTimeLogs = [] 
}) => {
  const healingActions = [
    { id: 1, name: "Restart Pods", description: "Restart pods with high error rates", icon: "🔄", color: "#FF6B9D" },
    { id: 2, name: "Scale Resources", description: "Increase CPU/Memory for services", icon: "📈", color: "#00D4FF" },
    { id: 3, name: "Load Balancing", description: "Redistribute traffic to nodes", icon: "⚖️", color: "#FFB800" },
    { id: 4, name: "DB Optimization", description: "Clean database connections", icon: "🗄️", color: "#00D4AA" },
    { id: 5, name: "Cache Refresh", description: "Clear and rebuild cache", icon: "🧹", color: "#00FF9D" },
    { id: 6, name: "Network Reset", description: "Reset network connections", icon: "🌐", color: "#8B5CF6" }
  ];

  const recentHealingLogs = realTimeLogs.filter(log => 
    log.status === 'HEALING' || log.status === 'RECOVERED'
  );
  

  return (
    <div className="healing-page">
      <div className="page-header">
        <div className="header-left">
          <h2>Auto-Healing System</h2>
          <p>Automated recovery and maintenance protocols</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <div className="stat-value">{recentHealingLogs.length}</div>
            <div className="stat-label">Recent Actions</div>
          </div>
          <div className="stat">
            <div className="stat-value">{healingInProgress ? 'Active' : 'Idle'}</div>
            <div className="stat-label">System Status</div>
          </div>
        </div>
      </div>

      <div className="healing-actions-section">
        <h3>Healing Actions</h3>
        <div className="actions-grid">
          {healingActions.map(action => (
            <div 
              key={action.id} 
              className={`action-card ${matrixMode ? 'matrix' : ''}`}
              style={{ borderLeft: `4px solid ${matrixMode ? '#00ff41' : action.color}` }}
            >
              <div className="action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <div className="action-content">
                <h4>{action.name}</h4>
                <p>{action.description}</p>
              </div>
              <button 
                className="action-btn"
                onClick={() => onTriggerHealingAction(action)}
                disabled={healingInProgress}
                style={{ backgroundColor: action.color }}
              >
                Execute
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`healing-logs ${matrixMode ? 'matrix' : ''}`}>
        <div className="logs-header">
          <h3>Recent Healing Activities</h3>
          <button className="clear-btn">Clear All</button>
        </div>
        
        <div className="logs-list">
          {recentHealingLogs.slice(0, 10).map(log => (
            <div key={log.id} className="log-item">
              <div className="log-time">
                {new Date(log.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
              <div className="log-content">
                <div className="log-service">{log.serviceName}</div>
                <div className="log-message">{log.actionTaken}</div>
              </div>
              <div 
                className={`log-status ${log.status?.toLowerCase()}`}
                style={{ 
                  backgroundColor: 
                    log.status === 'HEALING' ? '#0088FF20' : '#00FF8820',
                  color: log.status === 'HEALING' ? '#0088FF' : '#00FF88'
                }}
              >
                {log.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
  );
};

/* ================= ALERTS PAGE ================= */
const AlertsPage = ({ realTimeLogs = [], matrixMode }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredLogs = realTimeLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'healing') return log.status === 'HEALING' || log.status === 'RECOVERED';
    if (filter === 'errors') return log.actionTaken.includes('ERROR') || log.status === 'ERROR';
    if (filter === 'success') return log.status === 'SUCCESS';
    return true;
  });

  const stats = {
    total: realTimeLogs.length,
    healing: realTimeLogs.filter(l => l.status === 'HEALING').length,
    recovered: realTimeLogs.filter(l => l.status === 'RECOVERED').length,
    errors: realTimeLogs.filter(l => l.status === 'ERROR' || l.actionTaken.includes('ERROR')).length,
    success: realTimeLogs.filter(l => l.status === 'SUCCESS').length,
  };

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div className="header-left">
          <h2>Alerts & System Events</h2>
          <p>Real-time notifications and system activities</p>
        </div>
      </div>

      <div className="alert-stats">
        <div className="stat-card">
          <div className="stat-icon total">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon healing">🔧</div>
          <div className="stat-content">
            <div className="stat-number">{stats.healing}</div>
            <div className="stat-label">Healing</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon recovered">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.recovered}</div>
            <div className="stat-label">Recovered</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon errors">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.errors}</div>
            <div className="stat-label">Errors</div>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
        <button 
          className={`tab ${filter === 'healing' ? 'active' : ''}`}
          onClick={() => setFilter('healing')}
        >
          Healing
        </button>
        <button 
          className={`tab ${filter === 'errors' ? 'active' : ''}`}
          onClick={() => setFilter('errors')}
        >
          Errors
        </button>
        <button 
          className={`tab ${filter === 'success' ? 'active' : ''}`}
          onClick={() => setFilter('success')}
        >
          Success
        </button>
      </div>

      <div className={`alerts-container ${matrixMode ? 'matrix' : ''}`}>
        <div className="alerts-list">
          {filteredLogs.map(log => (
            <div key={log.id} className={`alert-item ${log.status?.toLowerCase()}`}>
              <div className="alert-icon">
                {log.status === 'HEALING' ? '🔧' :
                 log.status === 'RECOVERED' ? '✅' :
                 log.status === 'SUCCESS' ? '✓' : '⚠️'}
              </div>
              
              <div className="alert-content">
                <div className="alert-header">
                  <h4 className="alert-title">{log.serviceName}</h4>
                  <span className="alert-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="alert-message">{log.actionTaken}</p>
              </div>
              
              <div 
                className={`alert-status ${log.status?.toLowerCase()}`}
                style={{ 
                  backgroundColor: 
                    log.status === 'HEALING' ? '#0088FF20' :
                    log.status === 'RECOVERED' ? '#00FF8820' :
                    log.status === 'SUCCESS' ? '#00D4AA20' : '#FFB80020',
                  color: 
                    log.status === 'HEALING' ? '#0088FF' :
                    log.status === 'RECOVERED' ? '#00FF88' :
                    log.status === 'SUCCESS' ? '#00D4AA' : '#FFB800'
                }}
              >
                {log.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= SETTINGS PAGE ================= */
const SettingsPage = ({ matrixMode, setMatrixMode }) => {
  const [settings, setSettings] = useState({
    theme: matrixMode ? 'matrix' : 'normal',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'theme') {
      setMatrixMode(value === 'matrix');
    }
  };

  return (
   <div className="settings-page">
  <div className="page-header">
    <h2 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Settings</h2>
    <p style={{ color: matrixMode ? '#00cc33' : '#94a3b8' }}>Configure your dashboard preferences</p>
  </div>

  <div className="settings-grid">
    <div className={`settings-card ${matrixMode ? 'matrix' : ''}`}>
      <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>Theme Settings</h3>
      <div className="theme-selector">
        <button 
          className={`theme-option ${settings.theme === 'normal' ? 'active' : ''}`}
          onClick={() => handleSettingChange('theme', 'normal')}
          style={{
            borderColor: matrixMode ? '#00ff41' : '#334155',
            backgroundColor: settings.theme === 'normal' ? 
              (matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(0, 212, 255, 0.1)') : 'transparent',
            color: matrixMode ? '#00ff41' : '#fff'
          }}
        >
          <div className="theme-preview normal" style={{
            backgroundColor: matrixMode ? '#111' : '#1e293b',
            borderColor: matrixMode ? '#00ff41' : '#00D4FF'
          }}></div>
          <span style={{ color: settings.theme === 'normal' ? 
            (matrixMode ? '#00ff41' : '#00D4FF') : 
            (matrixMode ? '#00cc33' : '#94a3b8') 
          }}>
            Normal Theme
          </span>
        </button>
        <button 
          className={`theme-option ${settings.theme === 'matrix' ? 'active' : ''}`}
          onClick={() => handleSettingChange('theme', 'matrix')}
          style={{
            borderColor: matrixMode ? '#00ff41' : '#334155',
            backgroundColor: settings.theme === 'matrix' ? 
              (matrixMode ? 'rgba(0, 255, 65, 0.2)' : 'rgba(0, 212, 255, 0.1)') : 'transparent',
            color: matrixMode ? '#00ff41' : '#fff'
          }}
        >
          <div className="theme-preview matrix" style={{
            backgroundColor: matrixMode ? '#00ff41' : '#00D4FF',
            boxShadow: matrixMode ? '0 0 10px #00ff41' : '0 0 10px #00D4FF'
          }}></div>
          <span style={{ color: settings.theme === 'matrix' ? 
            (matrixMode ? '#00ff41' : '#00D4FF') : 
            (matrixMode ? '#00cc33' : '#94a3b8') 
          }}>
            Matrix Theme
          </span>
        </button>
      </div>
    </div>

    <div className={`settings-card ${matrixMode ? 'matrix' : ''}`}>
      <h3 style={{ color: matrixMode ? '#00ff41' : '#fff' }}>About</h3>
      <div className="about-content">
        <div className="about-item">
          <span className="about-label" style={{ color: matrixMode ? '#00cc33' : '#94a3b8' }}>Version</span>
          <span className="about-value" style={{ color: matrixMode ? '#00ff41' : '#fff' }}>1.0</span>
        </div>
        <div className="about-item">
          <span className="about-label" style={{ color: matrixMode ? '#00cc33' : '#94a3b8' }}>Support</span>
          <span className="about-value" style={{ color: matrixMode ? '#00ff41' : '#fff' }}>support@energyaware.com</span>
        </div>
      </div>
    </div>
  </div>
</div>
    
  );
};

/* ================= AI SPEEDOMETER COMPONENT ================= */
const AIPredictionSpeedometer = ({ 
  prediction, 
  isOpen, 
  onClose,
  metrics = {},
  onApplyActions
}) => {
  if (!isOpen) return null;

  const riskLevels = [
    { label: "Low", color: "#00D4AA", min: 0, max: 30 },
    { label: "Medium", color: "#FFB800", min: 31, max: 70 },
    { label: "High", color: "#FF3D71", min: 71, max: 100 }
  ];

  const getRiskLevel = () => {
    const confidence = prediction?.confidence || 85;
    return riskLevels.find(level => confidence >= level.min && confidence <= level.max) || riskLevels[0];
  };

  const currentRisk = getRiskLevel();
  const confidence = prediction?.confidence || 85;
  const needleRotation = (confidence * 1.8) - 90;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleApplyActions = () => {
    onApplyActions();
    onClose();
  };

  return (
    <div className="speedometer-overlay" onClick={handleOverlayClick}>
      <div className="speedometer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Risk Prediction Analysis</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="gauge-section">
          <div className="gauge-container">
            <div className="gauge-background">
              <div className="gauge-segment low"></div>
              <div className="gauge-segment medium"></div>
              <div className="gauge-segment high"></div>
            </div>
            <div 
              className="needle"
              style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
            />
            <div className="gauge-center">
              <div className="gauge-value">{confidence}%</div>
            </div>
          </div>
          
          <div 
            className="risk-badge"
            style={{ backgroundColor: currentRisk.color }}
          >
            {prediction?.prediction || "Low Risk"}
          </div>
        </div>
        
        <div className="details-section">
          <h3>Prediction Details</h3>
          <div className="detail-row">
            <span className="detail-label">Confidence Level:</span>
            <span className="detail-value">{confidence}%</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Risk Level:</span>
            <span className="detail-value" style={{ color: currentRisk.color }}>
              {prediction?.prediction || "Low Risk"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Recommended Action:</span>
            <span className="detail-value">
              {prediction?.action || "System is stable, continue monitoring."}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Timestamp:</span>
            <span className="detail-value">
              {prediction?.timestamp ? new Date(prediction.timestamp).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">CPU Usage</div>
            <div className="metric-value">{metrics.cpu || 0}%</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${metrics.cpu || 0}%`,
                  backgroundColor: (metrics.cpu || 0) > 70 ? '#FF3D71' : (metrics.cpu || 0) > 50 ? '#FFB800' : '#00D4AA'
                }}
              />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Memory Usage</div>
            <div className="metric-value">{metrics.memory || 0}MB</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(metrics.memory || 0) / 20}%`,
                  backgroundColor: (metrics.memory || 0) > 1500 ? '#FF3D71' : (metrics.memory || 0) > 1000 ? '#FFB800' : '#00D4AA'
                }}
              />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Network I/O</div>
            <div className="metric-value">{metrics.network || 0}MB/s</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(metrics.network || 0) * 3}%`,
                  backgroundColor: (metrics.network || 0) > 15 ? '#FF3D71' : (metrics.network || 0) > 10 ? '#FFB800' : '#00D4AA'
                }}
              />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-label">Energy Score</div>
            <div className="metric-value">{metrics.energy || 85}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${metrics.energy || 85}%`,
                  backgroundColor: (metrics.energy || 85) > 80 ? '#00D4AA' : (metrics.energy || 85) > 60 ? '#FFB800' : '#FF3D71'
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="recommendations-section">
          <h3>AI Recommendations</h3>
          <ul className="recommendations-list">
            <li>Monitor CPU usage closely - consider scaling if it exceeds 70%</li>
            <li>Review memory allocation for services showing high usage</li>
            <li>Optimize network configuration for better throughput</li>
            <li>Schedule maintenance during low-traffic periods</li>
          </ul>
        </div>
        
        <div className="modal-actions">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-btn primary" onClick={handleApplyActions}>
            Apply Recommended Actions
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN APP COMPONENT ================= */
function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [cpuSeries, setCpuSeries] = useState([45, 52, 48, 60, 55, 65, 70]);
  const [memSeries, setMemSeries] = useState([800, 850, 900, 950, 1000, 1050, 1100]);
  const [networkSeries, setNetworkSeries] = useState([10, 12, 8, 15, 18, 20, 16]);
  
  const [timestamps, setTimestamps] = useState(() => {
    const now = new Date();
    const stamps = [];
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000);
      stamps.push(time);
    }
    return stamps;
  });

  const [prediction, setPrediction] = useState(null);
  const [showSpeedometer, setShowSpeedometer] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const [healingInProgress, setHealingInProgress] = useState(false);
  const [systemHealth, setSystemHealth] = useState(85);
  const [activeServiceTab, setActiveServiceTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [realTimePods, setRealTimePods] = useState([
    { id: 1, name: "payment-service-1", status: "Running", node: "node-1", cpu: 45, memory: 512, restartCount: 0 },
    { id: 2, name: "auth-service-1", status: "Running", node: "node-2", cpu: 32, memory: 256, restartCount: 0 },
    { id: 3, name: "inventory-service-1", status: "Warning", node: "node-3", cpu: 85, memory: 1800, restartCount: 2 },
    { id: 4, name: "database-service-1", status: "Running", node: "node-1", cpu: 25, memory: 2048, restartCount: 1 },
    { id: 5, name: "cache-service-1", status: "Error", node: "node-2", cpu: 95, memory: 512, restartCount: 3 },
    { id: 6, name: "api-gateway-1", status: "Running", node: "node-3", cpu: 40, memory: 1024, restartCount: 0 },
    { id: 7, name: "analytics-service-1", status: "Pending", node: "node-1", cpu: 0, memory: 128, restartCount: 0 },
    { id: 8, name: "notification-service-1", status: "Running", node: "node-2", cpu: 60, memory: 768, restartCount: 1 }
  ]);
  
  const [realTimeLogs, setRealTimeLogs] = useState([
    {
      id: 1,
      serviceName: "payment-service",
      actionTaken: "HEALING_TRIGGERED - Restarting pod due to high CPU",
      timestamp: new Date(Date.now() - 5000).toISOString(),
      status: "HEALING"
    },
    {
      id: 2,
      serviceName: "auth-service",
      actionTaken: "AUTOSCALE - Scaled up to 3 replicas",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "SUCCESS"
    },
    {
      id: 3,
      serviceName: "inventory-service",
      actionTaken: "RECOVERED - Memory leak fixed",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: "RECOVERED"
    },
    {
      id: 4,
      serviceName: "database-service",
      actionTaken: "OPTIMIZATION - Database connections optimized",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: "SUCCESS"
    },
    {
      id: 5,
      serviceName: "cache-service",
      actionTaken: "HEALING_TRIGGERED - Cache service restarting",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      status: "HEALING"
    }
  ]);
  
  const [energyScore, setEnergyScore] = useState(85);

  // ==================== Quick Action Handlers ====================
  const handleQuickAction = useCallback((actionId) => {
    console.log(`Quick action ${actionId} triggered`);
    // Implementation...
  }, []);

  // ==================== Socket Connection ====================
  useEffect(() => {
    const socketInstance = io("http://localhost:8080", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  // ==================== Initial Setup ====================
  useEffect(() => {
    fetchBackendStatus();
    
    setPrediction({
      prediction: "Low Risk",
      confidence: 85,
      action: "System is stable, continue monitoring.",
      timestamp: new Date().toISOString()
    });

    const simulationInterval = setInterval(() => {
      simulateRealTimeUpdates();
    }, 3000);

    return () => clearInterval(simulationInterval);
  }, []);

  // ==================== Real-time Simulation ====================
  const simulateRealTimeUpdates = useCallback(() => {
    const now = new Date();
    
    setTimestamps(prev => [...prev.slice(1), now]);
    
    const updatedPods = realTimePods.map(pod => {
      if (Math.random() < 0.2) {
        const statuses = ['Running', 'Warning', 'Error', 'Pending'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const newCpu = Math.max(0, Math.min(100, pod.cpu + (Math.random() * 30 - 15)));
        const newMemory = Math.max(128, Math.min(2048, pod.memory + (Math.random() * 500 - 250)));
        
        const newRestartCount = newStatus === 'Error' ? pod.restartCount + 1 : pod.restartCount;
        
        return { ...pod, status: newStatus, cpu: Math.round(newCpu), memory: Math.round(newMemory), restartCount: newRestartCount };
      }
      return pod;
    });
    
    setRealTimePods(updatedPods);
    
    const totalCpu = updatedPods.reduce((sum, pod) => sum + pod.cpu, 0) / updatedPods.length;
    const totalMemory = updatedPods.reduce((sum, pod) => sum + pod.memory, 0) / updatedPods.length;
    
    setCpuSeries(prev => [...prev.slice(-6), Math.round(totalCpu)]);
    setMemSeries(prev => [...prev.slice(-6), Math.round(totalMemory)]);
    
    const newNetwork = Math.round(5 + Math.random() * 25);
    setNetworkSeries(prev => [...prev.slice(-6), newNetwork]);
    
    const healthyPods = updatedPods.filter(p => p.status === 'Running').length;
    const healthScore = Math.round((healthyPods / updatedPods.length) * 100);
    const energyScore = 100 - (totalCpu * 0.3 + (totalMemory / 2000) * 20 + newNetwork * 0.5);
    
    setSystemHealth(healthScore);
    setEnergyScore(Math.max(0, Math.min(100, Math.round(energyScore))));
    
    let predictionLevel = "Low";
    let confidence = 85 + Math.floor(Math.random() * 10);
    let action = "System is stable, continue monitoring.";
    
    if (totalCpu > 75 || totalMemory > 1500 || healthScore < 70) {
      predictionLevel = "High";
      confidence = 90 + Math.floor(Math.random() * 7);
      action = "⚠️ Immediate action required! Scale resources and investigate root cause.";
    } else if (totalCpu > 60 || totalMemory > 1200 || healthScore < 80) {
      predictionLevel = "Medium";
      confidence = 87 + Math.floor(Math.random() * 8);
      action = "Monitor closely. Consider resource optimization and scaling.";
    }
    
    setPrediction({
      prediction: `${predictionLevel} Risk`,
      confidence,
      action,
      timestamp: new Date().toISOString()
    });
  }, [realTimePods]);

  const fetchBackendStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/status`);
      setBackendStatus(res.data?.message || "Running");
    } catch {
      setBackendStatus("❌ Backend Unreachable");
    }
  };

  // ==================== Healing Functions ====================
  const triggerHealing = useCallback((pod) => {
    setHealingInProgress(true);
    
    setTimeout(() => {
      setHealingInProgress(false);
    }, 2000);
  }, []);

  const triggerHealingAction = useCallback((action) => {
    setHealingInProgress(true);
    
    setTimeout(() => {
      setHealingInProgress(false);
    }, 3000);
  }, []);

  // ==================== Speedometer Functions ====================
  const handleShowSpeedometer = useCallback(() => {
    console.log("🚀 handleShowSpeedometer called - showing modal");
    setShowSpeedometer(true);
  }, []);

  const applyRecommendedActions = useCallback(() => {
    console.log("Applying recommended actions...");
    alert("Recommended actions have been applied successfully!");
  }, []);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: matrixMode ? 'rgba(0, 20, 0, 0.9)' : 'rgba(0,0,0,0.8)',
        titleColor: matrixMode ? '#00ff41' : '#00D4FF',
        bodyColor: '#ffffff',
        borderColor: matrixMode ? '#00ff41' : '#00D4FF',
        borderWidth: 1,
        cornerRadius: 4,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { 
          color: matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255,255,255,0.05)',
          drawBorder: false
        },
        ticks: { 
          color: matrixMode ? '#00ff41' : '#888',
          maxTicksLimit: 5
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: matrixMode ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255,255,255,0.05)',
          drawBorder: false
        },
        ticks: { 
          color: matrixMode ? '#00ff41' : '#888'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 300
    }
  }), [matrixMode]);

  return (
    <Router>
      <div className={`app-container ${matrixMode ? 'matrix-mode' : ''}`}>
        <Sidebar 
          matrixMode={matrixMode}
          setMatrixMode={setMatrixMode}
          systemHealth={systemHealth}
          isConnected={isConnected}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <DashboardPage 
                prediction={prediction}
                matrixMode={matrixMode}
                systemHealth={systemHealth}
                cpuSeries={cpuSeries}
                memSeries={memSeries}
                networkSeries={networkSeries}
                realTimePods={realTimePods}
                realTimeLogs={realTimeLogs}
                energyScore={energyScore}
                onShowSpeedometer={handleShowSpeedometer}
                onTriggerHealing={triggerHealing}
                onQuickAction={handleQuickAction}
              />
            } />
            
            <Route path="/services" element={
              <ServicesPage 
                realTimePods={realTimePods}
                matrixMode={matrixMode}
                onTriggerHealing={triggerHealing}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeServiceTab={activeServiceTab}
                setActiveServiceTab={setActiveServiceTab}
              />
            } />
            
            <Route path="/monitoring" element={
              <MonitoringPage 
                cpuSeries={cpuSeries}
                memSeries={memSeries}
                networkSeries={networkSeries}
                chartOptions={chartOptions}
                matrixMode={matrixMode}
                timestamps={timestamps}
              />
            } />
            
            <Route path="/ai-insights" element={
              <AIInsightsPage 
                prediction={prediction}
                matrixMode={matrixMode}
                onShowSpeedometer={handleShowSpeedometer}
                cpuSeries={cpuSeries}
                memSeries={memSeries}
                networkSeries={networkSeries}
                energyScore={energyScore}
              />
            } />
            
            <Route path="/healing" element={
              <HealingPage 
                matrixMode={matrixMode}
                healingInProgress={healingInProgress}
                onTriggerHealingAction={triggerHealingAction}
                realTimeLogs={realTimeLogs}
              />
            } />
            
            <Route path="/alerts" element={
              <AlertsPage 
                realTimeLogs={realTimeLogs}
                matrixMode={matrixMode}
              />
            } />
            
            <Route path="/settings" element={
              <SettingsPage 
                matrixMode={matrixMode}
                setMatrixMode={setMatrixMode}
              />
            } />
          </Routes>
        </main>
        
        <AIPredictionSpeedometer
          prediction={prediction}
          isOpen={showSpeedometer}
          onClose={() => {
            console.log("Closing speedometer");
            setShowSpeedometer(false);
          }}
          onApplyActions={applyRecommendedActions}
          metrics={{
            cpu: cpuSeries.length > 0 ? cpuSeries[cpuSeries.length - 1] : 0,
            memory: memSeries.length > 0 ? memSeries[memSeries.length - 1] : 0,
            network: networkSeries.length > 0 ? networkSeries[networkSeries.length - 1] : 0,
            energy: energyScore
          }}
        />
      </div>
    </Router>
  );
}

export default App;