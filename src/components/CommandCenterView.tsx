import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { CommandOverview } from './CommandOverview';
import { LiveMap } from './LiveMap';
import { IncidentsQueue } from './IncidentsQueue';
import { IncidentIntelligence } from './IncidentIntelligence';
import { ResourceCoordination } from './ResourceCoordination';
import { AiIntelligenceWorkbench } from './AiIntelligenceWorkbench';
import { MeshNetworkMonitor } from './MeshNetworkMonitor';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SecurityConsole } from './SecurityConsole';
import {
  LayoutDashboard,
  Compass,
  AlertTriangle,
  Layers,
  Truck,
  Sparkles,
  Radio,
  BarChart3,
  Shield,
  Smartphone,
} from 'lucide-react';

export const CommandCenterView: React.FC = () => {
  const { commandCenterTab, setCommandCenterTab, setActiveView } = useDisaster();

  const tabs: {
    id: typeof commandCenterTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live_map', label: 'Live Map', icon: Compass },
    { id: 'incidents', label: 'Incidents Queue', icon: AlertTriangle },
    { id: 'incident_intelligence', label: 'Incident Intelligence', icon: Layers },
    { id: 'resources', label: 'Resources', icon: Truck },
    { id: 'ai_intelligence', label: 'AI Intelligence', icon: Sparkles },
    { id: 'network_monitor', label: 'Mesh Network', icon: Radio },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Command Center Sub-navigation Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = commandCenterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCommandCenterTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-950 text-cyan-300 border border-cyan-800/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="shrink-0 hidden md:block">
            <button
              onClick={() => setActiveView('citizen')}
              className="text-xs font-semibold text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Citizen Device</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Selected Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {commandCenterTab === 'overview' && <CommandOverview />}
        {commandCenterTab === 'live_map' && <LiveMap />}
        {commandCenterTab === 'incidents' && <IncidentsQueue />}
        {commandCenterTab === 'incident_intelligence' && <IncidentIntelligence />}
        {commandCenterTab === 'resources' && <ResourceCoordination />}
        {commandCenterTab === 'ai_intelligence' && <AiIntelligenceWorkbench />}
        {commandCenterTab === 'network_monitor' && <MeshNetworkMonitor />}
        {commandCenterTab === 'analytics' && <AnalyticsDashboard />}
        {commandCenterTab === 'security' && <SecurityConsole />}
      </main>
    </div>
  );
};
