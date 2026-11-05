'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Users } from 'lucide-react';

interface LocationsSectionProps {
  onFilterByBranch: (branch: string) => void;
  selectedBranch: string;
}

export default function LocationsSection({
  onFilterByBranch,
  selectedBranch,
}: LocationsSectionProps) {
  const branches = [
    {
      id: 'loc-z6',
      name: 'Zona 6',
      title: 'Sede Zona 6',
      subtitle: 'Calle Real y 15 Avenida',
      address: 'Calle Real y 15 Avenida, Zona 6, Ciudad de Guatemala',
      googleMapsUrl: 'https://maps.app.goo.gl/kr8xpP1SEefd2QdE6',
      wazeUrl: 'https://waze.com/ul?q=https://maps.app.goo.gl/kr8xpP1SEefd2QdE6',
      hours: 'Lunes a Sábado: 8:30 AM - 7:30 PM | Domingos: 9:00 AM - 3:00 PM',
      barbersSummary: 'Carlos Ruiz • David Morales • Mateo López',
      barberCount: 3,
    },
    {
      id: 'loc-z5',
      name: 'Zona 5',
      title: 'Sede Zona 5',
      subtitle: 'Bulevar Central Los Jardines',
      address: 'Bulevar Los Jardines 22-10, Zona 5, Ciudad de Guatemala',
      googleMapsUrl: 'https://maps.app.goo.gl/eNorgV6reEc4xdWV7',
      wazeUrl: 'https://waze.com/ul?q=https://maps.app.goo.gl/eNorgV6reEc4xdWV7',
      hours: 'Lunes a Sábado: 9:00 AM - 8:00 PM | Domingos: Cerrado',
      barbersSummary: 'Javier Gómez • Andrés Pérez • Samuel Hernández',
      barberCount: 3,
    },
  ];

  return (
    <section id="sedes" className="max-w-7xl mx-auto px-4 py-20 border-b border-zinc-800/80">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
          Ubicaciones Estratégicas
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Nuestras Sedes & Navegación GPS
        </h2>
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          Ven a visitarnos en cualquiera de nuestros dos locales. Abre la ruta directa en Google Maps o inicia la navegación giro a giro con Waze en tu teléfono.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {branches.map((b) => {
          const isSelected = selectedBranch === b.name;

          return (
            <div
              key={b.id}
              className={`p-8 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-white shadow-[0_0_30px_rgba(255,255,255,0.06)]'
                  : 'bg-[#121215] border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                        Local Oficial
                      </span>
                      <h3 className="text-2xl font-black text-white uppercase">
                        {b.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {b.barberCount} Barberos
                  </span>
                </div>

                {/* Subtitle & Address */}
                <p className="text-sm text-zinc-300 font-medium mb-1">
                  {b.subtitle}
                </p>
                <p className="text-xs text-zinc-400 mb-6 font-mono leading-relaxed">
                  {b.address}
                </p>

                {/* Info Pills */}
                <div className="space-y-3 mb-8 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 text-xs">
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <span>{b.hours}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-zinc-300">
                    <Users className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <span>Equipo: <strong className="text-white font-medium">{b.barbersSummary}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Google Maps Button */}
                  <a
                    href={b.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <span>Google Maps</span>
                  </a>

                  {/* Waze Button */}
                  <a
                    href={b.wazeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl border border-zinc-700 bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:border-white transition-all flex items-center justify-center gap-2 group"
                  >
                    <Navigation className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
                    <span>Ruta en Waze</span>
                  </a>
                </div>

                {/* Filter and Book Button */}
                <button
                  onClick={() => {
                    onFilterByBranch(b.name);
                    document.getElementById('barberos')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <span>{isSelected ? `Mostrando Barberos de ${b.name}` : `Filtrar Barberos de ${b.name}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

