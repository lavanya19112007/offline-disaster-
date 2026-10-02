import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { EmergencyType, IncidentPriority, EmergencyMessage } from '../types/disaster';
import {
  AlertOctagon,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Zap,
  ZapOff,
  Navigation,
  Radio,
  Clock,
  CheckCircle2,
  Send,
  Shield,
  Layers,
  Sparkles,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Mic,
  Volume2,
  Info,
  Maximize2,
  Minimize2,
  Share2,
  TrendingDown,
  Activity,
  Plug,
  MapPin,
  AlertCircle,
  X,
  VolumeX,
  Bell,
} from 'lucide-react';

interface SimulatedMeshHop {
  id: string;
  name: string;
  signal: string;
  battery: number;
  hops: number;
  stored: number;
  lastContact: string;
  status: 'active' | 'relaying' | 'gateway';
}

export const CitizenMobileApp: React.FC = () => {
  const {
    networkConnectivity,
    simulateNetworkFailure,
    restoreNetwork,
    citizenMessages,
    createEmergencyReport,
    setActiveView,
    setCommandCenterTab,
    parseMultilingualVoice,
    citizenBattery,
    setCitizenBattery,
    powerSavingMode,
    setPowerSavingMode,
    togglePowerSavingMode,
    ultraLowPowerMode,
    setUltraLowPowerMode,
    toggleUltraLowPowerMode,
    meshPollingIntervalMs,
    realUserLocation,
    requestRealUserLocation,
    locationPermissionStatus,
  } = useDisaster();

  // Mobile frame simulator toggle
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  // Active Tab inside Mobile App: 'sos' | 'messages' | 'mesh' | 'voice'
  const [mobileTab, setMobileTab] = useState<'sos' | 'messages' | 'mesh' | 'voice'>('sos');

  // Battery simulator popover & hover state
  const [batteryMenuOpen, setBatteryMenuOpen] = useState<boolean>(false);
  const [batteryHoverIndex, setBatteryHoverIndex] = useState<number | null>(null);

  // Dynamic Critical Battery Warning Modal (< 10%) & Audio Chime
  const [criticalBatteryModalOpen, setCriticalBatteryModalOpen] = useState<boolean>(false);
  const [hasDismissedCriticalWarning, setHasDismissedCriticalWarning] = useState<boolean>(false);
  const [chimeSoundEnabled, setChimeSoundEnabled] = useState<boolean>(true);

  // Synthesizes an audible emergency chime via Web Audio API (no external file dependencies)
  const playCriticalBatteryChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Triple descending alert chime sequence: A5 (880Hz) -> F5 (698Hz) -> C5 (523Hz)
      const chimeNotes = [
        { freq: 880, start: 0.0, duration: 0.16 },
        { freq: 698.46, start: 0.2, duration: 0.16 },
        { freq: 523.25, start: 0.4, duration: 0.38 },
      ];

      chimeNotes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

        // Smooth volume envelope to prevent clipping/clicking
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      });
    } catch (err) {
      console.warn('Audio chime playback error:', err);
    }
  };

  // Dynamic trigger: Automatically opens when simulated battery drops below 10% and plays audible chime
  useEffect(() => {
    if (citizenBattery < 10 && !hasDismissedCriticalWarning) {
      setCriticalBatteryModalOpen(true);
      if (chimeSoundEnabled) {
        playCriticalBatteryChime();
      }
    } else if (citizenBattery >= 10) {
      setHasDismissedCriticalWarning(false);
      setCriticalBatteryModalOpen(false);
    }
  }, [citizenBattery, hasDismissedCriticalWarning, chimeSoundEnabled]);

  // 24-hour battery consumption history
  const batteryTrendData = [
    { hour: '24h ago', pct: 98, x: 14, note: 'Normal LTE standby' },
    { hour: '18h ago', pct: 91, x: 65, note: 'Wi-Fi Direct peer beacon' },
    { hour: '12h ago', pct: 83, x: 118, note: 'Periodic BLE mesh ping' },
    { hour: '6h ago', pct: 60, x: 170, note: 'Cell tower blackout (high search drain)' },
    { hour: '3h ago', pct: Math.min(88, Math.max(citizenBattery + 12, 32)), x: 220, note: 'Relayed 14 peer packets' },
    { hour: 'Now', pct: citizenBattery, x: 266, note: powerSavingMode ? 'Power Saver: discovery throttled to 10s' : 'Standard mesh duty cycle' },
  ];

  // SOS Creation state
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<EmergencyType>('Medical Emergency');
  const [selectedPriority, setSelectedPriority] = useState<IncidentPriority>('CRITICAL');
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastCreatedMsg, setLastCreatedMsg] = useState<EmergencyMessage | null>(null);

  // Selected mesh hop node inside offline view
  const [selectedHopNode, setSelectedHopNode] = useState<SimulatedMeshHop | null>(null);
  const [signalHoverIndex, setSignalHoverIndex] = useState<number | null>(null);

  // 1-hour signal strength fluctuation history generator for each node
  const getSignalTrendForNode = (nodeId: string) => {
    switch (nodeId) {
      case 'NODE-MY-DEVICE':
        return [
          { time: '-60m', dbm: -47, x: 16, note: 'Local loopback transceiver' },
          { time: '-50m', dbm: -48, x: 58, note: 'Internal BLE radio stable' },
          { time: '-40m', dbm: -46, x: 100, note: 'Stable thermal baseline' },
          { time: '-30m', dbm: -49, x: 142, note: 'Background task RF burst' },
          { time: '-20m', dbm: -47, x: 184, note: 'Zero RF interference' },
          { time: '-10m', dbm: -48, x: 226, note: 'Peer discovery ping' },
          { time: 'Now', dbm: -48, x: 266, note: 'Optimal local transceive' },
        ];
      case 'NODE-228F':
        return [
          { time: '-60m', dbm: -58, x: 16, note: 'Direct line-of-sight BLE' },
          { time: '-50m', dbm: -62, x: 58, note: 'Minor wall obstruction' },
          { time: '-40m', dbm: -71, x: 100, note: 'Device carried indoors' },
          { time: '-30m', dbm: -77, x: 142, note: 'Storm rain scatter dip' },
          { time: '-20m', dbm: -69, x: 184, note: 'Placed phone beside window' },
          { time: '-10m', dbm: -64, x: 226, note: 'Signal stabilizing' },
          { time: 'Now', dbm: -65, x: 266, note: 'Stable BLE 5.2 link' },
        ];
      case 'DRONE-01':
        return [
          { time: '-60m', dbm: -65, x: 16, note: 'Drone ascent to 45m' },
          { time: '-50m', dbm: -68, x: 58, note: 'Steady hovering tether' },
          { time: '-40m', dbm: -74, x: 100, note: 'Wind gust oscillation (28 km/h)' },
          { time: '-30m', dbm: -81, x: 142, note: 'Antenna orientation yaw' },
          { time: '-20m', dbm: -75, x: 184, note: 'Gimbal stabilized' },
          { time: '-10m', dbm: -71, x: 226, note: 'Clear airborne line-of-sight' },
          { time: 'Now', dbm: -72, x: 266, note: 'Wi-Fi Direct repeater active' },
        ];
      case 'GATEWAY-02':
      default:
        return [
          { time: '-60m', dbm: -59, x: 16, note: 'Dishy phased array acquire' },
          { time: '-50m', dbm: -52, x: 58, note: 'High elevation satellite lock' },
          { time: '-40m', dbm: -54, x: 100, note: 'Clean atmospheric window' },
          { time: '-30m', dbm: -63, x: 142, note: 'Dense rain cloud pass' },
          { time: '-20m', dbm: -56, x: 184, note: 'Beam handoff to adjacent sat' },
          { time: '-10m', dbm: -53, x: 226, note: 'Sub-60ms gateway ping' },
          { time: 'Now', dbm: -54, x: 266, note: 'Reliable Starlink uplink' },
        ];
    }
  };

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceResult, setVoiceResult] = useState<any | null>(null);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState<boolean>(false);

  // Web Speech Recognition for Real Live Voice Dictation
  const recognitionRef = useRef<any>(null);
  const [speechApiSupported, setSpeechApiSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        setSpeechApiSupported(true);
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript;
          }
          setVoiceTranscript(text);
        };

        rec.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleStartSpeech = () => {
    setIsRecording(true);
    setVoiceTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const handleStopSpeech = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Speech stop error:', err);
      }
    }
    setTimeout(() => {
      setVoiceTranscript((prev) => {
        if (prev && prev.trim()) {
          handlePresetVoice(prev, 'auto');
        }
        return prev;
      });
    }, 400);
  };

  const emergencyOptions: { type: EmergencyType; label: string; defaultPriority: IncidentPriority; icon: string }[] = [
    { type: 'Medical Emergency', label: 'Medical Emergency', defaultPriority: 'CRITICAL', icon: '🚑' },
    { type: 'Trapped Person', label: 'Trapped Person', defaultPriority: 'CRITICAL', icon: '🏚️' },
    { type: 'Flood', label: 'Rising Floodwaters', defaultPriority: 'HIGH', icon: '🌊' },
    { type: 'Fire', label: 'Active Fire / Explosion', defaultPriority: 'CRITICAL', icon: '🔥' },
    { type: 'Need Food/Water', label: 'Need Food / Water', defaultPriority: 'HIGH', icon: '🍞' },
    { type: 'Other', label: 'Other Danger / Hazard', defaultPriority: 'MEDIUM', icon: '⚠️' },
  ];

  const meshHops: SimulatedMeshHop[] = [
    {
      id: 'NODE-MY-DEVICE',
      name: 'My Device (Origin)',
      signal: '-48 dBm (Local)',
      battery: citizenBattery,
      hops: 0,
      stored: powerSavingMode ? 0 : 2,
      lastContact: 'Active now',
      status: 'active',
    },
    {
      id: 'NODE-228F',
      name: 'Nearby Neighbor Phone',
      signal: '-65 dBm (BLE 5.2)',
      battery: 64,
      hops: 1,
      stored: 5,
      lastContact: '2s ago',
      status: 'relaying',
    },
    {
      id: 'DRONE-01',
      name: 'Tethered Drone Repeater',
      signal: '-72 dBm (Wi-Fi Direct)',
      battery: 84,
      hops: 2,
      stored: 18,
      lastContact: 'Just now',
      status: 'relaying',
    },
    {
      id: 'GATEWAY-02',
      name: 'Starlink Field Gateway',
      signal: '-54 dBm (Satellite Uplink)',
      battery: 95,
      hops: 3,
      stored: 0,
      lastContact: 'Synced',
      status: 'gateway',
    },
  ];

  const handleSendSos = async () => {
    setIsSubmitting(true);
    try {
      const locationText = realUserLocation
        ? `Real Device GPS: ${realUserLocation.lat}° N, ${realUserLocation.lng}° W (±${realUserLocation.accuracyMeters}m)`
        : 'Simulated GPS: 34.0522° N, 118.2437° W (Sector Bravo)';

      const coords = realUserLocation
        ? {
            lat: realUserLocation.lat,
            lng: realUserLocation.lng,
            x: 580,
            y: 460,
            sector: 'Real Device GPS',
          }
        : {
            lat: 34.0522,
            lng: -118.2437,
            x: 580,
            y: 460,
            sector: 'Sector Bravo (Simulated)',
          };

      const msg = await createEmergencyReport({
        emergencyType: selectedType,
        priority: selectedPriority,
        peopleCount,
        description:
          description.trim() ||
          `${selectedType} reported via Citizen SOS button. ${peopleCount} people requiring evacuation.`,
        locationName: locationText,
        coordinates: coords,
      });
      setLastCreatedMsg(msg);
      setSosModalOpen(false);
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetVoice = async (text: string, langHint: string) => {
    setVoiceTranscript(text);
    setIsAnalyzingVoice(true);
    try {
      const result = await parseMultilingualVoice(text, langHint);
      setVoiceResult(result);
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  const getPriorityBadgeStyle = (priority: IncidentPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-800/80';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const getDeliveryStatusProgress = (status: EmergencyMessage['deliveryStatus']) => {
    switch (status) {
      case 'Stored Locally':
        return 20;
      case 'Searching for Relay':
        return 40;
      case 'Relayed':
        return 65;
      case 'Reached Gateway':
        return 85;
      case 'Delivered':
        return 100;
      case 'Acknowledged':
        return 100;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-6 px-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Citizen Mobile Terminal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            title="Toggle smartphone chassis frame"
          >
            {deviceFrameMode ? (
              <>
                <Maximize2 className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Expand</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container / Chassis */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[420px] bg-slate-900 border-[6px] border-slate-800 rounded-[44px] shadow-2xl p-4 sm:p-5 relative ring-1 ring-slate-700/50'
            : 'max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl'
        }`}
      >
        {/* Phone Speaker & Camera Notch (when in frame mode) */}
        {deviceFrameMode && (
          <div className="w-32 h-4 bg-slate-950 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
            <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
          </div>
        )}

        {/* Status Bar with Power-Saving Mode Toggle & Battery Controls */}
        <div className="relative pb-3 border-b border-slate-800/80 px-1 font-mono">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-200">09:42 AM</span>
              <span>·</span>
              <span className="text-cyan-400">GPS: ±4m</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Power-Saving Mode Toggle in Status Bar */}
              <button
                onClick={() => {
                  if (ultraLowPowerMode) {
                    toggleUltraLowPowerMode();
                  } else {
                    togglePowerSavingMode();
                  }
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition-all ${
                  ultraLowPowerMode
                    ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-sm shadow-rose-950/60 animate-pulse'
                    : powerSavingMode
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/80 shadow-sm shadow-amber-950/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={
                  ultraLowPowerMode
                    ? 'Ultra-Low Power Mode ACTIVE: All non-emergency background sync paused.'
                    : powerSavingMode
                    ? 'Power-Saving Mode ACTIVE: Mesh background discovery and network re-polling throttled.'
                    : 'Enable Power-Saving Mode (reduces mesh polling and background forwarding)'
                }
              >
                {ultraLowPowerMode ? (
                  <Zap className="w-3 h-3 text-rose-400 fill-rose-400" />
                ) : powerSavingMode ? (
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                ) : (
                  <ZapOff className="w-3 h-3 text-slate-500" />
                )}
                <span>{ultraLowPowerMode ? 'ULTRA-LOW' : powerSavingMode ? 'ECO ON' : 'ECO'}</span>
              </button>

              {/* Battery Indicator with Clickable Simulator Dropdown */}
              <button
                onClick={() => setBatteryMenuOpen(!batteryMenuOpen)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[10px] transition-colors ${
                  citizenBattery < 20
                    ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                    : powerSavingMode
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                }`}
                title="Click to test battery levels (<20% triggers automatic power saving)"
              >
                {citizenBattery < 20 ? (
                  <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
                ) : powerSavingMode ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="font-bold">{citizenBattery}%</span>
              </button>
            </div>
          </div>

          {/* Battery Simulator & 24h Trend Dropdown Menu */}
          {batteryMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5 text-slate-200 font-bold text-xs">
                  <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Battery Usage Trends (24h)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Avg: -3.2%/hr
                </span>
              </div>

              {/* 24-Hour Battery Line Chart */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-2.5">
                <div className="relative h-24 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 280 75">
                    <defs>
                      <linearGradient id="batteryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                        <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="batteryLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="85%" stopColor={citizenBattery < 20 ? '#ef4444' : '#f59e0b'} />
                        <stop offset="100%" stopColor={citizenBattery < 20 ? '#ef4444' : '#10b981'} />
                      </linearGradient>
                    </defs>

                    {/* Horizontal reference grid lines */}
                    <line x1="10" y1="12" x2="270" y2="12" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                    <text x="274" y="14" fill="#64748b" fontSize="7" textAnchor="start" fontFamily="monospace">100%</text>

                    <line x1="10" y1="37" x2="270" y2="37" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                    <text x="274" y="39" fill="#64748b" fontSize="7" textAnchor="start" fontFamily="monospace">50%</text>

                    {/* Critical 20% Eco Threshold Dotted Line */}
                    <line x1="10" y1="52" x2="270" y2="52" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.75" />
                    <text x="274" y="54" fill="#ef4444" fontSize="7" fontWeight="bold" textAnchor="start" fontFamily="monospace">20%</text>

                    {/* Continuous Area Path */}
                    {(() => {
                      const y0 = 62 - (batteryTrendData[0].pct / 100) * 50;
                      const y1 = 62 - (batteryTrendData[1].pct / 100) * 50;
                      const y2 = 62 - (batteryTrendData[2].pct / 100) * 50;
                      const y3 = 62 - (batteryTrendData[3].pct / 100) * 50;
                      const y4 = 62 - (batteryTrendData[4].pct / 100) * 50;
                      const y5 = 62 - (batteryTrendData[5].pct / 100) * 50;

                      const pathD = `M ${batteryTrendData[0].x} ${y0} L ${batteryTrendData[1].x} ${y1} L ${batteryTrendData[2].x} ${y2} L ${batteryTrendData[3].x} ${y3} L ${batteryTrendData[4].x} ${y4} L ${batteryTrendData[5].x} ${y5}`;
                      const areaD = `${pathD} L ${batteryTrendData[5].x} 68 L ${batteryTrendData[0].x} 68 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#batteryAreaGrad)" />
                          <path d={pathD} fill="none" stroke="url(#batteryLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      );
                    })()}

                    {/* Interactive Points on Line */}
                    {batteryTrendData.map((pt, idx) => {
                      const y = 62 - (pt.pct / 100) * 50;
                      const isHovered = batteryHoverIndex === idx;
                      const isNow = idx === batteryTrendData.length - 1;

                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setBatteryHoverIndex(idx)}
                          onMouseLeave={() => setBatteryHoverIndex(null)}
                          className="cursor-pointer"
                        >
                          {/* Pulsing ring for current point */}
                          {isNow && (
                            <circle
                              cx={pt.x}
                              cy={y}
                              r="6"
                              fill="none"
                              stroke={citizenBattery < 20 ? '#ef4444' : '#06b6d4'}
                              strokeWidth="1.5"
                              className="animate-ping opacity-75"
                            />
                          )}

                          <circle
                            cx={pt.x}
                            cy={y}
                            r={isHovered ? 4.5 : isNow ? 3.5 : 2.5}
                            fill={isNow ? (citizenBattery < 20 ? '#ef4444' : '#38bdf8') : '#0f172a'}
                            stroke={isNow ? '#ffffff' : '#38bdf8'}
                            strokeWidth="1.5"
                            className="transition-all duration-150"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X-Axis Time Labels */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1 px-1 border-t border-slate-900">
                  <span>-24h</span>
                  <span>-18h</span>
                  <span>-12h</span>
                  <span>-6h (Cell Outage)</span>
                  <span>-3h</span>
                  <span className="text-cyan-400 font-bold">Now ({citizenBattery}%)</span>
                </div>

                {/* Active Hover / Inspector Strip */}
                <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[10px] flex items-center justify-between text-slate-300">
                  {batteryHoverIndex !== null ? (
                    <>
                      <span className="font-semibold text-cyan-300">
                        {batteryTrendData[batteryHoverIndex].hour}: {batteryTrendData[batteryHoverIndex].pct}%
                      </span>
                      <span className="text-slate-400 italic">
                        {batteryTrendData[batteryHoverIndex].note}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-400">
                        {powerSavingMode ? '⚡ Eco Mode: ~18h life left' : 'Mesh Standby: ~6h life left'}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">
                        {powerSavingMode ? 'Drain -1.2%/hr' : 'Drain -3.4%/hr'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Battery Simulator Options */}
              <div className="text-[10px] font-semibold text-slate-400 mb-1 px-0.5">
                Simulate Battery Level:
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCitizenBattery(78);
                    setPowerSavingMode(false);
                    setBatteryMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    citizenBattery === 78
                      ? 'bg-slate-800 text-emerald-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Normal (78%)</span>
                  </span>
                  {citizenBattery === 78 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => {
                    setCitizenBattery(16); // < 20% drops into power-saving mode automatically!
                    setBatteryMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    citizenBattery === 16
                      ? 'bg-slate-800 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BatteryWarning className="w-3.5 h-3.5 text-amber-400" />
                    <span>Low (&lt;20% - 16%)</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    Auto-Eco On
                  </span>
                </button>

                <button
                  onClick={() => {
                    setCitizenBattery(8);
                    setBatteryMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    citizenBattery === 8
                      ? 'bg-slate-800 text-rose-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
                    <span>Critical (8%)</span>
                  </span>
                  {citizenBattery === 8 && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                </button>
              </div>

              {/* Audible Chime Audition */}
              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>&lt;10% Warning Chime:</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playCriticalBatteryChime();
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold transition-colors border border-slate-700"
                  title="Audition the audible warning chime"
                >
                  <Volume2 className="w-3 h-3 text-cyan-400" />
                  <span>Test Chime</span>
                </button>
              </div>

              <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
                Battery dropping below 20% engages power-saving; below 10% triggers audible chime and Ultra-Low Power modal.
              </div>
            </div>
          )}
        </div>

        {/* Ultra-Low Power Mode Banner (when active) */}
        {ultraLowPowerMode ? (
          <div className="mt-3 p-3.5 rounded-2xl bg-rose-950/70 border border-rose-600/80 text-rose-200 text-xs shadow-xl space-y-1.5 animate-pulse-slow">
            <div className="flex items-center justify-between font-bold text-rose-300 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                <span>ULTRA-LOW POWER ACTIVE (&lt;10% BATTERY)</span>
              </span>
              <span className="font-mono text-[10px] text-rose-300 bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700">
                Non-Emergency Sync: PAUSED
              </span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              All non-emergency background sync and passive relays are completely paused. Mesh transceivers remain in deep sleep to reserve critical SOS transmission capability.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] border-t border-rose-800/60">
              <span className="text-rose-300 font-mono">Battery: {citizenBattery}% (~6.5h standby)</span>
              <button
                onClick={() => setCriticalBatteryModalOpen(true)}
                className="underline text-cyan-300 font-semibold hover:text-white flex items-center gap-1"
              >
                <Plug className="w-3 h-3 text-cyan-400" />
                <span>Find Charging Source</span>
              </button>
            </div>
          </div>
        ) : powerSavingMode ? (
          /* Regular Power-Saving Mode Alert & Telemetry Banner */
          <div className="mt-3 p-3 rounded-2xl bg-amber-950/50 border border-amber-700/60 text-amber-200 text-xs shadow-lg space-y-1">
            <div className="flex items-center justify-between font-bold text-amber-300 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>POWER-SAVING MODE ACTIVE {citizenBattery < 20 && '(<20% BATTERY)'}</span>
              </span>
              <span className="font-mono text-[10px] text-amber-400 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-800">
                Polling: {meshPollingIntervalMs / 1000}s (Throttled)
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Mesh background polling throttled from 2s to {meshPollingIntervalMs / 1000}s. Non-essential peer packet forwarding paused to reserve battery for emergency SOS transmission.
            </p>
          </div>
        ) : null}

        {/* Network Status Banner */}
        <div className="my-3">
          {networkConnectivity === 'ONLINE' ? (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">🟢 ONLINE MODE</div>
                  <div className="text-[10px] text-emerald-400/80">Direct uplink to Command Center active</div>
                </div>
              </div>

              <button
                onClick={simulateNetworkFailure}
                className="text-[10px] font-semibold px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
                title="Disconnect simulated internet to test offline mode"
              >
                Cut Network
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                <div>
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>🔴 OFFLINE MODE</span>
                  </div>
                  <div className="text-[10px] text-rose-300/90 leading-tight">
                    Messages will be relayed through nearby peer devices.
                  </div>
                </div>
              </div>

              <button
                onClick={restoreNetwork}
                className="text-[10px] font-semibold px-2.5 py-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/80 transition-colors whitespace-nowrap ml-2"
              >
                Restore
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl mb-4 text-xs font-medium border border-slate-800">
          <button
            onClick={() => setMobileTab('sos')}
            className={`py-2 rounded-lg transition-colors ${
              mobileTab === 'sos' ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SOS
          </button>
          <button
            onClick={() => setMobileTab('messages')}
            className={`py-2 rounded-lg transition-colors ${
              mobileTab === 'messages' ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Queue ({citizenMessages.length})
          </button>
          <button
            onClick={() => setMobileTab('mesh')}
            className={`py-2 rounded-lg transition-colors ${
              mobileTab === 'mesh' ? 'bg-blue-950/80 text-blue-300 font-bold border border-blue-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mesh Map
          </button>
          <button
            onClick={() => setMobileTab('voice')}
            className={`py-2 rounded-lg transition-colors ${
              mobileTab === 'voice' ? 'bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-800/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice
          </button>
        </div>

        {/* Tab 1: SOS TRIGGER & WORKFLOW */}
        {mobileTab === 'sos' && (
          <div className="space-y-4">
            {/* Last Created Alert Live Tracker (if created) */}
            {lastCreatedMsg && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                    DISPATCH TRACKER · {lastCreatedMsg.id}
                  </span>
                  <span className="text-[10px] text-slate-400">{lastCreatedMsg.timestamp}</span>
                </div>

                <p className="text-xs font-semibold text-white mb-2">{lastCreatedMsg.emergencyType}</p>

                {/* Animated Progress Flow */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Delivery Status:</span>
                    <span className="text-cyan-300 font-bold">{lastCreatedMsg.deliveryStatus}</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-700"
                      style={{ width: `${getDeliveryStatusProgress(lastCreatedMsg.deliveryStatus)}%` }}
                    ></div>
                  </div>

                  {/* Flow Stages */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 text-slate-400 font-mono">
                    <span className={lastCreatedMsg.deliveryStatus !== 'Stored Locally' ? 'text-emerald-400' : 'text-cyan-300'}>
                      1. Local ✓
                    </span>
                    <span className={lastCreatedMsg.hopCount >= 1 ? 'text-emerald-400' : 'text-slate-500'}>
                      2. Peer Hop
                    </span>
                    <span className={lastCreatedMsg.hopCount >= 2 ? 'text-emerald-400' : 'text-slate-500'}>
                      3. Gateway
                    </span>
                    <span className={lastCreatedMsg.deliveryStatus === 'Delivered' || lastCreatedMsg.deliveryStatus === 'Acknowledged' ? 'text-emerald-400' : 'text-slate-500'}>
                      4. Command
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Share2 className="w-3 h-3 text-cyan-400" />
                    <span>Relay Path: {lastCreatedMsg.relayPath.join(' → ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Giant SOS Button */}
            <div className="py-6 flex flex-col items-center justify-center">
              <button
                onClick={() => setSosModalOpen(true)}
                className="w-48 h-48 rounded-full bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 active:scale-95 text-white font-extrabold text-2xl shadow-2xl shadow-rose-900/60 border-4 border-rose-400/40 flex flex-col items-center justify-center gap-2 transition-transform duration-200 group"
              >
                <AlertOctagon className="w-10 h-10 group-hover:scale-110 transition-transform animate-pulse" />
                <span>SEND SOS</span>
                <span className="text-[10px] font-normal tracking-wider opacity-90">TAP TO CONFIGURE</span>
              </button>
              <p className="text-xs text-slate-400 mt-4 text-center">
                Press to trigger encrypted emergency broadcast over local mesh.
              </p>
            </div>

            {/* Quick Location & Device Summary with Real GPS Option */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Device Location</span>
                </span>
                {realUserLocation ? (
                  <span className="text-emerald-400 font-mono font-bold flex items-center gap-1 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{realUserLocation.lat.toFixed(4)}° N, {realUserLocation.lng.toFixed(4)}° W (±{realUserLocation.accuracyMeters}m)</span>
                  </span>
                ) : (
                  <span className="text-slate-300 font-mono text-[11px]">34.0522° N, 118.2437° W (Simulated)</span>
                )}
              </div>

              {/* Real GPS Acquire Button if not locked */}
              {!realUserLocation && (
                <button
                  onClick={async () => {
                    await requestRealUserLocation();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Acquire Real Device GPS (Browser Geolocation)</span>
                </button>
              )}

              {/* Data Transparency Banner */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px] space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>GPS Coordinate Source:</span>
                  <span className={realUserLocation ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {realUserLocation ? '🟢 REAL BROWSER GPS' : '🟡 SIMULATED TEST SECTOR'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Radio Mesh Relay:</span>
                  <span className="text-amber-300">🟡 IN-BROWSER SIMULATION</span>
                </div>
                <div className="text-[9px] text-slate-500 pt-0.5 border-t border-slate-800 leading-tight">
                  Browser simulation only. No physical LoRa/BLE radio hardware packet is emitted.
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mesh Density</span>
                </span>
                <span className="text-emerald-400 font-medium">4 Peer Phones in Range (Model)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: MY EMERGENCY MESSAGES QUEUE */}
        {mobileTab === 'messages' && (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                My Emergency Reports
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {citizenMessages.length} Stored Locally
              </span>
            </div>

            {citizenMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getPriorityBadgeStyle(msg.priority)}`}>
                    {msg.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>

                <div className="font-semibold text-xs text-white mb-1">{msg.emergencyType}</div>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">{msg.description}</p>

                {/* Status indicator bar */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      msg.deliveryStatus === 'Delivered' || msg.deliveryStatus === 'Acknowledged'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{msg.deliveryStatus}</span>
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Hops: {msg.hopCount}</span>
                  <span>ID: {msg.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: MESH NETWORK VISUALIZATION */}
        {mobileTab === 'mesh' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[9px] font-bold block w-fit mb-1">
                  🟡 MESH NETWORK SIMULATION
                </span>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Peer-to-Peer Relay Chain
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {powerSavingMode && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Eco Polling ({meshPollingIntervalMs / 1000}s)
                  </span>
                )}
                <span className="text-[11px] text-cyan-400 font-mono">3 Hops to Uplink</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Protocol Modeling Notice:</strong> Simulating: Citizen Phone → Neighbor Phone → Drone Relay → Gateway. In-browser hops, signal dBm, and satellite connectivity are simulation models. Physical mesh transmission requires external LoRa/BLE radio hardware.
            </div>

            {/* Mesh Chain Nodes */}
            <div className="space-y-2 mt-2">
              {meshHops.map((node, index) => {
                const isSelected = selectedHopNode?.id === node.id;
                return (
                  <div key={node.id}>
                    <div
                      onClick={() => setSelectedHopNode(isSelected ? null : node)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            node.status === 'gateway'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : node.status === 'active'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          }`}
                        >
                          {index === 0 ? 'YOU' : `H${index}`}
                        </div>

                        <div>
                          <div className="text-xs font-semibold">{node.name}</div>
                          <div className="text-[10px] text-slate-400">{node.signal}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono text-emerald-400">{node.battery}% Bat</div>
                        <div className="text-[10px] text-slate-400">{node.lastContact}</div>
                      </div>
                    </div>

                    {/* Connecting Hop Arrow */}
                    {index < meshHops.length - 1 && (
                      <div className="flex justify-center py-1 text-slate-600">
                        <span className="text-[11px] font-mono text-cyan-500/80">↓ P2P Hop ({index + 1} → {index + 2})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Node Inspection Card with 1-Hour Signal Strength Line Chart */}
            {selectedHopNode ? (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/50 mt-3 text-xs space-y-3 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between font-mono font-semibold text-cyan-300 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white text-xs">{selectedHopNode.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{selectedHopNode.id}</span>
                    </div>
                  </div>
                  <span className={`uppercase text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedHopNode.status === 'gateway'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : selectedHopNode.status === 'active'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {selectedHopNode.status}
                  </span>
                </div>

                {/* Key Node Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase">Signal</span>
                    <span className="font-mono text-cyan-300 font-bold">{selectedHopNode.signal.split(' ')[0]} dBm</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase">Battery</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedHopNode.battery}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block uppercase">Buffer</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedHopNode.stored} pkts</span>
                  </div>
                </div>

                {/* 1-Hour Signal Strength Line Chart */}
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/80">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Signal Fluctuations (Last 1 Hour)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      Current: {selectedHopNode.signal.split(' ')[0]} dBm
                    </span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="relative h-20 w-full pt-1">
                    {(() => {
                      const trend = getSignalTrendForNode(selectedHopNode.id);
                      const points = trend.map((pt) => ({
                        ...pt,
                        y: 12 + (-40 - pt.dbm),
                      }));

                      const pathD = points.reduce(
                        (acc, curr, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`,
                        ''
                      );
                      const areaD = `${pathD} L ${points[points.length - 1].x} 68 L ${points[0].x} 68 Z`;

                      return (
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 280 72">
                          <defs>
                            <linearGradient id="signalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                              <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="signalLineGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#38bdf8" />
                              <stop offset="60%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Reference Lines */}
                          <line x1="12" y1="22" x2="268" y2="22" stroke="#10b981" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                          <text x="270" y="24" fill="#10b981" fontSize="6.5" textAnchor="start" fontFamily="monospace">-50 dBm</text>

                          <line x1="12" y1="42" x2="268" y2="42" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
                          <text x="270" y="44" fill="#f59e0b" fontSize="6.5" textAnchor="start" fontFamily="monospace">-70 dBm</text>

                          {/* Critical Dropout Threshold Line */}
                          <line x1="12" y1="57" x2="268" y2="57" stroke="#ef4444" strokeWidth="0.75" strokeDasharray="3 2" strokeOpacity="0.6" />
                          <text x="270" y="59" fill="#ef4444" fontSize="6.5" fontWeight="bold" textAnchor="start" fontFamily="monospace">-85 dBm</text>

                          {/* Area & Stroke Paths */}
                          <path d={areaD} fill="url(#signalAreaGrad)" />
                          <path d={pathD} fill="none" stroke="url(#signalLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Interactive Signal Data Points */}
                          {points.map((pt, idx) => {
                            const isHovered = signalHoverIndex === idx;
                            const isNow = idx === points.length - 1;

                            return (
                              <g
                                key={idx}
                                onMouseEnter={() => setSignalHoverIndex(idx)}
                                onMouseLeave={() => setSignalHoverIndex(null)}
                                className="cursor-pointer"
                              >
                                {isNow && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="5"
                                    fill="none"
                                    stroke="#06b6d4"
                                    strokeWidth="1.5"
                                    className="animate-ping opacity-75"
                                  />
                                )}

                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? 4.5 : isNow ? 3.5 : 2.5}
                                  fill={isNow ? '#38bdf8' : '#0f172a'}
                                  stroke={isNow ? '#ffffff' : '#38bdf8'}
                                  strokeWidth="1.5"
                                  className="transition-all duration-150"
                                />
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-1 border-t border-slate-800">
                    <span>-60m</span>
                    <span>-50m</span>
                    <span>-40m</span>
                    <span>-30m</span>
                    <span>-20m</span>
                    <span>-10m</span>
                    <span className="text-cyan-400 font-bold">Now</span>
                  </div>

                  {/* Hover or Telemetry Summary Strip */}
                  <div className="pt-1 border-t border-slate-800/80 text-[10px] flex items-center justify-between text-slate-300">
                    {signalHoverIndex !== null ? (
                      <>
                        <span className="font-semibold text-cyan-300">
                          {getSignalTrendForNode(selectedHopNode.id)[signalHoverIndex].time}: {getSignalTrendForNode(selectedHopNode.id)[signalHoverIndex].dbm} dBm
                        </span>
                        <span className="text-slate-400 italic">
                          {getSignalTrendForNode(selectedHopNode.id)[signalHoverIndex].note}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-400">
                          Link Margin: <strong className="text-emerald-400">+18 dB</strong> (Stable P2P Carrier)
                        </span>
                        <span className="text-slate-500 font-mono text-[9px]">
                          Variance: ±5.4 dBm
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mt-3 text-center text-xs text-slate-400 space-y-1">
                <Radio className="w-5 h-5 text-cyan-400 mx-auto animate-pulse" />
                <p className="font-semibold text-slate-300">Select any mesh hop above to inspect signal trends</p>
                <p className="text-[10px] text-slate-500">
                  Displays real-time signal fluctuations, link margin, and RF attenuation over the past hour.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: MULTILINGUAL VOICE INTERFACE */}
        {mobileTab === 'voice' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-0.5">
                  Multilingual Voice Emergency Reporter
                </h4>
                <p className="text-xs text-slate-400">
                  Speak in your native language. AI transcribes and formats an urgent dispatch packet.
                </p>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border whitespace-nowrap ${
                speechApiSupported
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}>
                {speechApiSupported ? '🟢 Live Web Speech' : '🟡 Preset Audio Samples'}
              </span>
            </div>

            {/* Mic Button & Waveform simulation */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => (isRecording ? handleStopSpeech() : handleStartSpeech())}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 transition-all ${
                  isRecording
                    ? 'bg-rose-600 scale-110 shadow-2xl shadow-rose-600/50 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Mic className="w-8 h-8" />
                <span className="text-[10px] font-semibold">
                  {isRecording ? 'Listening (Tap Stop)' : 'Tap to Speak'}
                </span>
              </button>

              {/* Waveform Bars */}
              <div className="flex items-center gap-1.5 h-6 mt-4">
                {[12, 24, 18, 32, 28, 40, 16, 22, 36, 20].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: isRecording ? `${h}px` : '4px' }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isRecording ? 'bg-cyan-400' : 'bg-slate-800'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Live Transcript Bubble */}
              {voiceTranscript && (
                <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-900 border border-cyan-800/80 text-xs text-cyan-300 font-mono text-center">
                  <span className="text-[10px] text-slate-400 block uppercase mb-0.5">Live Speech Transcript:</span>
                  "{voiceTranscript}"
                </div>
              )}
            </div>

            {/* AI-Assisted Dispatch Draft Notice */}
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200/90 leading-relaxed space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>AI-Assisted Dispatch Draft Notice</span>
              </div>
              <p>
                Voice parsing produces an AI-assisted draft that must be reviewed by emergency dispatch before allocating rescue teams. This application is an emergency simulation platform and does NOT contact municipal 911/112 emergency services.
              </p>
            </div>

            {/* Quick Demo Voice Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Or Try Sample Multi-Language Transcripts:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() =>
                    handlePresetVoice('எங்களுக்கு தண்ணீர் வேண்டும்.', 'Tamil')
                  }
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left text-xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-cyan-300">Tamil: "எங்களுக்கு தண்ணீர் வேண்டும்."</div>
                    <div className="text-[10px] text-slate-400">"We need drinking water."</div>
                  </div>
                  <Volume2 className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() =>
                    handlePresetVoice('हमें पीने का पानी और प्राथमिक उपचार चाहिए।', 'Hindi')
                  }
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left text-xs transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-cyan-300">Hindi: "हमें पीने का पानी और प्राथमिक उपचार चाहिए।"</div>
                    <div className="text-[10px] text-slate-400">"Need water & first aid."</div>
                  </div>
                  <Volume2 className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Voice Result Breakdown */}
            {isAnalyzingVoice && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-center text-cyan-400 animate-pulse">
                Parsing multilingual voice transcript with Gemini...
              </div>
            )}

            {voiceResult && !isAnalyzingVoice && (
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-cyan-800/50 pb-1.5">
                  <span className="text-cyan-300 font-bold">Detected: {voiceResult.detectedLanguage}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Conf: {voiceResult.confidence}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">English Meaning:</span>
                  <p className="text-white font-medium">{voiceResult.englishTranslation}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-400 block text-[10px]">Type:</span>
                    <span className="text-cyan-300 font-semibold">{voiceResult.structuredEmergency?.emergencyType}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900">
                    <span className="text-slate-400 block text-[10px]">Priority:</span>
                    <span className="text-rose-400 font-bold">{voiceResult.structuredEmergency?.priority}</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await createEmergencyReport({
                      emergencyType: 'Need Food/Water',
                      priority: 'HIGH',
                      description: `[Voice Report in ${voiceResult.detectedLanguage}] ${voiceResult.englishTranslation}`,
                      peopleCount: 2,
                    });
                    setMobileTab('sos');
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Send as SOS Message
                </button>
              </div>
            )}
          </div>
        )}

        {/* SOS Confirmation Modal */}
        {sosModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <AlertOctagon className="w-5 h-5" />
                  <span>Send Emergency Alert</span>
                </div>
                <button
                  onClick={() => setSosModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Select your primary emergency condition. This message will be encrypted and broadcast over the mesh.
              </p>

              {/* Emergency Category Grid */}
              <div className="grid grid-cols-2 gap-2">
                {emergencyOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      setSelectedType(opt.type);
                      setSelectedPriority(opt.defaultPriority);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center gap-2.5 ${
                      selectedType === opt.type
                        ? 'bg-rose-950/70 border-rose-500 text-white font-semibold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* People Affected Count */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  People Affected / In Danger
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 8, 15].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPeopleCount(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        peopleCount === num
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {num === 15 ? '15+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Description */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Brief Situation / Landmark (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Trapped on 2nd floor, water rising fast, elderly person unconscious..."
                  className="w-full h-18 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Trigger */}
              <div className="pt-2">
                <button
                  onClick={handleSendSos}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Broadcasting over Mesh...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirm & Broadcast SOS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Critical Battery Warning Modal (< 10%) */}
        {criticalBatteryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 ring-1 ring-rose-500/40">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                  <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-600/80 flex items-center justify-center text-rose-400 animate-pulse">
                    <BatteryWarning className="w-5 h-5" />
                  </div>
                  <div>
                    <span>Critical Battery Alert</span>
                    <span className="block text-[11px] font-mono text-rose-300 font-normal">
                      Battery Level: {citizenBattery}% Remaining
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCriticalBatteryModalOpen(false);
                    setHasDismissedCriticalWarning(true);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Audible Chime Notification Status & Test Controls */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
                    <Bell className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Audible Alert Chime Played</span>
                    <span className="block text-[10px] text-slate-400">Triple-tone emergency beacon (880Hz → 523Hz)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={playCriticalBatteryChime}
                    className="px-2 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    title="Play or replay the audible low-battery alert chime"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay</span>
                  </button>

                  <button
                    onClick={() => setChimeSoundEnabled(!chimeSoundEnabled)}
                    className={`p-1 rounded-lg border text-[10px] transition-colors ${
                      chimeSoundEnabled
                        ? 'bg-slate-800 text-emerald-400 border-slate-700'
                        : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                    title={chimeSoundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
                  >
                    {chimeSoundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your device battery has dropped below <strong className="text-rose-400">10%</strong>. Continuous peer discovery and mesh forwarding will rapidly exhaust remaining power. Recommended immediate actions:
              </p>

              {/* Action Suggestion 1: Find Emergency Charging Source */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Plug className="w-3.5 h-3.5 text-amber-400" />
                    <span>Option 1: Find Disaster Charging Sources</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Nearby Hubs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Emergency shelters with active generators and solar charging microgrids in your sector:
                </p>
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="truncate pr-2">⚡ Riverfront School Gym</span>
                    <span className="text-emerald-400 text-[10px] whitespace-nowrap">Gen Online (650m)</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="truncate pr-2">⚡ Civic Auditorium Center</span>
                    <span className="text-emerald-400 text-[10px] whitespace-nowrap">Solar Microgrid (950m)</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveView('command_center');
                    setCommandCenterTab('live_map');
                    setCriticalBatteryModalOpen(false);
                  }}
                  className="w-full mt-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Locate Charging Shelters on Live Map</span>
                </button>
              </div>

              {/* Action Suggestion 2: Switch to Ultra-Low Power Mode */}
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>Option 2: Switch to Ultra-Low Power Mode</span>
                  </span>
                  <span className="text-[10px] text-rose-300 font-mono bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-700">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Pauses <strong>100% of non-emergency background sync</strong>, neighbor discovery bursts, and passive packet relays. Radios stay in deep sleep and will only wake up if you press <strong className="text-white">SEND SOS</strong>.
                </p>
                <div className="flex items-center justify-between text-[11px] text-rose-300/90 pt-1 border-t border-rose-900/60 font-mono">
                  <span>Battery Standby:</span>
                  <span className="font-bold text-emerald-400">~6.5 Hours (vs ~35 min)</span>
                </div>

                <button
                  onClick={() => {
                    setUltraLowPowerMode(true);
                    setPowerSavingMode(true);
                    setCriticalBatteryModalOpen(false);
                  }}
                  className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Switch to Ultra-Low Power Mode</span>
                </button>
              </div>

              {/* Dismiss / Secondary Action */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCriticalBatteryModalOpen(false);
                    setHasDismissedCriticalWarning(true);
                  }}
                  className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium hover:bg-slate-800/60 transition-colors text-center"
                >
                  Dismiss & Keep Normal Mesh Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
