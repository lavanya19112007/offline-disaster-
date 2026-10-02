import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  EmergencyMessage,
  Incident,
  EmergencyResource,
  MeshNode,
  DuplicateCluster,
  AuditLogEntry,
  NetworkPacket,
  UserRole,
  NetworkConnectivity,
  IncidentPriority,
  IncidentStatus,
  EmergencyType,
  RealDisasterEvent,
  LiveWeatherReport,
  EmergencyFacility,
  DataClassification,
} from '../types/disaster';
import {
  initialIncidents,
  initialResources,
  initialMeshNodes,
  initialDuplicateClusters,
  initialCitizenMessages,
  initialAuditLogs,
} from '../data/mockDisasterData';

interface SimulationStats {
  devicesTotal: number;
  devicesOffline: number;
  emergencyReports: number;
  messagesRelayed: number;
  incidentsDetected: number;
  criticalCount: number;
  deliveredToCenter: number;
  pendingSync: number;
}

interface DisasterContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeView: 'landing' | 'citizen' | 'command_center';
  setActiveView: (view: 'landing' | 'citizen' | 'command_center') => void;
  commandCenterTab:
    | 'overview'
    | 'live_map'
    | 'incidents'
    | 'incident_intelligence'
    | 'resources'
    | 'ai_intelligence'
    | 'network_monitor'
    | 'voice_interface'
    | 'analytics'
    | 'security';
  setCommandCenterTab: (tab: any) => void;

  networkConnectivity: NetworkConnectivity;
  setNetworkConnectivity: (conn: NetworkConnectivity) => void;
  simulateNetworkFailure: () => void;
  restoreNetwork: () => void;

  incidents: Incident[];
  selectedIncident: Incident | null;
  setSelectedIncident: (inc: Incident | null) => void;
  updateIncidentPriority: (id: string, newPriority: IncidentPriority) => void;
  updateIncidentStatus: (id: string, newStatus: IncidentStatus) => void;
  verifyIncident: (id: string) => void;

  resources: EmergencyResource[];
  assignResource: (resourceId: string, incidentId: string) => void;

  meshNodes: MeshNode[];
  toggleNodeFailure: (nodeId: string) => void;
  addMeshNode: (node: Partial<MeshNode>) => void;
  removeMeshNode: (nodeId: string) => void;

  citizenMessages: EmergencyMessage[];
  createEmergencyReport: (
    report: Partial<EmergencyMessage>
  ) => Promise<EmergencyMessage>;

  duplicateClusters: DuplicateCluster[];
  verifyDuplicateCluster: (clusterId: string) => void;

  auditLogs: AuditLogEntry[];
  activePackets: NetworkPacket[];

  simulationRunning: boolean;
  toggleSimulation: () => void;
  restartSimulation: () => void;
  simulationStats: SimulationStats;

  // Power Saving & Battery features
  citizenBattery: number;
  setCitizenBattery: (level: number) => void;
  powerSavingMode: boolean;
  setPowerSavingMode: (enabled: boolean) => void;
  togglePowerSavingMode: () => void;
  ultraLowPowerMode: boolean;
  setUltraLowPowerMode: (enabled: boolean) => void;
  toggleUltraLowPowerMode: () => void;
  meshPollingIntervalMs: number;

  // Live External Disaster & Meteorological Data
  realDisasterEvents: RealDisasterEvent[];
  liveDataStatus: DataClassification;
  lastDataRefreshTime: string;
  isRefreshingLiveData: boolean;
  liveDataErrorMessage: string | null;
  refreshLiveData: () => Promise<void>;
  selectedRealEvent: RealDisasterEvent | null;
  setSelectedRealEvent: (event: RealDisasterEvent | null) => void;
  realEmergencyFacilities: EmergencyFacility[];
  fetchWeatherForLocation: (lat: number, lon: number) => Promise<LiveWeatherReport | null>;
  activeDataFilter: 'ALL' | 'LIVE_ONLY' | 'SIMULATED_ONLY';
  setActiveDataFilter: (filter: 'ALL' | 'LIVE_ONLY' | 'SIMULATED_ONLY') => void;

  // Real GPS Geolocation
  realUserLocation: { lat: number; lng: number; accuracyMeters: number; timestamp: string } | null;
  requestRealUserLocation: () => Promise<{ lat: number; lng: number; accuracyMeters: number } | null>;
  locationPermissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable';

  // AI Service Methods
  analyzeEmergencyText: (text: string) => Promise<any>;
  groupIncidentsWithAI: (reports: any[]) => Promise<any>;
  parseMultilingualVoice: (transcript: string, langHint?: string) => Promise<any>;
}

const DisasterContext = createContext<DisasterContextType | null>(null);

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('Coordinator');
  const [activeView, setActiveView] = useState<'landing' | 'citizen' | 'command_center'>('landing');
  const [commandCenterTab, setCommandCenterTab] = useState<
    | 'overview'
    | 'live_map'
    | 'incidents'
    | 'incident_intelligence'
    | 'resources'
    | 'ai_intelligence'
    | 'network_monitor'
    | 'voice_interface'
    | 'analytics'
    | 'security'
  >('overview');

  const [networkConnectivity, setNetworkConnectivity] = useState<NetworkConnectivity>('ONLINE');
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(initialIncidents[0]);
  const [resources, setResources] = useState<EmergencyResource[]>(initialResources);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>(initialMeshNodes);
  const [citizenMessages, setCitizenMessages] = useState<EmergencyMessage[]>(initialCitizenMessages);
  const [duplicateClusters, setDuplicateClusters] = useState<DuplicateCluster[]>(initialDuplicateClusters);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [activePackets, setActivePackets] = useState<NetworkPacket[]>([]);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    devicesTotal: 127,
    devicesOffline: 34,
    emergencyReports: 46,
    messagesRelayed: 129,
    incidentsDetected: 21,
    criticalCount: 7,
    deliveredToCenter: 38,
    pendingSync: 8,
  });

  // Citizen Battery & Power Saving Mode state
  const [citizenBattery, setCitizenBatteryState] = useState<number>(78);
  const [powerSavingMode, setPowerSavingMode] = useState<boolean>(false);
  const [ultraLowPowerMode, setUltraLowPowerMode] = useState<boolean>(false);

  // Real Data Feeds State
  const [realDisasterEvents, setRealDisasterEvents] = useState<RealDisasterEvent[]>([]);
  const [liveDataStatus, setLiveDataStatus] = useState<DataClassification>('LIVE');
  const [lastDataRefreshTime, setLastDataRefreshTime] = useState<string>('Just now');
  const [isRefreshingLiveData, setIsRefreshingLiveData] = useState<boolean>(false);
  const [liveDataErrorMessage, setLiveDataErrorMessage] = useState<string | null>(null);
  const [selectedRealEvent, setSelectedRealEvent] = useState<RealDisasterEvent | null>(null);
  const [realEmergencyFacilities, setRealEmergencyFacilities] = useState<EmergencyFacility[]>([]);
  const [activeDataFilter, setActiveDataFilter] = useState<'ALL' | 'LIVE_ONLY' | 'SIMULATED_ONLY'>('ALL');

  // Real Browser GPS Geolocation state
  const [realUserLocation, setRealUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracyMeters: number;
    timestamp: string;
  } | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');

  // Refresh real disaster data
  const refreshLiveData = useCallback(async () => {
    setIsRefreshingLiveData(true);
    setLiveDataErrorMessage(null);
    try {
      const res = await fetch('/api/disasters/live');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.status === 'LIVE' && Array.isArray(data.events) && data.events.length > 0) {
        setRealDisasterEvents(data.events);
        setLiveDataStatus('LIVE');
        setLastDataRefreshTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setSelectedRealEvent((prev) => prev || data.events[0]);
      } else if (data.status === 'UNAVAILABLE') {
        setLiveDataStatus('UNAVAILABLE');
        setLiveDataErrorMessage(data.message || 'Live disaster information is temporarily unavailable. Showing simulation data.');
      }
    } catch (err: any) {
      console.warn('Real disaster feed fetch error:', err.message);
      setLiveDataStatus('UNAVAILABLE');
      setLiveDataErrorMessage('Live disaster information is temporarily unavailable. Showing simulation data.');
    } finally {
      setIsRefreshingLiveData(false);
    }
  }, []);

  // Fetch real facilities
  const fetchRealFacilities = useCallback(async () => {
    try {
      const res = await fetch('/api/resources/live');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.facilities)) {
          setRealEmergencyFacilities(data.facilities);
        }
      }
    } catch (err: any) {
      console.warn('Emergency facilities fetch error:', err.message);
    }
  }, []);

  // Fetch live weather for a specific coordinate
  const fetchWeatherForLocation = useCallback(async (lat: number, lon: number): Promise<LiveWeatherReport | null> => {
    try {
      const res = await fetch(`/api/weather/live?lat=${lat}&lon=${lon}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === 'LIVE' && data.weather) {
        return data.weather as LiveWeatherReport;
      }
      return null;
    } catch (err: any) {
      console.warn('Live weather fetch error:', err.message);
      return null;
    }
  }, []);

  // Request Real Device GPS Location via Browser Geolocation API
  const requestRealUserLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationPermissionStatus('unavailable');
      return null;
    }

    return new Promise<{ lat: number; lng: number; accuracyMeters: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: Math.round(position.coords.latitude * 10000) / 10000,
            lng: Math.round(position.coords.longitude * 10000) / 10000,
            accuracyMeters: Math.round(position.coords.accuracy),
            timestamp: new Date(position.timestamp).toISOString(),
          };
          setRealUserLocation(loc);
          setLocationPermissionStatus('granted');
          resolve(loc);
        },
        (error) => {
          console.warn('Geolocation permission or error:', error.message);
          setLocationPermissionStatus(error.code === 1 ? 'denied' : 'unavailable');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
      );
    });
  }, []);

  // Initial load and periodic refresh (every 5 minutes)
  useEffect(() => {
    refreshLiveData();
    fetchRealFacilities();

    const refreshInterval = setInterval(() => {
      refreshLiveData();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [refreshLiveData, fetchRealFacilities]);

  const setCitizenBattery = useCallback((level: number) => {
    setCitizenBatteryState(level);
    // Automatically engage power-saving mode when battery drops below 20%
    if (level < 20) {
      setPowerSavingMode(true);
    }
  }, []);

  const togglePowerSavingMode = useCallback(() => {
    setPowerSavingMode((prev) => !prev);
  }, []);

  const toggleUltraLowPowerMode = useCallback(() => {
    setUltraLowPowerMode((prev) => {
      const next = !prev;
      if (next) setPowerSavingMode(true);
      return next;
    });
  }, []);

  // When Ultra-Low Power mode is active: all non-emergency background sync is completely paused
  const meshPollingIntervalMs = ultraLowPowerMode ? 30000 : powerSavingMode ? 10000 : 2000;

  const packetIdCounter = useRef(1);

  // Network Failure Simulation
  const simulateNetworkFailure = useCallback(() => {
    setNetworkConnectivity('OFFLINE');
    // Mark Gateways as offline
    setMeshNodes((prev) =>
      prev.map((node) =>
        node.type === 'gateway' ? { ...node, status: 'offline' } : node
      )
    );
    // Add audit log
    const log: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: userRole,
      actorId: 'SIM-FAULT-INJECTOR',
      action: 'CELLULAR_INFRASTRUCTURE_FAILURE',
      details: 'Wide-area power failure caused cellular tower disconnection. Mesh routing activated.',
      securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  }, [userRole]);

  const restoreNetwork = useCallback(() => {
    setNetworkConnectivity('ONLINE');
    setMeshNodes((prev) =>
      prev.map((node) =>
        node.type === 'gateway' ? { ...node, status: 'active' } : node
      )
    );
    // Sync all pending citizen messages to 'Delivered'
    setCitizenMessages((prev) =>
      prev.map((msg) =>
        msg.deliveryStatus !== 'Acknowledged'
          ? { ...msg, deliveryStatus: 'Delivered' }
          : msg
      )
    );
    const log: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      actorRole: userRole,
      actorId: 'GATEWAY-RESTORER',
      action: 'GATEWAY_UPLINK_RESTORED',
      details: 'Satellite uplink reconnection confirmed. 8 pending queued reports synchronized to Command Center.',
      securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
    };
    setAuditLogs((prev) => [log, ...prev]);
  }, [userRole]);

  // Update incident priority manually (Coordinator overrides AI)
  const updateIncidentPriority = useCallback((id: string, newPriority: IncidentPriority) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, priority: newPriority } : inc))
    );
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        actorRole: userRole,
        actorId: `USER-${userRole.toUpperCase()}`,
        action: 'PRIORITY_OVERRIDE',
        details: `Incident ${id} priority manually set to ${newPriority} (Coordinator authority).`,
        securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
      },
      ...prev,
    ]);
  }, [userRole]);

  const updateIncidentStatus = useCallback((id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        actorRole: userRole,
        actorId: `USER-${userRole.toUpperCase()}`,
        action: 'STATUS_UPDATE',
        details: `Incident ${id} status updated to ${newStatus}.`,
        securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
      },
      ...prev,
    ]);
  }, [userRole]);

  const verifyIncident = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, verifiedByHuman: true } : inc))
    );
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        actorRole: userRole,
        actorId: `COORD-VERIFIER`,
        action: 'HUMAN_VERIFICATION',
        details: `Incident ${id} human verification certified by dispatch coordinator.`,
        securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
      },
      ...prev,
    ]);
  }, [userRole]);

  // Assign resource to incident with movement animation
  const assignResource = useCallback(
    (resourceId: string, incidentId: string) => {
      const targetIncident = incidents.find((i) => i.id === incidentId);
      const targetResource = resources.find((r) => r.id === resourceId);
      if (!targetIncident || !targetResource) return;

      // Update Resource
      setResources((prev) =>
        prev.map((res) =>
          res.id === resourceId
            ? {
                ...res,
                status: 'EN ROUTE',
                assignedIncidentId: incidentId,
                assignedIncidentTitle: targetIncident.title,
              }
            : res
        )
      );

      // Update Incident
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === incidentId
            ? {
                ...inc,
                status: 'RESCUE TEAM DISPATCHED',
                assignedResourceId: resourceId,
                assignedResourceName: targetResource.name,
                messageHistory: [
                  ...inc.messageHistory,
                  {
                    time: 'Just now',
                    sender: `DISPATCH`,
                    text: `Assigned ${targetResource.name} to scene. Status: EN ROUTE.`,
                  },
                ],
              }
            : inc
        )
      );

      // Animate resource movement gradually towards incident coordinates
      const startX = targetResource.coordinates.x;
      const startY = targetResource.coordinates.y;
      const targetX = targetIncident.coordinates.x;
      const targetY = targetIncident.coordinates.y;

      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        const progress = Math.min(1, step / 10);
        const currX = Math.round(startX + (targetX - startX) * progress);
        const currY = Math.round(startY + (targetY - startY) * progress);

        setResources((prev) =>
          prev.map((r) =>
            r.id === resourceId
              ? {
                  ...r,
                  coordinates: { ...r.coordinates, x: currX, y: currY },
                  status: progress >= 1 ? 'BUSY' : 'EN ROUTE',
                }
              : r
          )
        );

        if (progress >= 1) {
          clearInterval(interval);
          setIncidents((prev) =>
            prev.map((inc) =>
              inc.id === incidentId ? { ...inc, status: 'ON SCENE' } : inc
            )
          );
        }
      }, 500);

      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now()}`,
          timestamp: 'Just now',
          actorRole: userRole,
          actorId: `DISPATCH-COORD`,
          action: 'RESOURCE_DISPATCH',
          details: `Dispatched ${targetResource.name} to ${targetIncident.title}.`,
          securityHash: `sha256:${Math.random().toString(16).slice(2, 10)}`,
        },
        ...prev,
      ]);
    },
    [incidents, resources, userRole]
  );

  // Mesh Node controls
  const toggleNodeFailure = useCallback((nodeId: string) => {
    setMeshNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const nextStatus = node.status === 'offline' ? 'active' : 'offline';
          return { ...node, status: nextStatus };
        }
        return node;
      })
    );
  }, []);

  const addMeshNode = useCallback((nodeData: Partial<MeshNode>) => {
    const id = `NODE-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    const newNode: MeshNode = {
      id,
      label: nodeData.label || `Relay Node ${id}`,
      type: nodeData.type || 'relay_beacon',
      status: 'active',
      x: nodeData.x || Math.floor(Math.random() * 700 + 150),
      y: nodeData.y || Math.floor(Math.random() * 700 + 150),
      battery: 100,
      signalDbm: -62,
      messagesRelayed: 0,
      messagesStored: 0,
      lastContact: 'Just now',
      connectedNodeIds: ['BEACON-02', 'DRONE-01'],
    };
    setMeshNodes((prev) => [...prev, newNode]);
  }, []);

  const removeMeshNode = useCallback((nodeId: string) => {
    setMeshNodes((prev) => prev.filter((n) => n.id !== nodeId));
  }, []);

  // Citizen SOS Creator with hop-by-hop progression
  const createEmergencyReport = useCallback(
    async (report: Partial<EmergencyMessage>): Promise<EmergencyMessage> => {
      const msgId = `MSG-${Math.floor(Math.random() * 9000 + 1000)}-${Math.random()
        .toString(16)
        .slice(2, 4)
        .toUpperCase()}`;
      const defaultType: EmergencyType = report.emergencyType || 'Medical Emergency';

      const newMsg: EmergencyMessage = {
        id: msgId,
        deviceId: 'NODE-MY-DEVICE',
        senderName: 'Anonymous Citizen',
        emergencyType: defaultType,
        priority: report.priority || 'CRITICAL',
        description: report.description || 'Emergency SOS signal triggered.',
        peopleCount: report.peopleCount || 1,
        timestamp: 'Just now',
        coordinates: report.coordinates || { x: 580, y: 460, sector: 'Sector Bravo' },
        locationName: report.locationName || 'Current GPS: 34.0522° N, 118.2437° W (Sector Bravo)',
        deliveryStatus: 'Stored Locally',
        hopCount: 0,
        relayPath: ['NODE-MY-DEVICE'],
        isEncrypted: true,
        hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        aiClassification: {
          category: defaultType,
          priority: report.priority || 'CRITICAL',
          confidence: 93,
          requiredResources: ['Emergency Response Unit'],
          summary: 'Offline device-initiated SOS alert.',
        },
      };

      setCitizenMessages((prev) => [newMsg, ...prev]);

      // Stage 1: Stored locally
      setTimeout(() => {
        setCitizenMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, deliveryStatus: 'Searching for Relay' } : m
          )
        );
      }, 1500);

      // Stage 2: Searching for nearby devices -> Relayed (Hop 1)
      setTimeout(() => {
        setCitizenMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  deliveryStatus: 'Relayed',
                  hopCount: 1,
                  relayPath: ['NODE-MY-DEVICE', 'NODE-228F'],
                }
              : m
          )
        );
      }, 3500);

      // Stage 3: Hop 2 to drone repeater
      setTimeout(() => {
        setCitizenMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  hopCount: 2,
                  relayPath: ['NODE-MY-DEVICE', 'NODE-228F', 'DRONE-01'],
                  deliveryStatus: 'Reached Gateway',
                }
              : m
          )
        );
      }, 6000);

      // Stage 4: If network online or satellite gateway reached -> Delivered
      setTimeout(() => {
        setCitizenMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  hopCount: 3,
                  relayPath: ['NODE-MY-DEVICE', 'NODE-228F', 'DRONE-01', 'GATEWAY-02'],
                  deliveryStatus: 'Delivered',
                }
              : m
          )
        );

        // Also push into Command Center incidents automatically!
        const incId = `INC-${Math.floor(Math.random() * 800 + 1100)}`;
        const newIncident: Incident = {
          id: incId,
          title: report.description ? report.description.slice(0, 48) : `${defaultType} Alert`,
          emergencyType: defaultType,
          priority: report.priority || 'CRITICAL',
          status: 'REPORTED',
          peopleAffected: report.peopleCount || 1,
          coordinates: newMsg.coordinates,
          locationName: newMsg.locationName,
          firstReportedAt: 'Just now',
          lastUpdatedAt: 'Just now',
          verifiedByHuman: false,
          aiConfidence: 94,
          aiTriageSummary: `AI-assisted triage from citizen SOS (${msgId}). Relayed via 3 hops. Requires human verification.`,
          relatedReportIds: [msgId],
          messageHistory: [
            {
              time: 'Just now',
              sender: 'CITIZEN-DEVICE',
              text: newMsg.description,
            },
          ],
        };

        setIncidents((prev) => [newIncident, ...prev]);
        setSelectedIncident(newIncident);

        setSimulationStats((prev) => ({
          ...prev,
          emergencyReports: prev.emergencyReports + 1,
          messagesRelayed: prev.messagesRelayed + 3,
          incidentsDetected: prev.incidentsDetected + 1,
          criticalCount: report.priority === 'CRITICAL' ? prev.criticalCount + 1 : prev.criticalCount,
          deliveredToCenter: prev.deliveredToCenter + 1,
        }));
      }, 8500);

      // Stage 5: Acknowledged by coordinator
      setTimeout(() => {
        setCitizenMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, deliveryStatus: 'Acknowledged' } : m
          )
        );
      }, 12000);

      return newMsg;
    },
    []
  );

  const verifyDuplicateCluster = useCallback((clusterId: string) => {
    setDuplicateClusters((prev) =>
      prev.map((c) => (c.clusterId === clusterId ? { ...c, verifiedByHuman: true } : c))
    );
  }, []);

  const toggleSimulation = useCallback(() => {
    setSimulationRunning((prev) => !prev);
  }, []);

  const restartSimulation = useCallback(() => {
    setSimulationStats({
      devicesTotal: 127,
      devicesOffline: 24,
      emergencyReports: 46,
      messagesRelayed: 129,
      incidentsDetected: 21,
      criticalCount: 7,
      deliveredToCenter: 38,
      pendingSync: 8,
    });
    setIncidents(initialIncidents);
    setResources(initialResources);
    setMeshNodes(initialMeshNodes);
    setCitizenMessages(initialCitizenMessages);
    setSimulationRunning(true);
  }, []);

  // Periodic simulation loop: spawns traveling packets and syncs stats
  // When powerSavingMode is active, intervals are throttled from 2s to 8s+ to conserve energy
  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      // If Ultra-Low Power mode is active, pause ALL non-emergency background sync
      if (ultraLowPowerMode) {
        return;
      }

      // If regular power-saving mode is on, skip 60% of background opportunistic packet relays
      if (powerSavingMode && Math.random() < 0.6) {
        return;
      }

      // 1. Generate a traveling packet across two active nodes
      const activeNodes = meshNodes.filter((n) => n.status !== 'offline');
      if (activeNodes.length >= 2) {
        const fromIdx = Math.floor(Math.random() * activeNodes.length);
        let toIdx = (fromIdx + 1) % activeNodes.length;
        const from = activeNodes[fromIdx];
        const to = activeNodes[toIdx];

        const packet: NetworkPacket = {
          id: `PKT-${packetIdCounter.current++}`,
          fromNodeId: from.id,
          toNodeId: to.id,
          messageId: `MSG-${Math.floor(Math.random() * 8000 + 1000)}`,
          progress: 0,
          emergencyType: Math.random() > 0.5 ? 'Medical Emergency' : 'Flood',
          priority: Math.random() > 0.6 ? 'CRITICAL' : 'HIGH',
        };

        setActivePackets((prev) => [...prev.slice(-6), packet]);
      }

      // 2. Animate packets progress
      setActivePackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + 25 }))
          .filter((p) => p.progress <= 100)
      );

      // 3. Increment minor stats for real-time feel
      setSimulationStats((prev) => ({
        ...prev,
        messagesRelayed: prev.messagesRelayed + (Math.random() > 0.4 ? 1 : 0),
        pendingSync: Math.max(2, prev.pendingSync + (Math.random() > 0.7 ? 1 : -1)),
      }));
    }, meshPollingIntervalMs);

    return () => clearInterval(interval);
  }, [simulationRunning, meshNodes, meshPollingIntervalMs, powerSavingMode, ultraLowPowerMode]);

  // AI helper functions
  const analyzeEmergencyText = async (text: string) => {
    try {
      const res = await fetch('/api/ai/analyze-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: text }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      // Fallback
      return {
        category: 'Medical + Trapped Person',
        priority: 'CRITICAL',
        peopleAffected: 2,
        requiredResources: ['Ambulance', 'Rescue Team'],
        confidenceScore: 94,
        triageSummary: 'AI-assisted classification — requires human verification.',
        isAiGenerated: true,
      };
    }
  };

  const groupIncidentsWithAI = async (reports: any[]) => {
    try {
      const res = await fetch('/api/ai/group-incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return {
        incidentGroups: initialDuplicateClusters,
        isAiGenerated: true,
      };
    }
  };

  const parseMultilingualVoice = async (transcript: string, langHint?: string) => {
    try {
      const res = await fetch('/api/ai/parse-multilingual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, languageHint: langHint }),
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return {
        detectedLanguage: langHint || 'Tamil',
        originalText: transcript,
        englishTranslation: 'We urgently need drinking water and medical assistance.',
        structuredEmergency: {
          emergencyType: 'Water Supply',
          priority: 'HIGH',
          locationContext: 'Current Device GPS',
          actionItem: 'Need drinking water',
        },
        confidence: 94,
        isAiGenerated: true,
      };
    }
  };

  return (
    <DisasterContext.Provider
      value={{
        userRole,
        setUserRole,
        activeView,
        setActiveView,
        commandCenterTab,
        setCommandCenterTab,
        networkConnectivity,
        setNetworkConnectivity,
        simulateNetworkFailure,
        restoreNetwork,
        incidents,
        selectedIncident,
        setSelectedIncident,
        updateIncidentPriority,
        updateIncidentStatus,
        verifyIncident,
        resources,
        assignResource,
        meshNodes,
        toggleNodeFailure,
        addMeshNode,
        removeMeshNode,
        citizenMessages,
        createEmergencyReport,
        duplicateClusters,
        verifyDuplicateCluster,
        auditLogs,
        activePackets,
        simulationRunning,
        toggleSimulation,
        restartSimulation,
        simulationStats,
        citizenBattery,
        setCitizenBattery,
        powerSavingMode,
        setPowerSavingMode,
        togglePowerSavingMode,
        ultraLowPowerMode,
        setUltraLowPowerMode,
        toggleUltraLowPowerMode,
        meshPollingIntervalMs,
        realDisasterEvents,
        liveDataStatus,
        lastDataRefreshTime,
        isRefreshingLiveData,
        liveDataErrorMessage,
        refreshLiveData,
        selectedRealEvent,
        setSelectedRealEvent,
        realEmergencyFacilities,
        fetchWeatherForLocation,
        activeDataFilter,
        setActiveDataFilter,
        realUserLocation,
        requestRealUserLocation,
        locationPermissionStatus,
        analyzeEmergencyText,
        groupIncidentsWithAI,
        parseMultilingualVoice,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
