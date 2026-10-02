import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { DuplicateCluster } from '../types/disaster';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Navigation,
  FileText,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Shield,
  Compass,
} from 'lucide-react';

export const IncidentIntelligence: React.FC = () => {
  const {
    duplicateClusters,
    verifyDuplicateCluster,
    groupIncidentsWithAI,
    setCommandCenterTab,
    setSelectedIncident,
    incidents,
    realDisasterEvents,
  } = useDisaster();

  const [isRunningClustering, setIsRunningClustering] = useState<boolean>(false);
  const [activeClusterId, setActiveClusterId] = useState<string>(duplicateClusters[0]?.clusterId || '');
  const [successBanner, setSuccessBanner] = useState<string>('');

  const selectedCluster = duplicateClusters.find((c) => c.clusterId === activeClusterId) || duplicateClusters[0];

  const handleRunAiClustering = async () => {
    setIsRunningClustering(true);
    try {
      // Build sample of reports comparing geographic proximity, time, event type, and description
      const rawSample = [
        ...realDisasterEvents.slice(0, 3).map((ev) => ({
          id: ev.id,
          text: `${ev.title} — ${ev.details || ev.locationName}. Severity: ${ev.severity}`,
          location: ev.locationName,
          timestamp: ev.timestamp,
          eventType: ev.eventType,
          isRealData: true,
        })),
        { id: 'REP-001', text: 'Bridge near school is damaged, cars turning back with fast rising river.', location: 'Beside North Govt School', eventType: 'Flood' },
        { id: 'REP-002', text: 'The bridge beside the school has collapsed into creek, 2 vehicles stuck!', location: 'North Govt School River Road', eventType: 'Flood' },
        { id: 'REP-003', text: 'Road bridge near government school is blocked by deep mud and water.', location: 'Route 4 crossing', eventType: 'Flood' },
      ];
      await groupIncidentsWithAI(rawSample);
      setSuccessBanner('AI clustering completed: Compared geographic proximity, timestamps, event types, and semantics across live & citizen reports.');
      setTimeout(() => setSuccessBanner(''), 6000);
    } finally {
      setIsRunningClustering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
              Gemini Incident Intelligence Engine
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 font-semibold border border-blue-800">
              Deduplication Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Duplicate Incident Detection & Spatial Clustering</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Correlates incoming raw citizen reports using semantic embeddings and geographic proximity to synthesize actionable singular incidents.
          </p>
        </div>

        <button
          onClick={handleRunAiClustering}
          disabled={isRunningClustering}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/40 flex items-center gap-2 shrink-0 transition-transform active:scale-95 disabled:opacity-60"
        >
          {isRunningClustering ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Semantic Clusters...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Re-Run AI Clustering</span>
            </>
          )}
        </button>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Main Grid: Clusters List & Detailed Cluster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cluster Cards List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Detected Incident Clusters ({duplicateClusters.length})
          </div>

          {duplicateClusters.map((cluster) => {
            const isActive = cluster.clusterId === selectedCluster?.clusterId;
            return (
              <div
                key={cluster.clusterId}
                onClick={() => setActiveClusterId(cluster.clusterId)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-900 border-amber-500 shadow-xl ring-1 ring-amber-500/40'
                    : 'bg-slate-950/90 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-cyan-400">
                    {cluster.clusterId}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {cluster.reports.length} Reports Merged
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {cluster.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Proximity: ±{cluster.geographicProximityMeters}m</span>
                  <span className="text-emerald-400 font-mono text-[10px] font-medium">
                    {cluster.confidenceScore}% Match (AI Estimate)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (2 spans): Active Cluster In-Depth Inspection */}
        {selectedCluster && (
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-amber-400">
                    {selectedCluster.clusterId}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {selectedCluster.primaryCategory}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">
                    {selectedCluster.priority}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedCluster.title}
                </h3>
              </div>

              {/* Human Verification Badge / Button */}
              <div>
                {selectedCluster.verifiedByHuman ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Human Verified</span>
                  </div>
                ) : (
                  <button
                    onClick={() => verifyDuplicateCluster(selectedCluster.clusterId)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Human Verify</span>
                  </button>
                )}
              </div>
            </div>

            {/* Synthesized AI Summary Card */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Synthesized Multi-Source Assessment (AI-Generated Estimate)</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Proximity Radius: ±{selectedCluster.geographicProximityMeters}m
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {selectedCluster.synthesizedSummary}
              </p>
              <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono">
                AI Correlation Factors Evaluated: Geographic Distance (±{selectedCluster.geographicProximityMeters}m) · Timestamp Clustering · Disaster Category · Natural Language Description · Casualty Headcount.
              </div>
              <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between text-[11px] text-slate-300">
                <span className="text-slate-400 font-semibold">Recommended Dispatch Action:</span>
                <span className="text-amber-300 font-medium">
                  {selectedCluster.actionRecommended}
                </span>
              </div>
            </div>

            {/* Raw Incoming Reports List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Correlated Citizen Reports ({selectedCluster.reports.length})
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  First: {selectedCluster.firstReported} · Latest: {selectedCluster.latestUpdate}
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedCluster.reports.map((rep, idx) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400 font-mono">
                          Report #{idx + 1} ({rep.id})
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">{rep.sourceDevice}</span>
                      </div>
                      <span className="font-mono text-slate-500">{rep.time}</span>
                    </div>

                    <p className="text-slate-100 font-medium text-xs leading-relaxed">
                      "{rep.rawText}"
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      <span>{rep.reportedLocation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Estimated People Affected: <strong className="text-white">{selectedCluster.estimatedPeopleAffected}</strong>
              </span>

              <button
                onClick={() => {
                  const targetInc = incidents.find((i) => i.id.includes('1042')) || incidents[0];
                  setSelectedIncident(targetInc);
                  setCommandCenterTab('live_map');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>Inspect on Live Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
