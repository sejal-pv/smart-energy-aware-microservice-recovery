import React, { useState } from "react";
import { postPredict } from "../api";

export default function PredictForm(){
  const [form, setForm] = useState({ cpu: 50, memory: 400, network: 10, disk: 40 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        "CPU_Usage (%)": Number(form.cpu),
        "Memory_Usage (MB)": Number(form.memory),
        "Network_Usage (MBps)": Number(form.network),
        "Disk_Usage (%)": Number(form.disk)
      };
      const res = await postPredict(payload);
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult({ error: "Prediction failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input name="cpu" type="number" value={form.cpu} onChange={onChange} className="p-2 border rounded" />
        <input name="memory" type="number" value={form.memory} onChange={onChange} className="p-2 border rounded" />
        <input name="network" type="number" value={form.network} onChange={onChange} className="p-2 border rounded" />
        <input name="disk" type="number" value={form.disk} onChange={onChange} className="p-2 border rounded" />
      </div>

      <button className="w-full bg-indigo-600 text-white p-2 rounded" disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div className="mt-2 bg-slate-50 p-2 rounded text-sm">
          {result.error ? <div className="text-red-600">{result.error}</div> : (
            <>
              <div>Prediction: <strong>{result.prediction || result.label || "-"}</strong></div>
              {result.action && <div>Action: <strong>{result.action}</strong></div>}
              {result.confidence && <div>Confidence: {(result.confidence*100).toFixed(0)}%</div>}
            </>
          )}
        </div>
      )}
    </form>
  );
}
