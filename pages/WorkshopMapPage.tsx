import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { WorkshopFacility, MachineReservation } from '../types';
import {
  MapPin,
  Compass,
  Wrench,
  Clock,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Navigation,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorkshopMapPage: React.FC = () => {
  const { user } = useAuth();
  const {
    workshopFacilities,
    machineReservations,
    setMachineReservations,
  } = useData();

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    workshopFacilities[0]?.id || 'fac-1'
  );
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');

  // Reservation Modal
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [reservationDate, setReservationDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('Morning (9:00 AM - 1:00 PM)');
  const [reservationPurpose, setReservationPurpose] = useState<string>('');
  const [safetyCertified, setSafetyCertified] = useState<boolean>(true);

  const activeFacility =
    workshopFacilities.find((f) => f.id === selectedFacilityId) || workshopFacilities[0];

  const filteredFacilities = workshopFacilities.filter((f) => {
    const matchesType = filterType === 'All' || f.type === filterType;
    const matchesCity = filterCity === 'All' || f.city.includes(filterCity);
    return matchesType && matchesCity;
  });

  const handleOpenBooking = (machineName?: string) => {
    if (machineName) {
      setSelectedMachine(machineName);
    } else if (activeFacility.specializedMachinery.length > 0) {
      setSelectedMachine(activeFacility.specializedMachinery[0]);
    }
    setShowBookingModal(true);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    const newRes: MachineReservation = {
      id: `res-${Date.now()}`,
      facilityId: activeFacility.id,
      facilityName: activeFacility.name,
      machineName: selectedMachine || activeFacility.specializedMachinery[0],
      studentId: user?.id || 'stu-curr',
      studentName: user?.name || 'Enrolled Student',
      reservationDate,
      timeSlot,
      purpose: reservationPurpose || 'Capstone prototyping and testing.',
      safetyCertified,
      status: 'Confirmed',
      bookedAt: new Date().toISOString(),
    };

    setMachineReservations([newRes, ...machineReservations]);
    setShowBookingModal(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-emerald-950 to-cyan-950 p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-bold text-teal-200">
              <Compass className="w-3.5 h-3.5" />
              <span>Geo-Spatial Vocational Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Workshop & Shared Tool Library Map
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              Find community maker spaces, accredited testing labs, and shared tool libraries. Reserve time slots on heavy machinery, 50kW test benches, and laser cutters.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 self-start shrink-0 space-x-4 text-center">
            <div>
              <span className="text-[10px] text-teal-200 uppercase font-bold block">Facilities</span>
              <span className="text-xl font-black">{workshopFacilities.length} Centers</span>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <span className="text-[10px] text-teal-200 uppercase font-bold block">Available Tools</span>
              <span className="text-xl font-black text-cyan-300">725+ Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">City:</span>
          <div className="flex space-x-1.5">
            {['All', 'San Francisco', 'Austin', 'Chicago', 'Portland'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCity(c)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterCity === c
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Facility Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 dark:text-white"
          >
            <option value="All">All Types</option>
            <option value="Community Maker Space">Community Maker Space</option>
            <option value="Training Center">Training Center</option>
            <option value="Fabrication Lab">Fabrication Lab</option>
            <option value="Public Tool Lending Library">Tool Lending Library</option>
          </select>
        </div>
      </div>

      {/* Main Map & Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Vector Map Stage & Facility List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stylized Visual Map Stage */}
          <div className="relative h-60 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-4 overflow-hidden border border-gray-700 shadow-md flex flex-col justify-between">
            {/* Grid Lines Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 flex items-center space-x-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Interactive Geo-Node Radar</span>
              </span>
              <span className="text-[10px] text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                US Vocational Corridor
              </span>
            </div>

            {/* Interactive Pins on Vector Canvas */}
            <div className="relative z-10 w-full h-32 flex items-center justify-around">
              {workshopFacilities.map((fac, idx) => {
                const isSelected = fac.id === selectedFacilityId;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacilityId(fac.id)}
                    className="group relative flex flex-col items-center focus:outline-hidden"
                  >
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isSelected
                          ? 'bg-teal-500 text-white scale-125 ring-4 ring-teal-400/40'
                          : 'bg-white/20 text-teal-300 hover:bg-white/40 hover:scale-110'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[9px] font-bold mt-1.5 px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-teal-500 text-white'
                          : 'bg-black/60 text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {fac.city.split(',')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 text-[10px] text-gray-400 text-center">
              Click any pin or facility below to inspect machinery and book reservations.
            </div>
          </div>

          {/* Facility Cards List */}
          <div className="space-y-3">
            {filteredFacilities.map((fac) => {
              const isSelected = fac.id === selectedFacilityId;
              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    isSelected
                      ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                        {fac.type}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {fac.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{fac.location}, {fac.city}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 shrink-0">
                      {fac.availableToolsCount} Tools
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Facility Details & Machinery Reservations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
            {/* Header with image */}
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <img
                src={activeFacility.imageUrl}
                alt={activeFacility.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                    {activeFacility.type} • {activeFacility.city}
                  </span>
                  <h3 className="text-lg font-bold">{activeFacility.name}</h3>
                  <p className="text-xs text-gray-200">{activeFacility.address}</p>
                </div>

                <button
                  onClick={() => handleOpenBooking()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all shrink-0 flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Equipment</span>
                </button>
              </div>
            </div>

            {/* Operating Hours & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Operating Schedule</span>
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {activeFacility.operatingHours}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-gray-400 flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>Shop Contact</span>
                </span>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {activeFacility.contactPhone} • {activeFacility.contactEmail}
                </p>
              </div>
            </div>

            {/* Specialized Machinery List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center space-x-1.5">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  <span>Specialized Heavy Equipment & Test Bays</span>
                </h4>
                {activeFacility.safetyOrientationRequired && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Safety Orientation Required</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeFacility.specializedMachinery.map((mach, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20 flex items-center justify-between gap-2"
                  >
                    <div className="text-xs">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {mach}
                      </span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                        Available for Student Booking
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(mach)}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[10px] font-bold rounded-lg transition-colors shrink-0"
                    >
                      Reserve
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Active Reservations at this facility */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Confirmed Machine Bookings
              </h4>

              <div className="space-y-2">
                {machineReservations
                  .filter((r) => r.facilityId === activeFacility.id)
                  .map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{res.machineName}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          Reserved by <strong>{res.studentName}</strong> • {res.reservationDate} ({res.timeSlot})
                        </p>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
                        {res.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Book Machine Slot */}
      {/* ------------------------------------------------------------- */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Reserve Equipment at {activeFacility.name}
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReservation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Selected Machine / Test Bench
                </label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                >
                  {activeFacility.specializedMachinery.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Morning (9:00 AM - 1:00 PM)">Morning (9:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (2:00 PM - 6:00 PM)">Afternoon (2:00 PM - 6:00 PM)</option>
                    <option value="Evening (6:30 PM - 9:00 PM)">Evening (6:30 PM - 9:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Project Purpose & Materials Used
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Prototyping solar circuit housing or welding structural joint sample..."
                  value={reservationPurpose}
                  onChange={(e) => setReservationPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="safetyCheck"
                  checked={safetyCertified}
                  onChange={(e) => setSafetyCertified(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="safetyCheck" className="text-gray-700 dark:text-gray-300 font-medium">
                  I have reviewed the shop's OSHA rules and will bring compliant PPE.
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm Slot Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopMapPage;
