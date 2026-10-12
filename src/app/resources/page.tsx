'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ResourceCard } from '@/components/ResourceCard';
import { BookingModal } from '@/components/BookingModal';
import { useAuth } from '@/lib/auth-context';
import { Resource, Category, ResourceStatus } from '@/types';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Layers,
  X,
  Building,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResourcesPage() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingResourceId, setBookingResourceId] = useState<string | undefined>();
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);

  // New Resource Form
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCapacity, setNewCapacity] = useState(6);
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAmenities, setNewAmenities] = useState('WiFi, 4K Display, Whiteboard');
  const [newRequiresApproval, setNewRequiresApproval] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, catRes] = await Promise.all([
        fetch('/api/resources').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      setResources(resRes);
      setCategories(catRes);
      if (catRes.length > 0 && !newCategoryId) {
        setNewCategoryId(catRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = (resourceId: string) => {
    setBookingResourceId(resourceId);
    setIsBookingModalOpen(true);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode || !newCategoryId || !newLocation) {
      toast.error('Please complete required resource fields');
      return;
    }

    setCreating(true);
    try {
      const parsedAmenities = newAmenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          code: newCode,
          categoryId: newCategoryId,
          capacity: Number(newCapacity),
          location: newLocation,
          description: newDescription,
          amenities: parsedAmenities,
          requiresApproval: newRequiresApproval,
          imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        }),
      });

      if (!res.ok) {
        toast.error('Failed to create resource');
        return;
      }

      toast.success('Resource added to catalog!');
      setIsAddResourceModalOpen(false);
      // Reset form
      setNewName('');
      setNewCode('');
      setNewDescription('');
      fetchData();
    } catch {
      toast.error('Error creating resource');
    } finally {
      setCreating(false);
    }
  };

  // Filtered items
  const filteredResources = resources.filter((r) => {
    if (selectedCategory !== 'ALL' && r.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenBookingModal={() => setIsBookingModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-indigo-400" />
              Shared Facilities Catalog
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Browse, filter, and reserve meeting rooms, high-performance compute rigs, and specialized labs.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddResourceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility (Admin)</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by facility name, code (e.g. CR-ALPHA), location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        {/* Resources Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading facility catalog...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-base font-semibold text-slate-300">
              No matching resources found
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria or resetting filters to view all shared resources.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedResourceId={bookingResourceId}
      />

      {/* Add Resource Modal (Admin Only) */}
      {isAddResourceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                Register Shared Facility
              </h2>
              <button
                onClick={() => setIsAddResourceModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cleanroom Chamber B"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Unique Code (Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CR-CHAMBER-B"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Capacity (Max Persons)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Physical Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Level 2, Clean Science Wing, Bay 12"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational purpose, safety precautions, technical guidelines..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amenities & Equipment (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. HEPA Filter, Nitrogen Line, Micro-Scale, Oscilloscope"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqApproval"
                  checked={newRequiresApproval}
                  onChange={(e) => setNewRequiresApproval(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600"
                />
                <label htmlFor="reqApproval" className="text-xs text-slate-300">
                  Require Administrative Approval for Bookings
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddResourceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {creating ? 'Saving...' : 'Add Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
