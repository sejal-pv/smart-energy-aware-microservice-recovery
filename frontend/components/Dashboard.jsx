import React, { useEffect, useState, useRef } from "react";
import { fetchMetrics, fetchServices, fetchAlerts } from "../api";
import ResourceCharts from "./ResourceCharts";
import ServiceCard from "./ServiceCard";
import PredictForm from "./PredictForm";
import AlertsPanel from "./AlertsPanel";

export default function Dashboard(){
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const pollRef = useRef(null);

  const pollAll = async () => {
    try {
      const metrics = await fetchMetrics();
      const svcs = await fetchServices();
      const al = await fetchAlerts();

      setMetricsHistory(prev => {
        const next = [...prev, {...metrics, ts: Date.now()}].slice(-60);
        return next;
      });
      setServices(svcs);
      setAlerts(al);
    } catch (err) {
      console.error("poll error", err);
    }
  };

  useEffect(() => {
    // initial fetch
    pollAll();
    // poll every 5 seconds
    pollRef.current = setInterval(pollAll, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <ResourceCharts data={metricsHistory} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {services.map(svc => (
            <ServiceCard key={svc.id} svc={svc} />
          ))}
        </div>
      </div>

      <aside className="col-span-4 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2">AI Predict</h2>
          <PredictForm />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="font-semibold mb-2">Alerts</h2>
          <AlertsPanel alerts={alerts} />
        </div>
      </aside>
    </div>
  );
}
