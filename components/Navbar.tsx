'use client';

import React from 'react';
import Logo from './Logo';
import { ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentUser: any;
  onOpenLogin: () => void;
  onLogout: () => void;
  currentView: 'public' | 'staff';
  onToggleView: (view: 'public' | 'staff') => void;
}

export default function Navbar({
  currentUser,
  onOpenLogin,
  onLogout,
  currentView,
  onToggleView,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onToggleView('public')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <button
            onClick={() => {
              onToggleView('public');
              document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Servicios
          </button>
          <button
            onClick={() => {
              onToggleView('public');
              document.getElementById('sedes')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Sedes & Waze
          </button>
          <button
            onClick={() => {
              onToggleView('public');
              document.getElementById('barberos')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Barberos
          </button>
          <button
            onClick={() => {
              onToggleView('public');
              document.getElementById('barberos')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-black hover:border-white transition-all"
          >
            Agendar Cita
          </button>
        </nav>

        {/* Staff Actions */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleView(currentView === 'staff' ? 'public' : 'staff')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-all flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span>{currentView === 'staff' ? 'Ver Web' : `Panel (${currentUser.role})`}</span>
              </button>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Acceso Staff</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

