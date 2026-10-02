import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Incident, IncidentPriority, IncidentStatus, RealDisasterEvent } from '../types/disaster';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Compass,
  Send,
  UserCheck,
  Shield,
  Clock,
  ChevronDown,
  Globe,
  ExternalLink,
  MapPin,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';

export const IncidentsQueue: React.FC = () => {
  const {
    incidents,
    updateIncidentPriority,
    updateIncidentStatus,
    verifyIncident,
    setSelectedIncident,
    setCommandCenterTab,
    realDisasterEvents,
    liveDataStatus,
    lastDataRefreshTime,
    isRefreshingLiveData,
    refreshLiveData,
    setSelectedRealEvent,
    liveDataErrorMessage,
  } = useDisaster();

  // Tab: Real External Disasters vs Local Simulated Reports
  const [activeQueueTab, setActiveQueueTab] = useState<'REAL_FEED' | 'SIMULATED_REPORTS'>('REAL_FEED');

  const [search, setSearch] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered Simulated Incidents
  const filteredSimulated = incidents.filter((inc) => {
    if (priorityFilter !== 'ALL' && inc.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Real Disaster Events
  const filteredReal = realDisasterEvents.filter((ev) => {
    if (priorityFilter !== 'ALL' && ev.severity !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.locationName.toLowerCase().includes(q) ||
        ev.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityStyle = (p: IncidentPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-800/80';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      case 'LOW':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Data Source Separation Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Emergency Dispatch Ledger
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono border border-slate-700">
                Last Sync: {lastDataRefreshTime}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Incident Queue & Crisis Ingest</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unified emergency dashboard separating verified live public feeds from local mesh simulation packets.
            </p>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={() => refreshLiveData()}
            disabled={isRefreshingLiveData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold shadow-md transition-colors self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLiveData ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshingLiveData ? 'Fetching Live Feeds...' : 'Refresh Live Data'}</span>
          </button>
        </div>

        {/* Tab Switcher: Real Feed vs Simulated Reports */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveQueueTab('REAL_FEED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeQueueTab === 'REAL_FEED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-md shadow-emerald-950/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🟢 Real Disaster Events ({realDisasterEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveQueueTab('SIMULATED_REPORTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeQueueTab === 'SIMULATED_REPORTS'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-md shadow-amber-950/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🟡 Simulated Citizen Reports ({incidents.length})</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex items-center min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeQueueTab === 'REAL_FEED'
                    ? 'Search real earthquakes, storms, location...'
                    : 'Search simulated incidents, ID, or address...'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            {activeQueueTab === 'REAL_FEED' ? (
              <span>Showing {filteredReal.length} of {realDisasterEvents.length} Live Feeds</span>
            ) : (
              <span>Showing {filteredSimulated.length} of {incidents.length} Simulated Records</span>
            )}
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: REAL DISASTER EVENTS (USGS & NOAA) */}
      {activeQueueTab === 'REAL_FEED' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {liveDataStatus === 'UNAVAILABLE' ? (
            <div className="p-8 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">
                Live data is currently unavailable. Showing simulation data.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The public meteorological and earthquake endpoints are currently unreachable. You can continue training and testing emergency dispatch using the simulated mesh queue.
              </p>
              <button
                onClick={() => refreshLiveData()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : filteredReal.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No live disaster alerts match your search or filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Event & Type</th>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Location & Coordinates</th>
                    <th className="py-3.5 px-4">Magnitude / Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Official Source</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredReal.map((ev) => (
                    <tr
                      key={ev.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedRealEvent(ev);
                        setCommandCenterTab('live_map');
                      }}
                    >
                      {/* Event & Type */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                          <span className="text-sm">
                            {ev.eventType === 'Earthquake' ? '💥' : ev.eventType === 'Flood' ? '🌊' : '⛈️'}
                          </span>
                          <span>{ev.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {ev.id} · {ev.eventType}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(ev.severity)}`}>
                          {ev.severity}
                        </span>
                      </td>

                      {/* Location & Coordinates */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{ev.locationName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {ev.latitude.toFixed(4)}° N, {ev.longitude.toFixed(4)}° E
                        </div>
                      </td>

                      {/* Magnitude / Status */}
                      <td className="py-3.5 px-4 font-mono">
                        {ev.magnitude ? (
                          <span className="text-cyan-300 font-bold">Mag: {ev.magnitude}</span>
                        ) : (
                          <span className="text-slate-400">{ev.status}</span>
                        )}
                        {ev.tsunamiWarning && (
                          <span className="block text-[9px] text-rose-400 font-bold uppercase">
                            ⚠ Tsunami Watch
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="block text-[9px] text-slate-500">
                          {new Date(ev.timestamp).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-medium block text-[11px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{ev.source.split('(')[0]}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Verified Public Feed</span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRealEvent(ev);
                              setCommandCenterTab('live_map');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center gap-1"
                            title="Inspect on interactive map"
                          >
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            <span>Map</span>
                          </button>

                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Open official agency bulletin"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: SIMULATED CITIZEN INCIDENT REPORTS */}
      {activeQueueTab === 'SIMULATED_REPORTS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-2">
          {/* Simulated Disclaimer */}
          <div className="p-3 bg-amber-950/40 border-b border-amber-800/60 text-xs text-amber-200/90 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>🟡 DEMO/SIMULATION INCIDENTS: Modeled for emergency procedure training.</span>
            </span>
            <span className="text-[11px] text-amber-300 font-semibold">Simulated Sector Drill</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Incident ID</th>
                  <th className="py-3.5 px-4">Title & Classification</th>
                  <th className="py-3.5 px-4">Priority (AI + Override)</th>
                  <th className="py-3.5 px-4">Location / Sector</th>
                  <th className="py-3.5 px-4">Headcount</th>
                  <th className="py-3.5 px-4">Assigned Unit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredSimulated.map((inc) => (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedIncident(inc);
                      setCommandCenterTab('live_map');
                    }}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {inc.id}
                    </td>

                    {/* Title & Classification */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {inc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {inc.emergencyType} · Reported {inc.firstReportedAt}
                      </div>
                      <div className="text-[10px] text-cyan-400/90 mt-1 line-clamp-1 italic">
                        "{inc.aiTriageSummary}"
                      </div>
                    </td>

                    {/* Priority Selector */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={inc.priority}
                        onChange={(e) =>
                          updateIncidentPriority(inc.id, e.target.value as IncidentPriority)
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getPriorityStyle(
                          inc.priority
                        )}`}
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {inc.locationName}
                    </td>

                    {/* Headcount */}
                    <td className="py-3.5 px-4 font-mono text-cyan-300 font-semibold">
                      {inc.peopleAffected} People
                    </td>

                    {/* Assigned Unit */}
                    <td className="py-3.5 px-4">
                      {inc.assignedResourceName ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{inc.assignedResourceName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None Dispatched</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-amber-400">{inc.status}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setCommandCenterTab('live_map');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
