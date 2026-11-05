'use client';

import React from 'react';
import { Scissors, Sparkles, Feather, Palette, HandMetal, Check } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  priceText: string;
  price: number | null;
  badge?: string;
}

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'srv-corte',
    name: 'Corte de Cabello Normal / Fade',
    category: 'Corte de Cabello',
    description: 'Corte completo a tijera y máquina, desvanecido a ras de piel (fade), lavado rápido y peinado profesional con cera mate.',
    priceText: 'Q50',
    price: 50,
    badge: 'Popular',
  },
  {
    id: 'srv-cejas',
    name: 'Retoque de Cejas',
    category: 'Barba y Cejas',
    description: 'Delineado y perfilado de cejas a navaja libre para una mirada simétrica, limpia y masculina.',
    priceText: 'Q10',
    price: 10,
  },
  {
    id: 'srv-barba',
    name: 'Arreglo & Perfilado de Barba',
    category: 'Barba y Cejas',
    description: 'Ritual con toalla caliente al vapor, aceites naturales para barba, contorno a navaja y bálsamo hidratante.',
    priceText: 'Q15',
    price: 15,
  },
  {
    id: 'srv-tatuajes',
    name: 'Tatuajes Artísticos',
    category: 'Tatuajes',
    description: 'Fine-line, microrealismo, blackwork y caligrafía. Agujas esterilizadas desechables e higiene de grado clínico.',
    priceText: 'Según diseño',
    price: null,
    badge: 'Cotización',
  },
  {
    id: 'srv-unas',
    name: 'Diseño & Cuidado de Uñas',
    category: 'Uñas',
    description: 'Manicura urbana unisex: exfoliación, limpieza de cutícula, limado estructurado y arte minimalista en uñas.',
    priceText: 'Según diseño',
    price: null,
    badge: 'Personalizado',
  },
  {
    id: 'srv-pelo',
    name: 'Pintado / Tinta de Pelo',
    category: 'Pintado / Tinta de Pelo',
    description: 'Decoloración global, platinados cenizos, mechas o cobertura total con tratamiento de protección capilar.',
    priceText: 'Según diseño',
    price: null,
    badge: 'Especialidad',
  },
];

interface ServicesCatalogProps {
  selectedServiceId: string | null;
  onSelectService: (service: ServiceItem) => void;
  onContinueToBarbers: () => void;
}

export default function ServicesCatalog({
  selectedServiceId,
  onSelectService,
  onContinueToBarbers,
}: ServicesCatalogProps) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Corte de Cabello':
        return <Scissors className="w-5 h-5 text-white" />;
      case 'Barba y Cejas':
        return <Feather className="w-5 h-5 text-white" />;
      case 'Tatuajes':
        return <Sparkles className="w-5 h-5 text-white" />;
      case 'Uñas':
        return <HandMetal className="w-5 h-5 text-white" />;
      case 'Pintado / Tinta de Pelo':
        return <Palette className="w-5 h-5 text-white" />;
      default:
        return <Scissors className="w-5 h-5 text-white" />;
    }
  };

  return (
    <section id="servicios" className="max-w-7xl mx-auto px-4 py-20 border-b border-zinc-800/80">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block mb-2">
            Catálogo Oficial
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            Menú de Servicios & Tarifas
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xl">
            Precios oficiales y transparentes. Selecciona tu servicio para reservar con el especialista indicado en cualquiera de nuestras sedes.
          </p>
        </div>

        {selectedServiceId && (
          <button
            onClick={onContinueToBarbers}
            className="self-start md:self-auto px-6 py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg"
          >
            <span>Ver Barberos Disponibles</span>
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES_CATALOG.map((service) => {
          const isSelected = selectedServiceId === service.id;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'bg-zinc-900 border-white shadow-[0_0_25px_rgba(255,255,255,0.08)]'
                  : 'bg-[#121215] border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center">
                    {getIcon(service.category)}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white font-mono block">
                      {service.priceText}
                    </span>
                    {service.badge && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                        {service.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                  {service.category}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                  {isSelected ? '✓ Servicio Seleccionado' : 'Elegir este servicio'}
                </span>
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-white border-white text-black'
                      : 'border-zinc-700 group-hover:border-zinc-500 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

