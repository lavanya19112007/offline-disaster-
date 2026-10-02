import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  Smartphone,
  Radio,
  Wifi,
  WifiOff,
  Battery,
  ShieldCheck,
  Zap,
  ArrowRight,
  Server,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Users,
  Compass,
  FileCheck2,
} from 'lucide-react';

interface InteractiveNode {
  id: string;
  name: string;
  role: string;
  status: 'Connected' | 'Relaying' | 'Gateway' | 'Command Hub';
  relayed: number;
  battery: number;
  lastSync: string;
  x: number;
  y: number;
  type: 'phone' | 'gateway' | 'command';
}

export const LandingPage: React.FC = () => {
  const {
    setActiveView,
    setCommandCenterTab,
    simulationRunning,
    toggleSimulation,
    simulateNetworkFailure,
    restoreNetwork,
    networkConnectivity,
    simulationStats,
  } = useDisaster();

  const [hoveredNode, setHoveredNode] = useState<InteractiveNode | null>(null);

  const demoNodes: InteractiveNode[] = [
    {
      id: 'PHONE-A',
      name: 'Phone A (Origin SOS)',
      role: 'Citizen in Flood Zone',
      status: 'Relaying',
      relayed: 1,
      battery: 76,
      lastSync: '12s ago (P2P BLE)',
      x: 10,
      y: 50,
      type: 'phone',
    },
    {
      id: 'PHONE-B',
      name: 'Phone B (Mesh Hop 1)',
      role: 'Citizen on 2nd Floor',
      status: 'Relaying',
      relayed: 14,
      battery: 88,
      lastSync: '4s ago (Wi-Fi Direct)',
      x: 32,
      y: 28,
      type: 'phone',
    },
    {
      id: 'PHONE-C',
      name: 'Phone C (Mesh Hop 2)',
      role: 'Responder Drone Beacon',
      status: 'Relaying',
      relayed: 49,
      battery: 92,
      lastSync: '1s ago (Sub-GHz LoRa)',
      x: 55,
      y: 65,
      type: 'phone',
    },
    {
      id: 'GATEWAY-SAT',
      name: 'Internet Gateway',
      role: 'Starlink Mobile Uplink',
      status: 'Gateway',
      relayed: 238,
      battery: 99,
      lastSync: 'Real-time (SatLink)',
      x: 76,
      y: 35,
      type: 'gateway',
    },
    {
      id: 'COMMAND-HQ',
      name: 'Command Center',
      role: 'Emergency Dispatch Hub',
      status: 'Command Hub',
      relayed: 642,
      battery: 100,
      lastSync: 'Synchronized',
      x: 93,
      y: 50,
      type: 'command',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Offline-First Disaster Mesh & AI Incident Triage Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              When the network goes down,{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                communication shouldn't.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              ResQMesh enables emergency information to travel device-to-device and
              reach responders when conventional connectivity is unavailable.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  setActiveView('command_center');
                  setCommandCenterTab('overview');
                }}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/30 flex items-center gap-2 group transition-all"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveView('citizen')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Open Citizen App</span>
              </button>
            </div>
          </div>

          {/* Interactive Network Hop Visualization */}
          <div className="mt-12 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Interactive Device Hop Relay Architecture</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hover over any node to inspect device battery, hop latency, and relayed emergency packets.
                </p>
              </div>

              {/* Status & Failure Injection controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Network Simulation:</span>
                <button
                  onClick={() => {
                    if (networkConnectivity === 'ONLINE') {
                      simulateNetworkFailure();
                    } else {
                      restoreNetwork();
                    }
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    networkConnectivity === 'ONLINE'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/60'
                  }`}
                >
                  {networkConnectivity === 'ONLINE' ? 'Cut Cellular (Test Offline)' : 'Restore Uplink'}
                </button>
              </div>
            </div>

            {/* SVG Network Graph Canvas */}
            <div className="relative h-64 sm:h-72 w-full mt-4 flex items-center justify-center">
              {/* Connecting animated dotted line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Connecting lines between nodes */}
                <path
                  d="M 10% 50% Q 21% 32% 32% 28% T 55% 65% T 76% 35% T 93% 50%"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Animated traveling packet circles */}
                <circle r="4" fill="#38bdf8" className="animate-ping">
                  <animateMotion
                    path="M 10% 50% Q 21% 32% 32% 28% T 55% 65% T 76% 35% T 93% 50%"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="3" fill="#ffffff">
                  <animateMotion
                    path="M 10% 50% Q 21% 32% 32% 28% T 55% 65% T 76% 35% T 93% 50%"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Node icons positioned absolutely */}
              {demoNodes.map((node) => {
                const isHovered = hoveredNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    {/* Pulsing ring on hover or active */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isHovered
                          ? 'scale-110 shadow-xl shadow-cyan-500/30 border-cyan-400 bg-slate-800'
                          : 'shadow-md border-slate-700 bg-slate-900/90'
                      } border`}
                    >
                      {node.type === 'phone' ? (
                        <Smartphone
                          className={`w-6 h-6 ${
                            node.id === 'PHONE-A'
                              ? 'text-rose-400'
                              : isHovered
                              ? 'text-cyan-300'
                              : 'text-slate-300'
                          }`}
                        />
                      ) : node.type === 'gateway' ? (
                        <Radio
                          className={`w-6 h-6 ${
                            networkConnectivity === 'OFFLINE'
                              ? 'text-rose-400'
                              : 'text-sky-400 animate-spin-slow'
                          }`}
                        />
                      ) : (
                        <Server className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>

                    {/* Label below node */}
                    <div className="text-center mt-1.5 whitespace-nowrap">
                      <p className="text-[11px] font-semibold text-slate-200">
                        {node.name.split(' ')[0]} {node.name.split(' ')[1]}
                      </p>
                      <p className="text-[10px] text-slate-400">{node.role}</p>
                    </div>

                    {/* Hover inspection popover */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 bg-slate-900 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl z-50 pointer-events-none text-left">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            {node.id}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              node.status === 'Command Hub'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-cyan-950 text-cyan-300'
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Role:</span>
                            <span className="font-medium text-right">{node.role}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Battery:</span>
                            <span className="text-emerald-400 font-mono font-medium">
                              {node.battery}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Messages Relayed:</span>
                            <span className="font-mono text-cyan-300">
                              {node.relayed} pkts
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Last Sync:</span>
                            <span className="text-slate-300 text-[11px] font-mono">
                              {node.lastSync}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom explanation strip */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Phone A creates SOS locally</span>
                <span className="text-slate-600">→</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Relays via Bluetooth/Wi-Fi Direct hops</span>
                <span className="text-slate-600">→</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Reaches Command Center when Gateway is in range</span>
              </div>

              <div className="font-mono text-cyan-400 text-[11px]">
                AES-256 E2E Encrypted · Zero Cloud Dependency
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-4 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered for Ground Zero Conditions
          </h2>
          <p className="text-sm text-slate-400">
            ResQMesh combines decentralized mesh networking, AI-assisted triage, and
            command coordination to eliminate communication blackouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Citizen Offline Mode */}
          <div
            onClick={() => setActiveView('citizen')}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              Citizen Offline App
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant 1-tap SOS generation with GPS stamps. Stores messages locally and
              hops through neighboring peer devices until reaching an active uplink.
            </p>
          </div>

          {/* Card 2: AI Emergency Intelligence */}
          <div
            onClick={() => {
              setActiveView('command_center');
              setCommandCenterTab('ai_intelligence');
            }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
              AI Incident Triage
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini-powered natural language analysis parses voice & text to extract
              urgency, affected headcounts, and required emergency resources with human verification.
            </p>
          </div>

          {/* Card 3: Duplicate Incident Detection */}
          <div
            onClick={() => {
              setActiveView('command_center');
              setCommandCenterTab('incident_intelligence');
            }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-500/20 transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
              Duplicate Clustering
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clusters converging reports (e.g. collapsed bridges, levee breaches) into
              singular verified incidents to prevent dispatch duplication and cognitive overload.
            </p>
          </div>

          {/* Card 4: Dynamic Live Map */}
          <div
            onClick={() => {
              setActiveView('command_center');
              setCommandCenterTab('live_map');
            }}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Interactive Mission Map
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time sector visualization of critical emergencies, rescue boats, 4x4
              ambulances, shelters, and medical clinics with one-click dispatch routing.
            </p>
          </div>
        </div>
      </section>

      {/* Disaster Flow Simulation Banner */}
      <section className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-y border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
              End-to-End Walkthrough Experience
            </span>
            <h3 className="text-xl font-bold text-white">
              Experience the Complete Offline Disaster Flow in Real Time
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              1. Open Citizen App → 2. Cut cellular simulation → 3. Trigger SOS → 4. Watch
              peer device hops → 5. Restore connection → 6. Triage in Command Center Live Map.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('citizen')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
            >
              Start Step 1: Citizen SOS
            </button>
            <button
              onClick={() => {
                setActiveView('command_center');
                setCommandCenterTab('live_map');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              Skip to Live Map
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResQMesh Disaster Response System — Prototype Environment</span>
          <span className="font-mono text-[11px]">
            AES-256 Mesh Security Protocol · AI-Assisted Dispatch
          </span>
        </div>
      </footer>
    </div>
  );
};
