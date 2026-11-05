'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  DollarSign,
  PlusCircle,
  Scissors,
  MapPin,
  Trash2,
  RefreshCw,
  AlertCircle,
  Building,
  Check,
} from 'lucide-react';
import { BarberData } from './BarbersSection';
import { SERVICES_CATALOG } from './ServicesCatalog';

interface StaffDashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'CASHIER' | 'BARBER';
    barber?: BarberData;
  };
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [barbersList, setBarbersList] = useState<BarberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Walk-in form state
  const [walkInClient, setWalkInClient] = useState('');
  const [walkInBarberId, setWalkInBarberId] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState('srv-corte');
  const [walkInAmount, setWalkInAmount] = useState('50');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [walkInSuccessMsg, setWalkInSuccessMsg] = useState('');

  // Admin New Barber Form State
  const [showAddBarberModal, setShowAddBarberModal] = useState(false);
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('');
  const [newBarberEmail, setNewBarberEmail] = useState('');
  const [newBarberPassword, setNewBarberPassword] = useState('');
  const [newBarberBranch, setNewBarberBranch] = useState('loc-z6');
  const [newBarberBio, setNewBarberBio] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch Barbers list
      const barbersRes = await fetch('/api/barbers');
      if (barbersRes.ok) {
        const bData = await barbersRes.json();
        setBarbersList(bData.barbers || []);
        if (bData.barbers && bData.barbers.length > 0 && !walkInBarberId) {
          setWalkInBarberId(bData.barbers[0].id);
        }
      }

      // Fetch Appointments depending on role
      let aptUrl = '/api/appointments';
      if (user.role === 'BARBER' && user.barber?.id) {
        aptUrl += `?barberId=${user.barber.id}`;
      }

      const aptRes = await fetch(aptUrl);
      if (aptRes.ok) {
        const aData = await aptRes.json();
        setAppointments(aData.appointments || []);
      }

      // If ADMIN, fetch metrics
      if (user.role === 'ADMIN') {
        const metRes = await fetch('/api/admin/metrics');
        if (metRes.ok) {
          const mData = await metRes.json();
          setMetrics(mData.metrics);
        }
      }
    } catch (err) {
      console.error('Error fetching staff dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Polling every 10 seconds for real-time dashboard updates
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(timer);
  }, [user.id, user.role]);

  // Handle status update
  const handleUpdateStatus = async (aptId: string, newStatus: string, amount?: number) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, amountPaid: amount }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  // Handle appointment deletion (Admin)
  const handleDeleteAppointment = async (aptId: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro permanentemente?')) return;
    try {
      const res = await fetch(`/api/appointments/${aptId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  // Handle Walk-in submit (Cashier)
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWalkIn(true);
    setWalkInSuccessMsg('');

    try {
      const selectedBarber = barbersList.find((b) => b.id === walkInBarberId);
      const selectedService = SERVICES_CATALOG.find((s) => s.id === walkInServiceId);

      if (!selectedBarber) throw new Error('Selecciona un barbero válido');

      const res = await fetch('/api/appointments/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: walkInClient.trim(),
          barberId: selectedBarber.id,
          locationId: selectedBarber.locationId,
          serviceId: selectedService?.id,
          serviceName: selectedService?.name || 'Corte Walk-in',
          amountPaid: Number(walkInAmount) || 50,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al registrar walk-in');
      }

      setWalkInSuccessMsg('¡Cliente registrado y cobrado con éxito en el sistema!');
      setWalkInClient('');
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  // Filtered appointments by search and status
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clientPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.barberName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner / Session Header */}
      <div className="bg-[#121215] rounded-2xl border border-zinc-800 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shadow-inner">
            <User className="w-7 h-7 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {user.email} {user.barber ? `• Sede: ${user.barber.locationName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-xl transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* 1. BARBER PROFILE DASHBOARD */}
      {user.role === 'BARBER' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                Agenda Exclusiva de Barbero
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-zinc-400" />
                <span>Mis Citas Asignadas</span>
              </h3>
            </div>
            <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl">
              Hoy: {new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Appointments Table for Barber */}
          <div className="bg-[#121215] rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/90 text-[11px] uppercase font-mono text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Código / Hora</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Servicio</th>
                    <th className="p-4">Sede</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acción de Barbero</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-zinc-500">
                        No tienes citas registradas asignadas por el momento.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{apt.time}</div>
                          <div className="text-[10px] text-zinc-500">{apt.date} • {apt.code}</div>
                        </td>
                        <td className="p-4 font-sans font-medium text-white">{apt.clientName}</td>
                        <td className="p-4 text-zinc-400">{apt.clientPhone}</td>
                        <td className="p-4 font-sans text-xs text-zinc-300">
                          {apt.serviceName || apt.fullServiceName || 'Corte General'}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                            {apt.locationName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] rounded-full border ${
                              apt.status === 'REALIZADA'
                                ? 'bg-zinc-800 text-white border-zinc-600'
                                : apt.status === 'EN_PROCESO'
                                ? 'bg-zinc-900 text-zinc-200 border-zinc-500'
                                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {apt.status === 'PENDIENTE' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'EN_PROCESO')}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs transition-all"
                            >
                              Iniciar
                            </button>
                          )}
                          {apt.status === 'EN_PROCESO' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'REALIZADA')}
                              className="px-3 py-1.5 bg-white text-black font-bold rounded-lg text-xs hover:bg-zinc-200 transition-all"
                            >
                              Finalizar Corte
                            </button>
                          )}
                          {apt.status === 'REALIZADA' && (
                            <span className="text-zinc-500 text-xs flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5" /> Completada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CASHIER / RECEPCIÓN DASHBOARD */}
      {user.role === 'CASHIER' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search & Checkout Table (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-0.5">
                    Módulo de Caja
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-zinc-400" />
                    <span>Confirmación y Cobro de Citas</span>
                  </h3>
                </div>

                {/* Fast Client Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente o teléfono..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#121215] rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-zinc-900/90 text-[11px] uppercase font-mono text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-4">Cliente / Tel</th>
                        <th className="p-4">Barbero</th>
                        <th className="p-4">Sede</th>
                        <th className="p-4">Fecha / Hora</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Cobro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-zinc-500">
                            No se encontraron citas con ese criterio de búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((apt) => {
                          const isDone = apt.status === 'REALIZADA';

                          return (
                            <tr key={apt.id} className="hover:bg-zinc-900/40 transition-colors">
                              <td className="p-4">
                                <div className="font-sans font-bold text-white text-sm">{apt.clientName}</div>
                                <div className="text-zinc-500 text-[11px]">{apt.clientPhone} • {apt.code}</div>
                              </td>
                              <td className="p-4 font-sans text-xs text-zinc-300">{apt.barberName}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                                  {apt.locationName}
                                </span>
                              </td>
                              <td className="p-4 text-zinc-400">
                                {apt.date} <br />
                                <strong className="text-white">{apt.time}</strong>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 text-[10px] rounded-full border ${
                                    isDone
                                      ? 'bg-zinc-800 text-white border-zinc-600'
                                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {!isDone ? (
                                  <button
                                    onClick={() => handleUpdateStatus(apt.id, 'REALIZADA', apt.amountPaid || 50)}
                                    className="px-3.5 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-all shadow-md"
                                  >
                                    Cobrar & Marcar Hecho
                                  </button>
                                ) : (
                                  <span className="text-zinc-400 text-xs font-mono flex items-center justify-end gap-1">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                    <span>Cobrado (Q{apt.amountPaid || 50})</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Walk-In Express Register Form (1 Column) */}
            <div className="bg-[#121215] rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-white font-black text-lg uppercase tracking-tight">
                  <PlusCircle className="w-5 h-5 text-zinc-400" />
                  <span>Corte Sin Cita (Walk-in)</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Para clientes presenciales que llegan sin cita previa. Se guarda inmediatamente en la BD y se asocia al barbero para control de comisiones.
                </p>

                {walkInSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-white shrink-0" />
                    <span>{walkInSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleWalkInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Mario Estrada"
                      value={walkInClient}
                      onChange={(e) => setWalkInClient(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Barbero que Atendió
                    </label>
                    <select
                      value={walkInBarberId}
                      onChange={(e) => setWalkInBarberId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500 font-medium"
                    >
                      {barbersList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.locationName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Servicio Realizado
                    </label>
                    <select
                      value={walkInServiceId}
                      onChange={(e) => {
                        setWalkInServiceId(e.target.value);
                        const s = SERVICES_CATALOG.find((item) => item.id === e.target.value);
                        if (s?.price) setWalkInAmount(s.price.toString());
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500 font-medium"
                    >
                      {SERVICES_CATALOG.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.priceText})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Monto Cobrado (Quetzales - Q)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={walkInAmount}
                      onChange={(e) => setWalkInAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500 font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWalkIn}
                    className="w-full py-3.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmittingWalkIn ? 'Registrando...' : 'Registrar & Facturar'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADMINISTRADOR DASHBOARD */}
      {user.role === 'ADMIN' && (
        <div className="space-y-8">
          {/* Top KPI Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#121215] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  Citas Totales
                </span>
                <div className="text-4xl font-black text-white font-mono">
                  {metrics.totalAppointments}
                </div>
                <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Registros en base de datos</span>
                </div>
              </div>

              <div className="bg-[#121215] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  Cortes Completados
                </span>
                <div className="text-4xl font-black text-white font-mono">
                  {metrics.completedAppointments}
                </div>
                <div className="text-xs text-zinc-400 mt-2">
                  {metrics.pendingAppointments} citas aún pendientes
                </div>
              </div>

              <div className="bg-[#121215] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  Ingresos Totales (Q)
                </span>
                <div className="text-4xl font-black text-white font-mono">
                  Q{metrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400 mt-2">
                  Facturación de servicios cobrados
                </div>
              </div>

              <div className="bg-[#121215] p-6 rounded-2xl border border-zinc-800 shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                  Citas por Sede
                </span>
                <div className="flex justify-between items-center text-sm font-bold text-zinc-300 mt-2">
                  <span>Zona 6: <strong className="text-white">{metrics.locations?.zona6?.total || 0}</strong></span>
                  <span>Zona 5: <strong className="text-white">{metrics.locations?.zona5?.total || 0}</strong></span>
                </div>
                {/* Visual distribution bar */}
                <div className="w-full bg-zinc-800 h-2.5 rounded-full mt-3 overflow-hidden flex">
                  <div
                    className="bg-white h-full"
                    style={{
                      width: `${
                        metrics.totalAppointments > 0
                          ? ((metrics.locations?.zona6?.total || 0) / metrics.totalAppointments) * 100
                          : 50
                      }%`,
                    }}
                    title="Zona 6"
                  />
                  <div
                    className="bg-zinc-600 h-full"
                    style={{
                      width: `${
                        metrics.totalAppointments > 0
                          ? ((metrics.locations?.zona5?.total || 0) / metrics.totalAppointments) * 100
                          : 50
                      }%`,
                    }}
                    title="Zona 5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Master Appointments Management Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-0.5">
                  Control Central
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-zinc-400" />
                  <span>Gestión General de Servicios y Citas</span>
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar citas..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-white p-2 rounded-xl focus:outline-none font-mono"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="REALIZADA">Realizadas</option>
                </select>
              </div>
            </div>

            <div className="bg-[#121215] rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="bg-zinc-900/90 text-[11px] uppercase font-mono text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="p-4">Código</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Barbero</th>
                      <th className="p-4">Sede</th>
                      <th className="p-4">Fecha & Hora</th>
                      <th className="p-4">Servicio</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-zinc-500">
                          Sin registros de citas en la base de datos.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-4 font-bold text-white">{apt.code}</td>
                          <td className="p-4 font-sans font-medium text-white">
                            {apt.clientName}
                            <span className="block text-[10px] text-zinc-500 font-mono">{apt.clientPhone}</span>
                          </td>
                          <td className="p-4 font-sans text-xs text-zinc-300">{apt.barberName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                              {apt.locationName}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400">
                            {apt.date} • <strong className="text-white">{apt.time}</strong>
                          </td>
                          <td className="p-4 font-sans text-xs text-zinc-300">
                            {apt.serviceName || apt.fullServiceName || 'Corte General'}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 text-[10px] rounded-full border ${
                                apt.status === 'REALIZADA'
                                  ? 'bg-zinc-800 text-white border-zinc-600'
                                  : apt.status === 'EN_PROCESO'
                                  ? 'bg-zinc-900 text-zinc-200 border-zinc-500'
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {apt.status !== 'REALIZADA' && (
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'REALIZADA', apt.amountPaid || 50)}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-white hover:text-black rounded text-[11px] transition-all"
                              >
                                Cobrar
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              title="Eliminar cita"
                              className="p-1 text-zinc-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

