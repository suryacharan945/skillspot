import React, { useState, useMemo } from 'react';
import { WorkshopEquipmentItem } from '../types';
import { useData } from '../data/DataContext';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

export const EquipmentInventoryManager: React.FC = () => {
  const { equipment, setEquipment } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | WorkshopEquipmentItem['status']>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Solar Power Equipment');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<WorkshopEquipmentItem['status']>('Operational');
  const [location, setLocation] = useState('Workbench A');
  const [notes, setNotes] = useState('');

  const filteredEquipment = useMemo(() => {
    return equipment.filter((item) => {
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [equipment, selectedStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: equipment.length,
      operational: equipment.filter((e) => e.status === 'Operational').length,
      maintenance: equipment.filter((e) => e.status === 'Needs Maintenance').length,
      repair: equipment.filter((e) => e.status === 'Under Repair').length,
    };
  }, [equipment]);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: WorkshopEquipmentItem = {
      id: `eq-${Date.now()}`,
      ngoId: 'ngo-1',
      name,
      category,
      serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      location,
      notes: notes || undefined,
    };

    setEquipment((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);

    setName('');
    setSerialNumber('');
    setNotes('');
  };

  const handleUpdateStatus = (id: string, newStatus: WorkshopEquipmentItem['status']) => {
    setEquipment((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this equipment record?')) {
      setEquipment((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Workshop Equipment & Asset Tracker
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {equipment.length} Units Tracked
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Log shop tools, track safety inspections, and maintain vocational machinery for OSHA and training compliance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Workshop Asset</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Equipment</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{counts.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block">100% Operational</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{counts.operational}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">Needs Maintenance</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{counts.maintenance}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-500 block">Under Repair</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{counts.repair}</p>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tool name, serial number, category, or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl">
          {(['All', 'Operational', 'Needs Maintenance', 'Under Repair'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 ${
                    item.status === 'Operational'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.status === 'Needs Maintenance'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {item.status === 'Operational' && <CheckCircle2 className="w-2.5 h-2.5" />}
                  {item.status === 'Needs Maintenance' && <AlertTriangle className="w-2.5 h-2.5" />}
                  {item.status === 'Under Repair' && <Clock className="w-2.5 h-2.5" />}
                  <span>{item.status}</span>
                </span>
              </div>

              <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-2">
                {item.name}
              </h4>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">SN: {item.serialNumber}</p>

              <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Station / Room:</span>
                  <span className="font-semibold">{item.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inspected:</span>
                  <span>{new Date(item.lastMaintenanceDate).toLocaleDateString()}</span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-gray-500 italic mt-1">{item.notes}</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              {/* Status switcher dropdown */}
              <select
                value={item.status}
                onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[11px] font-semibold text-gray-700 dark:text-gray-200"
              >
                <option value="Operational">Operational</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
                <option value="Under Repair">Under Repair</option>
              </select>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Remove Equipment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Equipment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-5 border-b pb-4 dark:border-gray-700">
              <div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Workshop Inventory
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Add Workshop Equipment
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Equipment / Machine Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miller Multimatic 220 MIG Welder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Trade Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="Clean Energy">Clean Energy</option>
                    <option value="Welding & Metal">Welding & Metal</option>
                    <option value="Carpentry & Joinery">Carpentry & Joinery</option>
                    <option value="Computing & Laptops">Computing & Laptops</option>
                    <option value="Apparel & Textiles">Apparel & Textiles</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Serial Number / Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SN-98120"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Station / Bay
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 3 or Lab B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Maintenance Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Calibration notes, replacement parts, or scheduled inspections..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentInventoryManager;
