import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { useDisaster } from '../context/DisasterContext';
import {
  Incident,
  EmergencyResource,
  IncidentPriority,
  EmergencyType,
  RealDisasterEvent,
  LiveWeatherReport,
  EmergencyFacility,
} from '../types/disaster';
import { disasterShelters, medicalFacilities } from '../data/mockDisasterData';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Shield,
  Layers,
  Sparkles,
  Send,
  Navigation,
  Anchor,
  X,
  Plus,
  Radio,
  Globe,
  CloudRain,
  Wind,
  Thermometer,
  ExternalLink,
  MapPin,
  Activity,
  Building2,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const LiveMap: React.FC = () => {
  const {
    incidents,
    resources,
    selectedIncident,
    setSelectedIncident,
    assignResource,
    updateIncidentPriority,
    updateIncidentStatus,
    verifyIncident,
    realDisasterEvents,
    liveDataStatus,
    lastDataRefreshTime,
    isRefreshingLiveData,
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
  } = useDisaster();

  // Map presentation mode: Real Geographic Map (Leaflet) vs Tactical Simulated Sector Grid
  const [mapMode, setMapMode] = useState<'GEOGRAPHIC' | 'MESH_SECTOR'>('GEOGRAPHIC');

  // Filter controls
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRealFacilities, setShowRealFacilities] = useState<boolean>(true);
  const [showSimulatedNodes, setShowSimulatedNodes] = useState<boolean>(true);

  // Selected Weather state for inspect drawer
  const [currentWeather, setCurrentWeather] = useState<LiveWeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);

  // Simulated Map Navigation & Zoom (for MESH_SECTOR mode)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Leaflet Map Refs
  const leafletDivRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Resource Assignment Modal (for simulated incidents)
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (mapMode !== 'GEOGRAPHIC' || !leafletDivRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to global/US centered view
      const map = L.map(leafletDivRef.current, {
        center: [34.0, -118.0],
        zoom: 4,
        zoomControl: false,
      });

      // CartoDB Dark Matter tiles (free, reliable, high-contrast dark tactical aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // Trigger resize calculation
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive across mode toggles if possible, or clean up on unmount
    };
  }, [mapMode]);

  // 2. Render Real Markers on Leaflet Map
  useEffect(() => {
    if (mapMode !== 'GEOGRAPHIC' || !mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // A. Real Disaster Markers (USGS & NOAA)
    if (activeDataFilter !== 'SIMULATED_ONLY') {
      const filteredReal = realDisasterEvents.filter((ev) => {
        if (eventTypeFilter !== 'ALL' && ev.eventType !== eventTypeFilter) return false;
        if (severityFilter !== 'ALL' && ev.severity !== severityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return ev.title.toLowerCase().includes(q) || ev.locationName.toLowerCase().includes(q);
        }
        return true;
      });

      filteredReal.forEach((event) => {
        if (typeof event.latitude !== 'number' || typeof event.longitude !== 'number') return;

        const isEarthquake = event.eventType === 'Earthquake';
        const color = event.severity === 'CRITICAL' ? '#ef4444' : event.severity === 'HIGH' ? '#f97316' : '#eab308';
        const iconSymbol = isEarthquake ? '💥' : event.eventType === 'Flood' ? '🌊' : event.eventType === 'Wildfire' ? '🔥' : '⛈️';

        const customIcon = L.divIcon({
          className: 'custom-real-disaster-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background-color: ${color}ee;
              border: 2px solid #ffffff;
              box-shadow: 0 0 16px ${color}aa;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              cursor: pointer;
              transition: transform 0.15s ease;
            ">
              ${iconSymbol}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon });

        marker.on('click', () => {
          setSelectedRealEvent(event);
          setSelectedIncident(null);
          // Fetch live weather for this location
          setIsLoadingWeather(true);
          fetchWeatherForLocation(event.latitude, event.longitude)
            .then((w) => setCurrentWeather(w))
            .finally(() => setIsLoadingWeather(false));
        });

        marker.bindTooltip(
          `<strong>${event.title}</strong><br/><span style="color:${color}">[${event.severity}]</span> · ${event.locationName}`,
          { direction: 'top', offset: [0, -14], className: 'map-custom-tooltip' }
        );

        layer.addLayer(marker);
      });
    }

    // B. Real Emergency Facilities (Hospitals & Shelters)
    if (showRealFacilities && activeDataFilter !== 'SIMULATED_ONLY') {
      realEmergencyFacilities.forEach((fac) => {
        const facIcon = L.divIcon({
          className: 'custom-facility-marker',
          html: `
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 8px;
              background-color: #0284c7;
              border: 1.5px solid #38bdf8;
              box-shadow: 0 0 10px #0284c788;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
            ">
              ${fac.type === 'Hospital' ? '🏥' : fac.type === 'Fire Station' ? '🚒' : '🏛️'}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([fac.latitude, fac.longitude], { icon: facIcon });
        marker.bindTooltip(
          `<strong>${fac.name}</strong><br/><span style="color:#38bdf8">${fac.type}</span> · ${fac.sourceLabel}`,
          { direction: 'top', offset: [0, -12] }
        );
        layer.addLayer(marker);
      });
    }

    // C. User Real GPS Location Marker (if available)
    if (realUserLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-gps-marker',
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: #38bdf8; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 20px; height: 20px; border-radius: 9999px; background-color: #0284c7; border: 3px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker([realUserLocation.lat, realUserLocation.lng], { icon: userIcon });
      userMarker.bindTooltip('<strong>You Are Here</strong><br/>Real Device Location (GPS)', { permanent: false, direction: 'top' });
      layer.addLayer(userMarker);

      // Accuracy circle
      const circle = L.circle([realUserLocation.lat, realUserLocation.lng], {
        radius: realUserLocation.accuracyMeters,
        color: '#0284c7',
        fillColor: '#38bdf8',
        fillOpacity: 0.15,
        weight: 1,
      });
      layer.addLayer(circle);
    }
  }, [
    mapMode,
    realDisasterEvents,
    realEmergencyFacilities,
    realUserLocation,
    eventTypeFilter,
    severityFilter,
    searchQuery,
    showRealFacilities,
    activeDataFilter,
    fetchWeatherForLocation,
    setSelectedRealEvent,
    setSelectedIncident,
  ]);

  // Handle fly to user GPS location
  const handleLocateMe = async () => {
    const loc = await requestRealUserLocation();
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 12, { duration: 1.5 });
    }
  };

  // Zoom handlers for Leaflet Map
  const handleLeafletZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  const handleResetLeaflet = () => {
    if (mapInstanceRef.current) {
      if (realDisasterEvents.length > 0) {
        mapInstanceRef.current.flyTo([realDisasterEvents[0].latitude, realDisasterEvents[0].longitude], 5);
      } else {
        mapInstanceRef.current.flyTo([34.0, -118.0], 4);
      }
    }
  };

  // When selected real event changes, load weather
  useEffect(() => {
    if (selectedRealEvent) {
      setIsLoadingWeather(true);
      fetchWeatherForLocation(selectedRealEvent.latitude, selectedRealEvent.longitude)
        .then((w) => setCurrentWeather(w))
        .finally(() => setIsLoadingWeather(false));
    }
  }, [selectedRealEvent, fetchWeatherForLocation]);

  // Pan handlers for Simulated Sector Grid Mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.map-marker') || (e.target as HTMLElement).closest('.map-control')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#eab308';
      case 'LOW':
        return '#10b981';
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-8.5rem)] flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode Toggle & Data Source Transparency */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Map Presentation Mode Switcher */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-1">
            <button
              onClick={() => setMapMode('GEOGRAPHIC')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'GEOGRAPHIC'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Real Geographic Map (OSM)</span>
            </button>

            <button
              onClick={() => setMapMode('MESH_SECTOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mapMode === 'MESH_SECTOR'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Mesh Sector Drill Grid</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-2 w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={mapMode === 'GEOGRAPHIC' ? 'Search live earthquakes/alerts...' : 'Search local sector incident...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          {/* Filter Pills */}
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl text-xs">
            <button
              onClick={() => setEventTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl font-medium transition-colors ${
                eventTypeFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setEventTypeFilter('Earthquake')}
              className={`px-2.5 py-1 rounded-xl font-medium transition-colors ${
                eventTypeFilter === 'Earthquake' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              💥 Earthquakes
            </button>
            <button
              onClick={() => setEventTypeFilter('Severe Weather')}
              className={`px-2.5 py-1 rounded-xl font-medium transition-colors ${
                eventTypeFilter === 'Severe Weather' ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              ⛈️ Weather
            </button>
            <button
              onClick={() => setEventTypeFilter('Flood')}
              className={`px-2.5 py-1 rounded-xl font-medium transition-colors ${
                eventTypeFilter === 'Flood' ? 'bg-blue-950 text-blue-300 border border-blue-800 font-bold' : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              🌊 Floods
            </button>
          </div>
        </div>

        {/* Right: GPS Location, Zoom, and Refresh */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Locate My Real GPS */}
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-cyan-300 border border-slate-800 text-xs font-semibold shadow-xl transition-colors"
            title="Locate device using Browser Geolocation API"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {locationPermissionStatus === 'granted' ? 'GPS Locked' : 'Locate Me'}
            </span>
          </button>

          {/* Zoom & Reset Controls */}
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-1">
            <button
              onClick={() => (mapMode === 'GEOGRAPHIC' ? handleLeafletZoom(1) : setZoom((z) => Math.min(2.2, z + 0.2)))}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => (mapMode === 'GEOGRAPHIC' ? handleLeafletZoom(-1) : setZoom((z) => Math.max(0.7, z - 0.2)))}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => (mapMode === 'GEOGRAPHIC' ? handleResetLeaflet() : setPan({ x: 0, y: 0 }))}
              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Rendering Area */}
      {mapMode === 'GEOGRAPHIC' ? (
        /* Real Interactive Leaflet / OpenStreetMap Canvas */
        <div className="relative w-full h-full">
          <div ref={leafletDivRef} className="w-full h-full z-10" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 shadow-2xl">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>Map Data Transparency</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span>Critical Event (USGS M6.0+ / NOAA Extreme)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span>High Alert (USGS M4.5+ / NOAA Severe)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-3 h-3 rounded-lg bg-sky-600 inline-block"></span>
              <span>Verified Emergency Facility (OpenStreetMap)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block ring-2 ring-white"></span>
              <span>Your Real Device GPS (Browser Geolocation)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Tactical Mesh Sector Simulation Canvas */
        <div
          ref={mapContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 relative cursor-grab select-none ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            background: 'radial-gradient(ellipse at center, #0d1527 0%, #060913 100%)',
          }}
        >
          {/* Watermark Notice */}
          <div className="absolute top-20 left-4 z-20 bg-amber-950/80 border border-amber-700/80 px-3 py-1.5 rounded-xl text-amber-200 text-xs font-mono">
            🟡 SIMULATION MODE: Sector Alpha-Delta Disaster Drill
          </div>

          <div
            className="absolute inset-0 w-full h-full transition-transform duration-75 origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Grid & Waterways SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000">
              <defs>
                <pattern id="gridPattern" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeOpacity="0.4" />
                </pattern>
              </defs>
              <rect width="1000" height="1000" fill="url(#gridPattern)" />
              <line x1="500" y1="0" x2="500" y2="1000" stroke="#334155" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.4" />
              <line x1="0" y1="500" x2="1000" y2="500" stroke="#334155" strokeWidth="1.5" strokeDasharray="8 6" strokeOpacity="0.4" />
              <text x="250" y="40" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                SECTOR ALPHA · NORTH RIVERFRONT
              </text>
              <text x="750" y="40" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                SECTOR CHARLIE · EASTERN HILLS
              </text>
              <text x="250" y="980" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                SECTOR DELTA · SOUTH LOWLANDS
              </text>
              <text x="750" y="980" fill="#475569" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="4">
                SECTOR BRAVO · URBAN DOWNTOWN
              </text>
            </svg>

            {/* Simulated Incident Markers */}
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              const markerColor = getPriorityColor(incident.priority);

              return (
                <div
                  key={incident.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncident(incident);
                    setSelectedRealEvent(null);
                  }}
                  style={{
                    left: `${incident.coordinates.x / 10}%`,
                    top: `${incident.coordinates.y / 10}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 map-marker cursor-pointer group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 ${
                      isSelected ? 'scale-125 ring-4 ring-cyan-400 z-30' : 'group-hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: markerColor,
                      boxShadow: `0 0 16px ${markerColor}66`,
                    }}
                  >
                    <span className="text-white text-xs font-bold">
                      {incident.emergencyType === 'Medical Emergency'
                        ? '✚'
                        : incident.emergencyType === 'Flood'
                        ? '🌊'
                        : incident.emergencyType === 'Fire'
                        ? '🔥'
                        : '⚠'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-out Inspection Drawer: Real Disaster Event Information & Real Weather */}
      {selectedRealEvent && (
        <div className="absolute top-16 right-4 bottom-4 w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/60 rounded-3xl shadow-2xl p-5 z-40 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  🟢 LIVE DATA
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedRealEvent.source.split(' ')[0]} Official
                </span>
              </div>
              <button
                onClick={() => setSelectedRealEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Title & Severity */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded font-bold text-xs"
                  style={{
                    color: getPriorityColor(selectedRealEvent.severity),
                    backgroundColor: `${getPriorityColor(selectedRealEvent.severity)}1a`,
                  }}
                >
                  {selectedRealEvent.severity}
                </span>
                <span className="text-xs text-slate-300 font-semibold">{selectedRealEvent.eventType}</span>
                {selectedRealEvent.magnitude && (
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    Mag: {selectedRealEvent.magnitude}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white leading-snug">{selectedRealEvent.title}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedRealEvent.locationName}</span>
              </p>
            </div>

            {/* Geographic & Technical Telemetry */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Latitude:</span>
                <span className="text-white">{selectedRealEvent.latitude.toFixed(4)}° N</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Longitude:</span>
                <span className="text-white">{selectedRealEvent.longitude.toFixed(4)}° E</span>
              </div>
              {selectedRealEvent.depthKm !== undefined && (
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Focal Depth:</span>
                  <span className="text-cyan-300">{selectedRealEvent.depthKm} km</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300 text-[11px]">{new Date(selectedRealEvent.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Official Status:</span>
                <span className="text-emerald-400">{selectedRealEvent.status}</span>
              </div>
            </div>

            {/* REAL WEATHER BOX (Fetched from Open-Meteo for this location) */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real Atmospheric Weather</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-semibold">
                  🟢 LIVE (Open-Meteo)
                </span>
              </div>

              {isLoadingWeather ? (
                <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Retrieving live meteorological telemetry...</span>
                </div>
              ) : currentWeather ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white font-mono">
                      {currentWeather.temperature}{currentWeather.temperatureUnit}
                    </span>
                    <span className="text-xs text-cyan-300 font-medium px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {currentWeather.weatherCondition}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                      <Wind className="w-3 h-3 text-slate-400" />
                      <span>Wind: {currentWeather.windSpeed} km/h</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                      <CloudRain className="w-3 h-3 text-slate-400" />
                      <span>Rain: {currentWeather.precipitation} mm</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Model: {currentWeather.source}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-1">
                  Live weather information is temporarily unavailable for this coordinate.
                </div>
              )}
            </div>

            {/* Official Source Attribution & External Link */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                Source Attribution
              </div>
              <p className="text-xs text-slate-300 font-semibold">{selectedRealEvent.source}</p>
              <a
                href={selectedRealEvent.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Official Agency Bulletin</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Inspection Drawer: Simulated Incident Information */}
      {selectedIncident && (
        <div className="absolute top-16 right-4 bottom-4 w-96 bg-slate-900/95 backdrop-blur-xl border border-amber-700/60 rounded-3xl shadow-2xl p-5 z-40 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[10px] font-bold">
                  🟡 SIMULATION INCIDENT
                </span>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {selectedIncident.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">{selectedIncident.title}</h3>

            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              <span
                className="px-2 py-0.5 rounded font-bold"
                style={{
                  color: getPriorityColor(selectedIncident.priority),
                  backgroundColor: `${getPriorityColor(selectedIncident.priority)}1a`,
                }}
              >
                {selectedIncident.priority}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {selectedIncident.emergencyType}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                {selectedIncident.peopleAffected} Victims
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-4 text-xs space-y-2">
              <div className="font-semibold text-slate-300">AI Triage Summary</div>
              <p className="text-slate-400 leading-relaxed">{selectedIncident.aiTriageSummary}</p>
              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                Confidence: {selectedIncident.aiConfidence}% (AI Estimate · Requires Human Verification)
              </div>
            </div>

            <div className="text-[11px] text-slate-400 p-2 rounded-xl bg-amber-950/40 border border-amber-900/60 leading-tight">
              Notice: This simulated incident is used for local disaster mesh protocol training.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
