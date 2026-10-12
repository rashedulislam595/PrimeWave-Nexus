'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Layers,
  Calendar,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Plus,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NavbarProps {
  onOpenBookingModal?: () => void;
}

export function Navbar({ onOpenBookingModal }: NavbarProps) {
  const pathname = usePathname();
  const { currentUser, switchUser, availableUsers, isAdmin } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm('Reset sample database to default seed data?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        toast.success('Database reset to initial demo state!');
        window.location.reload();
      } else {
        toast.error('Failed to reset database');
      }
    } catch {
      toast.error('Error resetting database');
    } finally {
      setResetting(false);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/resources', label: 'Resources', icon: Layers },
    { href: '/calendar', label: 'Schedule', icon: Calendar },
    { href: '/reservations', label: 'Reservations', icon: ClipboardList },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Console', icon: ShieldCheck }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PrimeWave
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                  Resource Hub
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Reset Button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset sample database to fresh state"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition-all text-left"
              >
                <div className="relative">
                  {currentUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-semibold text-xs">
                      {currentUser.name[0]}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                      isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-slate-200 leading-tight flex items-center gap-1.5">
                    {currentUser.name.split(' ')[0]}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight truncate max-w-[110px]">
                    {currentUser.department}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active Role (Demo Mode)
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Test administrative vs standard member permissions
                      </div>
                    </div>
                    <div className="space-y-1">
                      {availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user.id);
                            setUserDropdownOpen(false);
                            toast.success(`Switched role to ${user.name} (${user.role})`);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            user.id === currentUser.id
                              ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                              : 'hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {user.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                {user.name[0]}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-semibold">{user.name}</div>
                              <div className="text-[11px] text-slate-400">{user.department}</div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              user.role === 'ADMIN'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Primary Action Button */}
            {onOpenBookingModal && (
              <button
                onClick={onOpenBookingModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Book Resource</span>
                <span className="sm:hidden">Book</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
