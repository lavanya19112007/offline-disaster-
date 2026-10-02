import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { UserRole } from '../types/disaster';
import {
  Radio,
  Wifi,
  WifiOff,
  Shield,
  Activity,
  Smartphone,
  LayoutDashboard,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Globe,
  Database,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    userRole,
    setUserRole,
    activeView,
    setActiveView,
    networkConnectivity,
    simulateNetworkFailure,
    restoreNetwork,
    simulationRunning,
    toggleSimulation,
    restartSimulation,
    simulationStats,
    liveDataStatus,
    lastDataRefreshTime,
    isRefreshingLiveData,
    refreshLiveData,
    realDisasterEvents,
    activeDataFilter,
    setActiveDataFilter,
    liveDataErrorMessage,
  } = useDisaster();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top micro-bar: Live Data Status vs Simulation Separation & Transparency */}
      <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Data Status Indicator */}
          {liveDataStatus === 'LIVE' ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono text-[11px] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">🟢 LIVE DATA</span>
              <span className="text-emerald-400/80 hidden sm:inline">
                ({realDisasterEvents.length} Official USGS / NOAA Events)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/80 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="font-bold">🔴 DATA UNAVAILABLE</span>
              <span className="text-rose-400 hidden sm:inline">({liveDataErrorMessage || 'Simulation Fallback'})</span>
            </div>
          )}

          {/* Simulation Separation Notice */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>🟡 Mesh Radio Hops: In-Browser Simulation</span>
          </div>

          <span className="text-slate-700 hidden md:inline">|</span>

          {/* Last Updated Time */}
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <span>Last updated:</span>
            <strong className="text-slate-200">{lastDataRefreshTime}</strong>
          </span>

          {/* Refresh Live Data Button */}
          <button
            onClick={() => refreshLiveData()}
            disabled={isRefreshingLiveData}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            title="Fetch latest disaster information from USGS and NOAA"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingLiveData ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshingLiveData ? 'Updating...' : 'Refresh Live Data'}</span>
          </button>
        </div>

        {/* Right side: Simulation Clock & Filter Toggle */}
        <div className="flex items-center gap-2">
          {/* Data Filter Selector */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5 text-[10px] font-semibold">
            <button
              onClick={() => setActiveDataFilter('ALL')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeDataFilter === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setActiveDataFilter('LIVE_ONLY')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeDataFilter === 'LIVE_ONLY'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              🟢 Live Only
            </button>
            <button
              onClick={() => setActiveDataFilter('SIMULATED_ONLY')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeDataFilter === 'SIMULATED_ONLY'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              🟡 Simulation Only
            </button>
          </div>

          <button
            onClick={toggleSimulation}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={simulationRunning ? 'Pause simulation clock' : 'Resume simulation clock'}
          >
            {simulationRunning ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Resume</span>
              </>
            )}
          </button>
          <button
            onClick={restartSimulation}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Restart disaster simulation"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40 group-hover:border-cyan-400 transition-colors">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                ResQMesh
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                v2.4 Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Offline Disaster Comms & AI Triage
            </p>
          </div>
        </div>

        {/* Primary View Switcher tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'landing'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveView('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'citizen'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Citizen App</span>
          </button>

          <button
            onClick={() => setActiveView('command_center')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeView === 'command_center'
                ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>
        </nav>

        {/* Controls & Network Failure Simulation */}
        <div className="flex items-center gap-3">
          {/* Network State & Simulate Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (networkConnectivity === 'ONLINE') {
                  simulateNetworkFailure();
                } else {
                  restoreNetwork();
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                networkConnectivity === 'ONLINE'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                  : networkConnectivity === 'LIMITED'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/80 animate-pulse hover:bg-rose-900/80'
              }`}
              title="Click to toggle network failure simulation"
            >
              {networkConnectivity === 'ONLINE' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden lg:inline">ONLINE</span>
                  <span className="text-[10px] text-slate-400 hidden xl:inline">
                    (Simulate Cut)
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden lg:inline">OFFLINE MODE</span>
                  <span className="text-[10px] text-emerald-400 font-semibold underline hidden xl:inline">
                    (Restore)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left hidden md:block">
                <span className="text-[10px] text-slate-400 block leading-none">Role</span>
                <span className="font-semibold text-slate-200">{userRole}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                  Switch Active Role
                </div>
                {(['Citizen', 'Responder', 'Coordinator', 'Administrator'] as UserRole[]).map(
                  (role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setUserRole(role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        userRole === role ? 'text-cyan-300 font-semibold bg-slate-800/60' : 'text-slate-300'
                      }`}
                    >
                      <span>{role}</span>
                      {userRole === role && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
