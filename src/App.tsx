import React, { useEffect } from 'react';
import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CitizenMobileApp } from './components/CitizenMobileApp';
import { CommandCenterView } from './components/CommandCenterView';

function AppContent() {
  const { activeView, setActiveView, setCommandCenterTab } = useDisaster();

  // Keyboard shortcuts for command-center operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '1') {
        setActiveView('landing');
      } else if (e.key === '2') {
        setActiveView('citizen');
      } else if (e.key === '3') {
        setActiveView('command_center');
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveView('command_center');
        setCommandCenterTab('live_map');
      } else if (e.key === 'n' || e.key === 'N') {
        setActiveView('command_center');
        setCommandCenterTab('network_monitor');
      } else if (e.key === 'i' || e.key === 'I') {
        setActiveView('command_center');
        setCommandCenterTab('incidents');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, setCommandCenterTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <div className="flex-1 flex flex-col">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'citizen' && <CitizenMobileApp />}
        {activeView === 'command_center' && <CommandCenterView />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DisasterProvider>
      <AppContent />
    </DisasterProvider>
  );
}
