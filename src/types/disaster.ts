export type EmergencyType =
  | 'Medical Emergency'
  | 'Trapped Person'
  | 'Medical + Trapped Person'
  | 'Fire'
  | 'Flood'
  | 'Need Food/Water'
  | 'Structural Collapse'
  | 'Road Blockage'
  | 'Other';

export type IncidentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'REPORTED'
  | 'RESCUE TEAM DISPATCHED'
  | 'ON SCENE'
  | 'RESOLVED';

export type DeliveryStatus =
  | 'Stored Locally'
  | 'Searching for Relay'
  | 'Relayed'
  | 'Reached Gateway'
  | 'Delivered'
  | 'Acknowledged';

export type ResourceType =
  | 'Ambulance'
  | 'Rescue Boat'
  | 'Medical Team'
  | 'Food Supplies'
  | 'Water Tanker'
  | 'Shelter'
  | 'Rescue Personnel';

export type ResourceStatus = 'AVAILABLE' | 'EN ROUTE' | 'BUSY' | 'OFFLINE';

export type UserRole = 'Citizen' | 'Responder' | 'Coordinator' | 'Administrator';

export type NetworkConnectivity = 'ONLINE' | 'LIMITED' | 'OFFLINE';

export interface Coordinates {
  x: number; // 0 - 1000 for simulated map coordinate system
  y: number; // 0 - 1000
  lat?: number;
  lng?: number;
  sector: string;
}

export interface EmergencyMessage {
  id: string;
  deviceId: string;
  senderName?: string;
  emergencyType: EmergencyType;
  priority: IncidentPriority;
  description: string;
  peopleCount: number;
  timestamp: string;
  coordinates: Coordinates;
  locationName: string;
  deliveryStatus: DeliveryStatus;
  hopCount: number;
  relayPath: string[]; // device IDs traversed
  isEncrypted: boolean;
  hash: string;
  aiClassification?: {
    category: string;
    priority: IncidentPriority;
    confidence: number;
    requiredResources: string[];
    summary: string;
  };
}

export interface Incident {
  id: string;
  clusterId?: string;
  title: string;
  emergencyType: EmergencyType;
  priority: IncidentPriority;
  status: IncidentStatus;
  peopleAffected: number;
  coordinates: Coordinates;
  locationName: string;
  firstReportedAt: string;
  lastUpdatedAt: string;
  assignedResourceId?: string;
  assignedResourceName?: string;
  verifiedByHuman: boolean;
  aiConfidence: number;
  aiTriageSummary: string;
  relatedReportIds: string[];
  messageHistory: {
    time: string;
    sender: string;
    text: string;
  }[];
}

export interface DuplicateCluster {
  clusterId: string;
  title: string;
  primaryCategory: string;
  priority: IncidentPriority;
  estimatedPeopleAffected: number;
  confidenceScore: number;
  geographicProximityMeters: number;
  firstReported: string;
  latestUpdate: string;
  reports: {
    id: string;
    sourceDevice: string;
    time: string;
    rawText: string;
    reportedLocation: string;
  }[];
  synthesizedSummary: string;
  actionRecommended: string;
  verifiedByHuman: boolean;
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  coordinates: Coordinates;
  assignedIncidentId?: string;
  assignedIncidentTitle?: string;
  personnelCount: number;
  equipment: string[];
  batteryOrFuel: number; // 0 - 100%
  lastPing: string;
}

export interface MeshNode {
  id: string;
  label: string;
  type: 'citizen_phone' | 'relay_beacon' | 'drone_repeater' | 'gateway';
  status: 'active' | 'weak' | 'offline';
  x: number; // 0 - 1000 for graph layout
  y: number; // 0 - 1000
  battery: number;
  signalDbm: number;
  messagesRelayed: number;
  messagesStored: number;
  lastContact: string;
  connectedNodeIds: string[];
}

export interface NetworkPacket {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  messageId: string;
  progress: number; // 0 - 100%
  emergencyType: EmergencyType;
  priority: IncidentPriority;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorId: string;
  action: string;
  details: string;
  securityHash: string;
}

export type DataClassification = 'LIVE' | 'SIMULATED' | 'UNAVAILABLE';

export interface LiveWeatherReport {
  temperature: number;
  temperatureUnit: string;
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitation: number; // mm
  weatherCode: number;
  weatherCondition: string;
  relativeHumidity?: number;
  surfacePressure?: number;
  visibilityKm?: number;
  lastUpdated: string;
  source: string;
  isRealData: true;
}

export interface RealDisasterEvent {
  id: string;
  title: string;
  eventType: 'Earthquake' | 'Severe Weather' | 'Flood' | 'Wildfire' | 'Tsunami' | 'Storm' | 'Other';
  severity: IncidentPriority;
  status: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  source: string; // e.g., 'USGS Earthquake Hazards Program' or 'NOAA National Weather Service'
  sourceUrl: string;
  lastUpdated: string;
  isRealData: true;
  details?: string;
  magnitude?: number;
  depthKm?: number;
  tsunamiWarning?: boolean;
  weather?: LiveWeatherReport;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Emergency Shelter' | 'Fire Station' | 'Police Station' | 'Disaster Relief Hub' | 'Charging Facility';
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  generatorPower: boolean;
  solarMicrogrid: boolean;
  operationalStatus: 'OPERATIONAL' | 'LIMITED' | 'FULL_CAPACITY';
  sourceLabel: 'Verified from external data' | 'Demo/Simulation location';
  isRealData: boolean;
}
