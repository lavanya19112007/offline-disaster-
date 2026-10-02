import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import {
  AlertTriangle,
  Users,
  ShieldAlert,
  Radio,
  WifiOff,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Compass,
  Send,
  Play,
  Pause,
  RotateCcw,
  Globe,
  RefreshCw,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const CommandOverview: React.FC = () => {
  const {
    incidents,
    resources,
    simulationStats,
    simulationRunning,
    toggleSimulation,
    restartSimulation,
    setCommandCenterTab,
    setSelectedIncident,
    realDisasterEvents,
    liveDataStatus,
    lastDataRefreshTime,
    refreshLiveData,
    isRefreshingLiveData,
    setSelectedRealEvent,
  } = useDisaster();

  // Animated numbers effect
  const [counts, setCounts] = useState({
    critical: 0,
    active: 0,
    people: 0,
    teams: 0,
    offline: 0,
    sync: 0,
  });

  useEffect(() => {
    // Target metrics
    const target = {
      critical: 37,
      active: 124,
      people: 82,
      teams: 18,
      offline: 247,
      sync: 63,
    };

    let start = 0;
    const duration = 1200; // ms
    const stepTime = 30;
    const steps = duration / stepTime;

    const timer = setInterval(() => {
      start++;
      const progress = Math.min(1, start / steps);
      setCounts({
        critical: Math.round(target.critical * progress),
        active: Math.round(target.active * progress),
        people: Math.round(target.people * progress),
        teams: Math.round(target.teams * progress),
        offline: Math.round(target.offline * progress),
        sync: Math.round(target.sync * progress),
      });

      if (progress >= 1) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const criticalIncidents = incidents
    .filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Ticker & Active Simulation Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Sector Disaster Command HQ
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-semibold border border-rose-800">
                LEVEL 4 DISASTER RESPONSE
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              Multi-Agency Emergency Coordination Center
            </h2>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 text-xs">
          <div className="px-2 text-slate-400 font-mono text-[11px] hidden lg:block">
            <span>Sim: {simulationRunning ? 'RUNNING' : 'PAUSED'}</span>
          </div>
          <button
            onClick={toggleSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            {simulationRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resume</span>
              </>
            )}
          </button>
          <button
            onClick={restartSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Feed</span>
          </button>
        </div>
      </div>

      {/* Real Disaster Feeds KPI & Live Ticker */}
      <div className="bg-slate-900/90 border border-cyan-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-sm text-white">Live Public Disaster Feeds</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-800">
              🟢 LIVE DATA (USGS / NOAA)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Synced: {lastDataRefreshTime}</span>
            <button
              onClick={() => refreshLiveData()}
              disabled={isRefreshingLiveData}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 text-xs transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingLiveData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Real Events Carousel / Cards */}
        {realDisasterEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {realDisasterEvents.slice(0, 3).map((ev) => (
              <div
                key={ev.id}
                onClick={() => {
                  setSelectedRealEvent(ev);
                  setCommandCenterTab('live_map');
                }}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1 truncate pr-1">
                    <span>{ev.eventType === 'Earthquake' ? '💥' : ev.eventType === 'Flood' ? '🌊' : '⛈️'}</span>
                    <span className="truncate">{ev.title}</span>
                  </span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 shrink-0">
                    {ev.severity}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{ev.locationName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                  <span>{ev.source.split('(')[0]}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:underline">
                    <span>View Map</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-2 text-center">
            {liveDataStatus === 'UNAVAILABLE'
              ? 'Live disaster information is temporarily unavailable. Showing simulation data.'
              : 'Connecting to live USGS and NOAA disaster feeds...'}
          </div>
        )}
      </div>

      {/* Notice of Separation */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>🟡 LOCAL DISASTER SECTOR SIMULATION (Research & Training Scenario)</span>
        </span>
        <span className="text-[11px] text-slate-500">Sectors Alpha - Delta</span>
      </div>

      {/* 6 Key KPI Dashboard Cards with Animated Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Critical Incidents */}
        <div className="bg-slate-900/80 border border-rose-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-rose-400 mb-2">
            <span className="font-semibold">Critical Incidents</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.critical}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Immediate Life Risk</span>
          </div>
        </div>

        {/* Card 2: Active Emergencies */}
        <div className="bg-slate-900/80 border border-orange-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-orange-400 mb-2">
            <span className="font-semibold">Active Emergencies</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.active}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 4 sectors</div>
        </div>

        {/* Card 3: People Awaiting Rescue */}
        <div className="bg-slate-900/80 border border-amber-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
            <span className="font-semibold">Awaiting Rescue</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.people}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Civilians trapped/stranded</div>
        </div>

        {/* Card 4: Available Response Teams */}
        <div className="bg-slate-900/80 border border-emerald-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 mb-2">
            <span className="font-semibold">Response Teams</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.teams}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Ready for deployment</div>
        </div>

        {/* Card 5: Offline Devices */}
        <div className="bg-slate-900/80 border border-cyan-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-cyan-400 mb-2">
            <span className="font-semibold">Offline Devices</span>
            <WifiOff className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.offline}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1">Operating in mesh mode</div>
        </div>

        {/* Card 6: Messages Awaiting Sync */}
        <div className="bg-slate-900/80 border border-blue-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
            <span className="font-semibold">Pending Uplink</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {counts.sync}
          </div>
          <div className="text-[11px] text-blue-400/80 mt-1">In peer hops queue</div>
        </div>
      </div>

      {/* Main Grid: Priority Incident Queue & Readiness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Critical Incidents Needing Immediate Action */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Critical Priority Incident Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-ranked by life safety hazard and accessibility constraints. Requires human verification.
              </p>
            </div>

            <button
              onClick={() => setCommandCenterTab('incidents')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All 32</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {criticalIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIncident(inc);
                  setCommandCenterTab('live_map');
                }}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-900/90 group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-mono text-xs font-bold text-rose-400">
                      {inc.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {inc.emergencyType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {inc.peopleAffected} People
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {inc.firstReportedAt}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
                  {inc.title}
                </h4>

                <p className="text-xs text-slate-400 mb-3">{inc.locationName}</p>

                {/* AI Triage Snippet */}
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px]">{inc.aiTriageSummary}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono shrink-0 ml-2">
                    {inc.aiConfidence}% Conf
                  </span>
                </div>

                {/* Status footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Status: <span className="text-cyan-400 font-medium">{inc.status}</span>
                  </span>

                  <span className="text-xs text-cyan-400 font-semibold group-hover:underline flex items-center gap-1">
                    <span>Inspect on Live Map</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fleet Readiness & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Dispatch Readiness */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Resource Fleet Status</span>
              </h3>
              <button
                onClick={() => setCommandCenterTab('resources')}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { type: 'Rescue Boats', available: 3, total: 4, icon: '🚤' },
                { type: '4x4 Ambulances', available: 3, total: 4, icon: '🚑' },
                { type: 'Field Medical Units', available: 2, total: 3, icon: '🏥' },
                { type: 'Search & Rescue Squads', available: 3, total: 4, icon: '🛡️' },
                { type: 'Potable Water Tankers', available: 1, total: 2, icon: '💧' },
                { type: 'Disaster Shelters', available: 9, total: 10, icon: '🏠' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium text-slate-200">{item.type}</span>
                  </div>
                  <div className="font-mono">
                    <span className="text-emerald-400 font-bold">{item.available}</span>
                    <span className="text-slate-500"> / {item.total} Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Intelligence Cluster Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>AI Duplicate Clusters</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                3 Groups
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-cyan-300 font-bold font-mono">
                <span>INCIDENT #1042</span>
                <span className="text-[10px] text-amber-400">3 Reports Merged</span>
              </div>
              <h4 className="font-semibold text-white">School Bridge Structural Collapse</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                3 converging citizen reports identified cracked crossing structure with flood debris.
              </p>
              <button
                onClick={() => setCommandCenterTab('incident_intelligence')}
                className="w-full mt-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs transition-colors"
              >
                Review & Certify Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
