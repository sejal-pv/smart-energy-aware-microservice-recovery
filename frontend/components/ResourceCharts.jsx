import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function transformData(history){
  // history: [{ts, cpu, memory, network, disk}, ...]
  return history.map(item => ({
    time: new Date(item.ts).toLocaleTimeString(),
    cpu: item.cpu,
    memory: item.memory,
    network: item.network,
    disk: item.disk
  }));
}

export default function ResourceCharts({ data }){
  const chartData = transformData(data);

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Cluster Resource Trends (last ~60 polls)</h3>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="time" minTickGap={30} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#1f2937" strokeWidth={2} dot={false} name="CPU (%)" />
            <Line type="monotone" dataKey="memory" stroke="#2563eb" strokeWidth={2} dot={false} name="Memory (MB)" />
            <Line type="monotone" dataKey="network" stroke="#16a34a" strokeWidth={2} dot={false} name="Network (MBps)" />
            <Line type="monotone" dataKey="disk" stroke="#dc2626" strokeWidth={2} dot={false} name="Disk (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
