import React from "react";

export default function AlertsPanel({ alerts = [] }){
  if(!alerts.length) return <div className="text-sm text-slate-500">No alerts</div>;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {alerts.map((a, i) => (
        <div key={i} className="p-2 border rounded-sm bg-amber-50">
          <div className="text-xs text-slate-600">{new Date(a.ts || Date.now()).toLocaleString()}</div>
          <div className="text-sm font-medium">{a.message}</div>
          <div className="text-xs text-slate-500">{a.serviceId || "cluster"}</div>
        </div>
      ))}
    </div>
  );
}
