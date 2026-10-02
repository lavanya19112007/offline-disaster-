import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { EmergencyResource, ResourceType, ResourceStatus, EmergencyFacility } from '../types/disaster';
import {
  Compass,
  Battery,
  Shield,
  Send,
  Navigation,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Building2,
  Zap,
  Phone,
  MapPin,
  ExternalLink,
  Layers,
  HeartPulse,
} from 'lucide-react';

export const ResourceCoordination: React.FC = () => {
  const {
    resources,
    incidents,
    assignResource,
    setCommandCenterTab,
    setSelectedIncident,
    realEmergencyFacilities,
  } = useDisaster();

  // Tab: Verified Real Facilities vs Simulated Fleet Units
  const [resourceViewTab, setResourceViewTab] = useState<'VERIFIED_FACILITIES' | 'SIMULATED_FLEET'>('VERIFIED_FACILITIES');

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Assignment Modal
  const [assignModalResource, setAssignModalResource] = useState<EmergencyResource | null>(null);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');

  const filteredResources = resources.filter((res) => {
    if (typeFilter !== 'ALL' && res.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && res.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.coordinates.sector.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredFacilities = realEmergencyFacilities.filter((fac) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        fac.name.toLowerCase().includes(q) ||
        fac.address.toLowerCase().includes(q) ||
        fac.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusStyle = (status: ResourceStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80';
      case 'EN ROUTE':
        return 'text-cyan-300 bg-cyan-950/60 border-cyan-800/80 animate-pulse';
      case 'BUSY':
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80';
      case 'OFFLINE':
        return 'text-rose-300 bg-rose-950/60 border-rose-800/80';
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'Rescue Boat':
        return '🚤';
      case 'Ambulance':
        return '🚑';
      case 'Medical Team':
        return '🩺';
      case 'Food Supplies':
        return '🍞';
      case 'Water Tanker':
        return '💧';
      case 'Shelter':
        return '🏠';
      case 'Rescue Personnel':
        return '🛡️';
    }
  };

  const handleConfirmAssignment = () => {
    if (assignModalResource && targetIncidentId) {
      assignResource(assignModalResource.id, targetIncidentId);
      setAssignModalResource(null);
      setTargetIncidentId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Emergency Logistics & Infrastructure
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Emergency Facilities & Resource Fleet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Differentiates verified public emergency infrastructure from simulated disaster response units.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setResourceViewTab('VERIFIED_FACILITIES')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              resourceViewTab === 'VERIFIED_FACILITIES'
                ? 'bg-sky-950 text-sky-300 border border-sky-700 shadow-md shadow-sky-950/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🟢 Verified Facilities ({realEmergencyFacilities.length})</span>
          </button>

          <button
            onClick={() => setResourceViewTab('SIMULATED_FLEET')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              resourceViewTab === 'SIMULATED_FLEET'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-md shadow-amber-950/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🟡 Simulation Fleet ({resources.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: VERIFIED REAL EMERGENCY FACILITIES */}
      {resourceViewTab === 'VERIFIED_FACILITIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>🟢 VERIFIED FROM EXTERNAL DATA (OpenStreetMap Emergency Services)</span>
            </span>
            <span>Real Geographic Locations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {fac.type === 'Hospital' ? '🏥' : fac.type === 'Fire Station' ? '🚒' : '🏛️'}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{fac.name}</h4>
                        <span className="text-[10px] text-cyan-400 font-mono">{fac.type}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                      {fac.operationalStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{fac.address}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Coordinates:</span>
                      <span className="text-slate-200">{fac.latitude.toFixed(4)}° N, {fac.longitude.toFixed(4)}° W</span>
                    </div>
                    {fac.phone && (
                      <div className="flex justify-between text-slate-400">
                        <span>Emergency Line:</span>
                        <span className="text-cyan-300">{fac.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900">
                      <span>Generator Backup:</span>
                      <span className="text-emerald-400 font-bold">{fac.generatorPower ? 'YES (ONLINE)' : 'NO'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Solar Microgrid:</span>
                      <span className={fac.solarMicrogrid ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {fac.solarMicrogrid ? 'ACTIVE HUB' : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono">Verified from external data</span>
                  <button
                    onClick={() => setCommandCenterTab('live_map')}
                    className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SIMULATED RESPONSE FLEET */}
      {resourceViewTab === 'SIMULATED_FLEET' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>🟡 DEMO/SIMULATION LOCATIONS & RESPONSE UNITS (Sector Drill)</span>
            </span>
            <span>Simulated Sector Alpha-Delta</span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex items-center min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fleet units or equipment..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Resource Types</option>
                <option value="Rescue Boat">Rescue Boats</option>
                <option value="Ambulance">Ambulances</option>
                <option value="Medical Team">Medical Teams</option>
                <option value="Rescue Personnel">Search & Rescue Squads</option>
                <option value="Water Tanker">Water Tankers</option>
                <option value="Food Supplies">Ration Trucks</option>
                <option value="Shelter">Shelters</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="EN ROUTE">EN ROUTE</option>
                <option value="BUSY">BUSY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            <div className="text-slate-400 font-mono text-[11px]">
              {filteredResources.length} Units Listed
            </div>
          </div>

          {/* Resources Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getResourceIcon(res.type)}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">{res.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {res.id} · {res.type}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${getStatusStyle(
                        res.status
                      )}`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sector:</span>
                      </span>
                      <span className="font-mono text-slate-200">{res.coordinates.sector}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        <span>Personnel:</span>
                      </span>
                      <span className="font-mono text-slate-200">{res.personnelCount} Responders</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Fuel / Battery:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          res.batteryOrFuel > 50
                            ? 'text-emerald-400'
                            : res.batteryOrFuel > 25
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {res.batteryOrFuel}%
                      </span>
                    </div>

                    {res.assignedIncidentTitle && (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase font-mono">
                          Current Assignment:
                        </span>
                        <span className="font-medium text-cyan-300 line-clamp-1">
                          {res.assignedIncidentTitle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-amber-400 font-mono">Demo/Simulation unit</span>
                  <button
                    onClick={() => {
                      setAssignModalResource(res);
                      setTargetIncidentId(incidents[0]?.id || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors"
                  >
                    Assign Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignModalResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Assign {assignModalResource.name}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 block">Select Target Incident Ticket:</label>
              <select
                value={targetIncidentId}
                onChange={(e) => setTargetIncidentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    [{inc.priority}] {inc.id} — {inc.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setAssignModalResource(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
