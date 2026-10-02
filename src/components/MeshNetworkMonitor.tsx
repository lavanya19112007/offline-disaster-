import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { MeshNode, NetworkPacket } from '../types/disaster';
import {
  Radio,
  Wifi,
  WifiOff,
  Battery,
  Layers,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Activity,
  Zap,
  Shield,
  Sparkles,
  Info,
} from 'lucide-react';

export const MeshNetworkMonitor: React.FC = () => {
  const {
    meshNodes,
    toggleNodeFailure,
    addMeshNode,
    removeMeshNode,
    activePackets,
    networkConnectivity,
    simulateNetworkFailure,
    restoreNetwork,
  } = useDisaster();

  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(meshNodes[0]);
  const [poorConnectivity, setPoorConnectivity] = useState<boolean>(false);

  const connectedCount = meshNodes.filter((n) => n.status === 'active').length;
  const weakCount = meshNodes.filter((n) => n.status === 'weak').length;
  const offlineCount = meshNodes.filter((n) => n.status === 'offline').length;
  const totalRelayed = meshNodes.reduce((acc, n) => acc + n.messagesRelayed, 0);

  // Core backbone nodes for the primary graph hierarchy
  const backboneGraph = [
    {
      id: 'NODE-A',
      label: 'Device A (Origin)',
      x: 50,
      y: 15,
      type: 'phone',
      status: 'active',
      desc: 'Citizen phone on roof',
    },
    {
      id: 'NODE-B',
      label: 'Device B (Relay 1)',
      x: 25,
      y: 42,
      type: 'phone',
      status: meshNodes.find((n) => n.id === 'NODE-11A0')?.status || 'active',
      desc: 'Neighbor second floor phone',
    },
    {
      id: 'NODE-C',
      label: 'Device C (Relay 2)',
      x: 75,
      y: 42,
      type: 'phone',
      status: meshNodes.find((n) => n.id === 'BEACON-02')?.status || 'active',
      desc: 'Water tower repeater',
    },
    {
      id: 'NODE-D',
      label: 'Device D (Drone)',
      x: 75,
      y: 70,
      type: 'drone',
      status: meshNodes.find((n) => n.id === 'DRONE-01')?.status || 'active',
      desc: 'Tethered UAV relay beacon',
    },
    {
      id: 'GATEWAY',
      label: 'Satellite Gateway',
      x: 50,
      y: 92,
      type: 'gateway',
      status: networkConnectivity === 'OFFLINE' ? 'offline' : 'active',
      desc: 'Starlink Command Uplink',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Network Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Physical Layer Topology
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800">
                P2P Mesh v2.4 (Simulated)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Mesh Network Dynamic Topology Monitor</span>
            </h2>
          </div>

          {/* Quick Graph Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                addMeshNode({ label: `Deployable Node #${meshNodes.length + 1}` })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Node</span>
            </button>

            <button
              onClick={() => setPoorConnectivity(!poorConnectivity)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                poorConnectivity
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{poorConnectivity ? 'High Interference Active' : 'Simulate Poor Link'}</span>
            </button>

            <button
              onClick={() => {
                if (networkConnectivity === 'ONLINE') {
                  simulateNetworkFailure();
                } else {
                  restoreNetwork();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                networkConnectivity === 'ONLINE'
                  ? 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-rose-900'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>{networkConnectivity === 'ONLINE' ? 'Fail Gateway' : 'Restore Gateway'}</span>
            </button>
          </div>
        </div>

        {/* 7 Network Telemetry Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Active Nodes
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {connectedCount}
            </div>
            <div className="text-[10px] text-slate-500">Connected</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Offline Nodes
            </span>
            <div className="text-xl font-bold text-rose-400 font-mono">
              {offlineCount}
            </div>
            <div className="text-[10px] text-slate-500">Unreachable</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Active Relays
            </span>
            <div className="text-xl font-bold text-cyan-400 font-mono">14</div>
            <div className="text-[10px] text-slate-500">Beacons & Repeaters</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Messages Relayed
            </span>
            <div className="text-xl font-bold text-white font-mono">
              {totalRelayed}
            </div>
            <div className="text-[10px] text-slate-500">Total Packets</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Average Hops
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono">2.8</div>
            <div className="text-[10px] text-slate-500">Per Delivery</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Packet Loss Rate
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {poorConnectivity ? '8.4%' : '1.2%'}
            </div>
            <div className="text-[10px] text-slate-500">Self-healing mesh</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Zone Coverage
            </span>
            <div className="text-xl font-bold text-cyan-300 font-mono">94%</div>
            <div className="text-[10px] text-slate-500">Sectors Alpha-Delta</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Dynamic Graph & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Primary Node Graph with dynamic packet travel */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Dynamic Rerouting Graph</h3>
              <p className="text-xs text-slate-400">
                Click any device to simulate node failure and watch packets dynamically reroute through alternate paths.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Live Packets: {activePackets.length}
            </span>
          </div>

          {/* Dynamic Graph Canvas */}
          <div className="relative h-96 w-full bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
            {/* SVG Connecting Links & Traveling Packets */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Path 1: Device A -> Device B */}
              <line
                x1="50%"
                y1="15%"
                x2="25%"
                y2="42%"
                stroke={meshNodes.find((n) => n.id === 'NODE-11A0')?.status === 'offline' ? '#ef4444' : '#0284c7'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
              {/* Path 2: Device A -> Device C */}
              <line
                x1="50%"
                y1="15%"
                x2="75%"
                y2="42%"
                stroke={meshNodes.find((n) => n.id === 'BEACON-02')?.status === 'offline' ? '#ef4444' : '#0284c7'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
              {/* Path 3: Device B -> Gateway */}
              <line
                x1="25%"
                y1="42%"
                x2="50%"
                y2="92%"
                stroke={meshNodes.find((n) => n.id === 'NODE-11A0')?.status === 'offline' ? '#ef4444' : '#10b981'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
              {/* Path 4: Device C -> Device D */}
              <line
                x1="75%"
                y1="42%"
                x2="75%"
                y2="70%"
                stroke={meshNodes.find((n) => n.id === 'DRONE-01')?.status === 'offline' ? '#ef4444' : '#0284c7'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />
              {/* Path 5: Device D -> Gateway */}
              <line
                x1="75%"
                y1="70%"
                x2="50%"
                y2="92%"
                stroke={networkConnectivity === 'OFFLINE' ? '#ef4444' : '#10b981'}
                strokeWidth="2.5"
                strokeDasharray="5 5"
              />

              {/* Reroute cross-link: Device B <-> Device D */}
              <line
                x1="25%"
                y1="42%"
                x2="75%"
                y2="70%"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />

              {/* Traveling Packet 1: Left Route */}
              {networkConnectivity !== 'OFFLINE' && (
                <circle r="4" fill="#38bdf8">
                  <animateMotion
                    path="M 500 60 L 250 160 L 500 360"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Traveling Packet 2: Right Route via Drone */}
              {networkConnectivity !== 'OFFLINE' && (
                <circle r="4" fill="#34d399">
                  <animateMotion
                    path="M 500 60 L 750 160 L 750 270 L 500 360"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </svg>

            {/* Dynamic Backbone Nodes */}
            {backboneGraph.map((node) => {
              const isOffline = node.status === 'offline';
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    const matched = meshNodes.find((n) => n.label.includes(node.label)) || meshNodes[0];
                    setSelectedNode(matched);
                  }}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      isOffline
                        ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-slate-900 border-cyan-500/80 text-cyan-300 shadow-xl group-hover:scale-110'
                    }`}
                  >
                    <Radio className="w-6 h-6" />
                  </div>

                  <div className="text-center mt-1 whitespace-nowrap">
                    <span className="text-[11px] font-bold text-white block">
                      {node.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {node.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dynamic Failover Active:</span>
              <span className="text-slate-300">
                If Device B drops offline, messages immediately reroute through Device C & D.
              </span>
            </span>
            <span className="font-mono text-emerald-400 text-[11px]">TTL: 7 Hops</span>
          </div>
        </div>

        {/* Right Column: Node Inspector & All Nodes Directory */}
        <div className="space-y-4">
          {/* Active Selected Node Card */}
          {selectedNode ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedNode.label}</h4>
                  <span className="text-[10px] text-cyan-400 font-mono">{selectedNode.id}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    selectedNode.status === 'active'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Node Type:</span>
                  <span className="font-medium text-white">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal Strength:</span>
                  <span className="font-mono text-cyan-300">{selectedNode.signalDbm} dBm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery Level:</span>
                  <span className="font-mono text-emerald-400">{selectedNode.battery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Messages Relayed:</span>
                  <span className="font-mono text-white">{selectedNode.messagesRelayed} packets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buffered In Memory:</span>
                  <span className="font-mono text-amber-400">{selectedNode.messagesStored}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Contact:</span>
                  <span className="text-slate-400 font-mono">{selectedNode.lastContact}</span>
                </div>
              </div>

              {/* Action: Toggle failure */}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => toggleNodeFailure(selectedNode.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    selectedNode.status === 'offline'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900'
                  }`}
                >
                  {selectedNode.status === 'offline' ? 'Reactivate Node' : 'Simulate Node Failure'}
                </button>

                <button
                  onClick={() => removeMeshNode(selectedNode.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Remove Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              Select any node on the graph to inspect parameters
            </div>
          )}

          {/* Node List Scrollbox */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              All Mesh Devices ({meshNodes.length})
            </h4>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {meshNodes.slice(0, 15).map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-2 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                    selectedNode?.id === node.id
                      ? 'bg-slate-800 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-slate-200 truncate">{node.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{node.id}</div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      node.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300'
                        : node.status === 'weak'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
