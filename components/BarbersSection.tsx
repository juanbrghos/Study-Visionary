'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Scissors } from 'lucide-react';
import { ServiceItem } from './ServicesCatalog';

export interface BarberData {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  locationId: string;
  locationName: string;
  availableHours: string[];
}

interface BarbersSectionProps {
  barbers: BarberData[];
  selectedBranch: string;
  onChangeBranch: (branch: string) => void;
  selectedService: ServiceItem | null;
  onSelectSlotToBook: (barber: BarberData, time: string, date: string) => void;
  onRefreshData?: () => void;
}

export default function BarbersSection({
  barbers,
  selectedBranch,
  onChangeBranch,
  selectedService,
  onSelectSlotToBook,
  onRefreshData,
}: BarbersSectionProps) {
  // Today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [reservedSlotsMap, setReservedSlotsMap] = useState<Record<string, string[]>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter barbers by branch
  const filteredBarbers = selectedBranch === 'ALL'
    ? barbers
    : barbers.filter((b) => b.locationName === selectedBranch);

  // Real-time synchronization polling: fetch availability for all displayed barbers on selected date
  const syncAvailability = async () => {
    try {
      setIsSyncing(true);
      const newMap: Record<string, string[]> = {};

      await Promise.all(
        filteredBarbers.map(async (b) => {
          const res = await fetch(`/api/availability?barberId=${b.id}&date=${selectedDate}`);
          if (res.ok) {
            const data = await res.json();
            newMap[b.id] = data.reservedSlots || [];
          }
        })
      );

      setReservedSlotsMap(newMap);
    } catch (err) {
      console.error('Error syncing availability:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncAvailability();

    // Real-time polling every 8 seconds for instant calendar updates
    const interval = setInterval(() => {
      syncAvailability();
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedDate, selectedBranch, barbers.length]);

  return (
    <section id="barberos" className="max-w-7xl mx-auto px-4 py-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-zinc-800 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
            <span>Disponibilidad en Vivo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Nuestros Barberos & Agenda Online
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            {selectedService ? (
              <span className="text-white">
                Servicio preseleccionado: <strong className="underline underline-offset-4">{selectedService.name}</strong> ({selectedService.priceText})
              </span>
            ) : (
              'Elige tu profesional de preferencia y reserva tu horario directamente en el sistema.'
            )}
          </p>
        </div>

        {/* Controls: Branch tabs and Date picker */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter tabs */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => onChangeBranch('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedBranch === 'ALL'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onChangeBranch('Zona 6')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedBranch === 'Zona 6'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Zona 6
            </button>
            <button
              onClick={() => onChangeBranch('Zona 5')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedBranch === 'Zona 5'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Zona 5
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none font-mono cursor-pointer"
            />
          </div>

          {/* Manual Refresh / Sync Button */}
          <button
            onClick={() => {
              syncAvailability();
              if (onRefreshData) onRefreshData();
            }}
            title="Sincronizar disponibilidad ahora"
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBarbers.map((barber) => {
          const reservedSlots = reservedSlotsMap[barber.id] || [];
          const hours = Array.isArray(barber.availableHours) ? barber.availableHours : [];

          return (
            <div
              key={barber.id}
              className="bg-[#121215] rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all group shadow-sm"
            >
              <div>
                {/* Barber profile header */}
                <div className="flex items-start gap-4 mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={barber.photoUrl}
                    alt={barber.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 shadow-md grayscale contrast-125"
                  />
                  <div className="flex-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-300 uppercase tracking-wider inline-block mb-1">
                      {barber.locationName}
                    </span>
                    <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Scissors className="w-3 h-3 text-zinc-500" />
                      <span>{barber.specialty}</span>
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
                  {barber.bio}
                </p>

                {/* Real-time schedule slots */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Horarios ({selectedDate})</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 lowercase">
                      {hours.filter((h) => !reservedSlots.includes(h)).length} disponibles
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {hours.map((time) => {
                      const isTaken = reservedSlots.includes(time);

                      if (isTaken) {
                        return (
                          <div
                            key={time}
                            className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-900 text-[11px] font-mono text-zinc-600 line-through text-center cursor-not-allowed select-none"
                            title="Horario ya reservado"
                          >
                            {time}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={time}
                          onClick={() => onSelectSlotToBook(barber, time, selectedDate)}
                          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all text-center font-medium"
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Book Action */}
              <button
                onClick={() => {
                  const firstAvailable = hours.find((h) => !reservedSlots.includes(h)) || hours[0];
                  onSelectSlotToBook(barber, firstAvailable, selectedDate);
                }}
                className="w-full py-3.5 bg-zinc-900 border border-zinc-700 hover:border-white hover:bg-white hover:text-black text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar con {barber.name.split(' ')[0]}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

