import React from "react";

export default function ServiceCard({ svc }){
  const statusColor = svc.status === "running" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  const pred = svc.last_pred || {};

  return (
    <div className="bg-white p-4 rounded-md shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{svc.id}</div>
          <div className="text-xs text-slate-500">{svc.node || "-"}</div>
        </div>
        <div className={`px-2 py-1 rounded text-xs ${statusColor}`}>{svc.status}</div>
      </div>

      <div className="mt-3 flex-grow">
        <div className="text-sm">CPU: <strong>{svc.cpu ?? "-"}</strong>%</div>
        <div className="text-sm">Memory: <strong>{svc.memory ?? "-"}</strong> MB</div>
        <div className="text-sm">Last action: <strong>{pred.action ?? "—"}</strong></div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-slate-600">Prediction: <span className="font-semibold">{pred.label ?? "None"}</span></div>
        <div className="text-xs text-slate-400">Confidence: {pred.confidence ? (pred.confidence*100).toFixed(0) + "%" : "-"}</div>
      </div>
    </div>
  );
}
