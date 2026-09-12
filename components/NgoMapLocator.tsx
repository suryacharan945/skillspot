import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NGO, GeoCoordinates } from '../types';

interface NgoMapLocatorProps {
  ngos: NGO[];
  onSelectNgo?: (ngo: NGO) => void;
}

// Preset hub cities for quick proximity testing
const PRESET_CITIES = [
  { name: 'San Francisco, CA', coords: { lat: 37.7749, lng: -122.4194 } },
  { name: 'Chicago, IL', coords: { lat: 41.8781, lng: -87.6298 } },
  { name: 'Austin, TX', coords: { lat: 30.2672, lng: -97.7431 } },
  { name: 'Seattle, WA', coords: { lat: 47.6062, lng: -122.3321 } },
  { name: 'New York, NY', coords: { lat: 40.7128, lng: -74.0060 } },
];

// Haversine distance formula in miles
function calculateDistanceMiles(coord1: GeoCoordinates, coord2: GeoCoordinates): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Map coordinates to SVG canvas bounds (US bounding box approx: Lat 24-50, Lng -125 to -66)
function projectCoordinatesToSvg(lat: number, lng: number, width = 800, height = 480) {
  const minLat = 24.0;
  const maxLat = 50.0;
  const minLng = -125.0;
  const maxLng = -66.0;

  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return { x: Math.max(40, Math.min(width - 40, x)), y: Math.max(40, Math.min(height - 40, y)) };
}

const NgoMapLocator: React.FC<NgoMapLocatorProps> = ({ ngos }) => {
  // Current user reference location (Default: San Francisco)
  const [userLocation, setUserLocation] = useState<GeoCoordinates>({
    lat: 37.7749,
    lng: -122.4194
  });
  const [locationName, setLocationName] = useState('San Francisco, CA');
  const [maxDistance, setMaxDistance] = useState<number>(2000); // 2000 = show all initially
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(ngos[0]?.id || null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Fallback coordinates generator if an NGO does not have explicit lat/lng
  const getCoordinates = (ngo: NGO): GeoCoordinates => {
    if (ngo.coordinates) return ngo.coordinates;
    if (ngo.location.includes('Francisco')) return { lat: 37.7749, lng: -122.4194 };
    if (ngo.location.includes('Chicago')) return { lat: 41.8781, lng: -87.6298 };
    if (ngo.location.includes('Austin')) return { lat: 30.2672, lng: -97.7431 };
    if (ngo.location.includes('Seattle')) return { lat: 47.6062, lng: -122.3321 };
    return { lat: 40.7128, lng: -74.0060 };
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setLocationName('Your Current GPS Location');
        setIsDetecting(false);
        setMaxDistance(50); // Default to 50 miles when using GPS
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGeoError('Unable to retrieve your location. Selected San Francisco as default.');
        setIsDetecting(false);
      },
      { timeout: 8000 }
    );
  };

  // Calculate distance for all NGOs and sort
  const ngosWithDistance = useMemo(() => {
    return ngos.map(ngo => {
      const coords = getCoordinates(ngo);
      const distance = calculateDistanceMiles(userLocation, coords);
      return {
        ...ngo,
        computedCoords: coords,
        distanceMiles: distance
      };
    }).sort((a, b) => a.distanceMiles - b.distanceMiles);
  }, [ngos, userLocation]);

  // Filter by distance
  const filteredNgos = useMemo(() => {
    if (maxDistance >= 2000) return ngosWithDistance;
    return ngosWithDistance.filter(ngo => ngo.distanceMiles <= maxDistance);
  }, [ngosWithDistance, maxDistance]);

  const activeSelectedNgo = useMemo(() => {
    return ngosWithDistance.find(n => n.id === selectedNgoId) || ngosWithDistance[0];
  }, [selectedNgoId, ngosWithDistance]);

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Interactive NGO Map & Distance Locator
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Find community-based vocational training hubs nearest to your hometown or workspace.
            </p>
          </div>

          {/* Quick presets & GPS button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 flex items-center space-x-1.5 transition-colors"
            >
              <svg className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{isDetecting ? 'Locating...' : 'Use My GPS'}</span>
            </button>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span className="hidden sm:inline">Or select city:</span>
              <select
                value={locationName}
                onChange={(e) => {
                  const city = PRESET_CITIES.find(c => c.name === e.target.value);
                  if (city) {
                    setUserLocation(city.coords);
                    setLocationName(city.name);
                  }
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {PRESET_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {geoError && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            {geoError}
          </p>
        )}

        {/* Distance Range Filter Pills */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Max Distance:</span>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-1">
              {[
                { label: 'Within 25 mi', val: 25 },
                { label: 'Within 50 mi', val: 50 },
                { label: 'Within 100 mi', val: 100 },
                { label: 'Within 500 mi', val: 500 },
                { label: 'Nationwide (All)', val: 2000 },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setMaxDistance(opt.val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    maxDistance === opt.val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing <strong className="text-blue-600 dark:text-blue-400">{filteredNgos.length}</strong> of {ngos.length} NGOs relative to <span className="font-semibold text-gray-700 dark:text-gray-300">{locationName}</span>
          </div>
        </div>
      </div>

      {/* Map + Proximity List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Geographic Pin Cluster ({filteredNgos.length} active hubs)
            </span>
            <div className="flex items-center space-x-3 text-[11px] text-gray-500">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-1"></span> NGO Center</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></span> Your Origin</span>
            </div>
          </div>

          <div className="relative w-full h-[420px] bg-slate-900 overflow-hidden flex items-center justify-center select-none">
            {/* SVG Interactive Map Surface */}
            <svg
              className="w-full h-full"
              viewBox="0 0 800 480"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Radial gradient background for geographic map container */}
                <radialGradient id="mapBg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
                {/* Glow filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="800" height="480" fill="url(#mapBg)" />

              {/* Grid Lines for technical geographic radar feel */}
              {[100, 200, 300, 400, 500, 600, 700].map(x => (
                <line key={`grid-x-${x}`} x1={x} y1="0" x2={x} y2="480" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}
              {[80, 160, 240, 320, 400].map(y => (
                <line key={`grid-y-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}

              {/* Stylized US Outline Silhouette Path */}
              <path
                d="M 120 120 Q 200 110 320 115 Q 480 130 680 140 Q 720 190 730 250 Q 700 320 620 380 Q 480 410 380 400 Q 280 410 180 360 Q 110 300 100 220 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="2"
                opacity="0.6"
              />

              {/* Connection Lines from User Location to NGOs */}
              {filteredNgos.map(ngo => {
                const userPt = projectCoordinatesToSvg(userLocation.lat, userLocation.lng);
                const ngoPt = projectCoordinatesToSvg(ngo.computedCoords.lat, ngo.computedCoords.lng);
                const isSelected = selectedNgoId === ngo.id;
                return (
                  <line
                    key={`line-${ngo.id}`}
                    x1={userPt.x}
                    y1={userPt.y}
                    x2={ngoPt.x}
                    y2={ngoPt.y}
                    stroke={isSelected ? '#60a5fa' : '#475569'}
                    strokeWidth={isSelected ? '2' : '1'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                    opacity={isSelected ? 0.9 : 0.4}
                  />
                );
              })}

              {/* User Location Origin Pin */}
              {(() => {
                const pt = projectCoordinatesToSvg(userLocation.lat, userLocation.lng);
                return (
                  <g transform={`translate(${pt.x}, ${pt.y})`}>
                    <circle r="16" fill="#10b981" opacity="0.25" className="animate-ping" />
                    <circle r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text y="-14" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                      You ({locationName.split(',')[0]})
                    </text>
                  </g>
                );
              })()}

              {/* NGO Pins */}
              {filteredNgos.map(ngo => {
                const pt = projectCoordinatesToSvg(ngo.computedCoords.lat, ngo.computedCoords.lng);
                const isSelected = selectedNgoId === ngo.id;
                return (
                  <g
                    key={ngo.id}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    onClick={() => setSelectedNgoId(ngo.id)}
                    className="cursor-pointer transition-transform duration-200"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  >
                    {isSelected && (
                      <circle r="22" fill="#3b82f6" opacity="0.3" className="animate-pulse" />
                    )}
                    <circle
                      r={isSelected ? 12 : 9}
                      fill={isSelected ? '#3b82f6' : '#6366f1'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      filter="url(#glow)"
                    />
                    <text
                      y={isSelected ? -16 : -13}
                      textAnchor="middle"
                      fill={isSelected ? '#93c5fd' : '#e2e8f0'}
                      fontSize={isSelected ? '11' : '9.5'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {ngo.name}
                    </text>
                    <text
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {ngo.courses?.length || 0}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected NGO Floating Detail Banner on the map */}
            {activeSelectedNgo && (
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {activeSelectedNgo.type}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      📍 {activeSelectedNgo.distanceMiles} miles away
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">
                    {activeSelectedNgo.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeSelectedNgo.address || activeSelectedNgo.location} • {activeSelectedNgo.courses?.length || 0} active accredited courses
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent((activeSelectedNgo.address || activeSelectedNgo.location))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Directions
                  </a>
                  <Link
                    to={`/ngo/${activeSelectedNgo.id}`}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center"
                  >
                    <span>View Courses</span>
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proximity Sorted NGO List */}
        <div className="lg:col-span-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            Nearest NGOs ({filteredNgos.length})
          </div>

          {filteredNgos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No NGOs within {maxDistance} miles of {locationName}.
              </p>
              <button
                onClick={() => setMaxDistance(2000)}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Expand to Nationwide →
              </button>
            </div>
          ) : (
            filteredNgos.map(ngo => {
              const isSelected = selectedNgoId === ngo.id;
              return (
                <div
                  key={ngo.id}
                  onClick={() => setSelectedNgoId(ngo.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {ngo.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {ngo.distanceMiles} mi
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                    {ngo.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {ngo.address || ngo.location}
                  </p>

                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {ngo.courses?.length || 0} Programs Offered
                    </span>
                    <Link
                      to={`/ngo/${ngo.id}`}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center"
                    >
                      <span>Explore</span>
                      <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NgoMapLocator;
