'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { Resource, User, ActivityLog, ResourceStatus } from '@/types';
import {
  ShieldCheck,
  Users,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Wrench,
  CheckCircle,
  Database,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminConsolePage() {
  const { currentUser, isAdmin, switchUser } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/resources').then((r) => r.json()),
        fetch('/api/activity-logs?limit=50').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()), // test ping
      ]);
      setResources(resRes);
      setActivityLogs(usersRes);

      // Users from mock data or storage
      const uRes = await fetch('/api/resources'); // dummy ping, use auth context's users
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (resourceId: string, currentStatus: ResourceStatus) => {
    const nextStatus: ResourceStatus =
      currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        toast.success(`Resource status changed to ${nextStatus}`);
        fetchAdminData();
      } else {
        toast.error('Failed to change status');
      }
    } catch {
      toast.error('Error updating status');
    }
  };

  const handleDeleteResource = async (resourceId: string, resourceName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${resourceName}"?`)) return;

    try {
      const res = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Resource deleted');
        fetchAdminData();
      } else {
        toast.error('Failed to delete resource');
      }
    } catch {
      toast.error('Error deleting resource');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Administrator Access Required</h1>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            You are currently logged in as a standard member (<strong>{currentUser.name}</strong>).
            To test the administrative console, switch your demo role to Dr. Aaron Vance (Admin).
          </p>
          <button
            onClick={() => switchUser('user-admin')}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            Switch to Admin Role Now
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
              Administrative Governance Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Facility lifecycle management, maintenance flags, and complete immutable audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              PostgreSQL Schema Ready
            </span>
          </div>
        </div>

        {/* Section 1: Facility Maintenance & Lifecycle Controls */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Facilities Status & Operational Toggles
            </h2>
            <span className="text-xs text-slate-400">
              {resources.length} registered facilities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-400">{r.code}</td>
                    <td className="p-3 font-medium text-slate-200">{r.name}</td>
                    <td className="p-3 text-slate-400">{r.category?.name || 'General'}</td>
                    <td className="p-3 text-slate-300 font-mono">{r.capacity} pax</td>
                    <td className="p-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(r.id, r.status)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Toggle Maintenance State"
                      >
                        {r.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
                      </button>
                      <button
                        onClick={() => handleDeleteResource(r.id, r.name)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Complete Audit Trail */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Full System Audit Log
            </h2>
            <span className="text-xs text-slate-400">
              Real-time chronological events
            </span>
          </div>

          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-semibold text-indigo-400">
                    [{log.action}]
                  </span>
                  <span className="text-slate-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono self-start sm:self-auto">
                  Ref: {log.entityType} ({log.entityId || 'N/A'})
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
