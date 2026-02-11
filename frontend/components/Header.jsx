import React from "react";

export default function Header(){
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">SmartEnergy — Monitoring Panel</h1>
          <p className="text-sm text-slate-500">Real-time resource & AI predictions</p>
        </div>
        <div className="text-sm text-slate-600">User: Sejal</div>
      </div>
    </header>
  );
}
