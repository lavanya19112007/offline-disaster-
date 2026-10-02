import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  TrendingUp,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Compass,
  PieChart,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { incidents, resources, meshNodes } = useDisaster();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Time distribution of incoming reports (Hourly trend)
  const hourlyData = [
    { time: '04:00', count: 4, critical: 1 },
    { time: '05:00', count: 9, critical: 2 },
    { time: '06:00', count: 18, critical: 5 },
    { time: '07:00', count: 34, critical: 11 },
    { time: '08:00', count: 46, critical: 14 },
    { time: '09:00', count: 28, critical: 8 },
    { time: 'Current', count: 15, critical: 4 },
  ];

  // Category counts
  const categoryStats = [
    { name: 'Medical Emergency', count: 14, percent: 32, color: '#ef4444' },
    { name: 'Flood & Swiftwater', count: 12, percent: 27, color: '#0284c7' },
    { name: 'Trapped / Structural', count: 9, percent: 20, color: '#f97316' },
    { name: 'Fire & Hazmat', count: 5, percent: 11, color: '#eab308' },
    { name: 'Food / Water Shortage', count: 4, percent: 10, color: '#10b981' },
  ];

  // Sector breakdown
  const sectorStats = [
    { sector: 'Sector Alpha (North)', count: 9, risk: 'High (Bridges Impasse)' },
    { sector: 'Sector Bravo (Urban)', count: 11, risk: 'Critical (Power Outage)' },
    { sector: 'Sector Charlie (Hills)', count: 8, risk: 'Moderate (Mudslides)' },
    { sector: 'Sector Delta (Lowlands)', count: 14, risk: 'Critical (Swiftwater Flood)' },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Disaster Response & Mesh Network Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated telemetry analyzing incident trends, dispatch velocities, peer hops, and survivability metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
            Incident Window: Past 6 Hours
          </span>
        </div>
      </div>

      {/* 4 Summary High-Impact KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Avg Triage & Dispatch Time
          </span>
          <div className="text-2xl font-extrabold text-white font-mono">4.2 min</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>↓ 68% faster with AI triage</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Mesh Delivery Success Rate
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">98.4%</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 129 message relays</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Average Relaying Hops
          </span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">2.8 hops</div>
          <div className="text-[11px] text-slate-400 mt-1">Max hop cap: 7 TTL</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Fleet Asset Utilization
          </span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">75.0%</div>
          <div className="text-[11px] text-slate-400 mt-1">15 of 20 units dispatched</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Incident Volume Over Time (Hourly Bar Chart) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Emergency Reports Over Time</h3>
              <p className="text-xs text-slate-400">Incoming SOS volume (Total vs Critical)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span> Total
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Critical
              </span>
            </div>
          </div>

          {/* SVG/HTML Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {hourlyData.map((d, i) => {
              const heightPercent = Math.round((d.count / maxHourly) * 100);
              const critHeight = Math.round((d.critical / maxHourly) * 100);
              return (
                <div
                  key={i}
                  onMouseEnter={() => setActiveTooltip(`hour-${i}`)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative group cursor-pointer"
                >
                  {/* Tooltip */}
                  {activeTooltip === `hour-${i}` && (
                    <div className="absolute bottom-full mb-2 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] whitespace-nowrap z-20 pointer-events-none shadow-xl">
                      <div className="font-bold text-white">{d.time}</div>
                      <div className="text-cyan-300">Total: {d.count}</div>
                      <div className="text-rose-400">Critical: {d.critical}</div>
                    </div>
                  )}

                  {/* Bars container */}
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-1/2 bg-cyan-500/80 group-hover:bg-cyan-400 rounded-t-lg transition-all"
                    ></div>
                    <div
                      style={{ height: `${critHeight}%` }}
                      className="w-1/2 bg-rose-500/80 group-hover:bg-rose-400 rounded-t-lg transition-all"
                    ></div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">{d.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Emergency Categories Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">Emergency Categories</h3>
            <p className="text-xs text-slate-400">Breakdown of reported incident typologies</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryStats.map((cat, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-semibold flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="font-mono">
                    <strong className="text-white">{cat.count}</strong> ({cat.percent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Geographic Concentration by Sector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">Geographic Concentration</h3>
            <p className="text-xs text-slate-400">Incident density across disaster response sectors</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectorStats.map((sec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
              >
                <div className="font-bold text-white">{sec.sector}</div>
                <div className="flex justify-between items-center text-slate-400 pt-1">
                  <span>Incident Count:</span>
                  <span className="font-mono text-cyan-400 font-bold">{sec.count}</span>
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium">
                  {sec.risk}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Offline to Online Synchronization Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white">Offline Sync Telemetry</h3>
              <p className="text-xs text-slate-400">
                Data packet recovery when gateway uplinks cycle online/offline
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Packets Buffered During Blackout:</span>
                <span className="font-mono text-cyan-300 font-bold">48 packets</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Synchronized on Uplink Reconnect:</span>
                <span className="font-mono text-emerald-400 font-bold">48 / 48 (100%)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Average Mesh Latency (Hop-to-Hop):</span>
                <span className="font-mono text-white font-bold">142 ms</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Zero packet corruption verified across all decentralized store-and-forward buffers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
