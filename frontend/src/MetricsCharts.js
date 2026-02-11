import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from "recharts";

export default function MetricsCharts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulated live CPU & Memory values
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.floor(Math.random() * 90) + 10,
        memory: Math.floor(Math.random() * 8000) + 500
      };

      setData(prev => [...prev.slice(-9), newPoint]); // keep last 10 points
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📊 Live CPU & Memory Trends</h2>

      <LineChart width={700} height={300} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="left" label={{ value: "CPU %", angle: -90, dx: -10 }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Memory (MB)", angle: 90, dx: 15 }} />
        <Tooltip />
        <Legend />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cpu"
          stroke="red"
          strokeWidth={2}
        />

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="memory"
          stroke="blue"
          strokeWidth={2}
        />
      </LineChart>
    </div>
  );
}
