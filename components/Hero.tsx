'use client';

import React from 'react';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface HeroProps {
  onSelectBranch: (branchName: string) => void;
  onOpenServicePicker: () => void;
}

export default function Hero({ onSelectBranch, onOpenServicePicker }: HeroProps) {
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-[#09090b] to-[#09090b]">
      {/* Subtle grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest bg-zinc-900/90 text-zinc-300 rounded-full border border-zinc-800 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Barbería Urbana & Arte Corporal</span>
        </div>

        {/* Big Logo / Title */}
        <div className="my-6 flex flex-col items-center justify-center">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white uppercase max-w-4xl leading-tight">
            PRECISIÓN PURA. <br className="hidden sm:inline" />
            <span className="text-zinc-500 font-extralight">ESTILO MONOCROMÁTICO.</span>
          </h1>
        </div>

        <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Alta barbería contemporánea en dos sedes estratégicas. Desvanecidos al ras, afeitado a navaja tradicional, diseño de cejas, tatuajes exclusivos y colorimetría técnica.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-12">
          <button
            onClick={onOpenServicePicker}
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <Sparkles className="w-4 h-4" />
            <span>Seleccionar Servicio & Agendar</span>
          </button>
          <a
            href="#sedes"
            className="w-full sm:w-auto px-6 py-4 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Ver Sedes y Waze</span>
          </a>
        </div>

        {/* Quick Branch Quick-Pick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
          <button
            onClick={() => onSelectBranch('Zona 6')}
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 transition-all group shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Sede 01</div>
              <div className="text-xl font-bold text-white group-hover:text-white mt-0.5">Sede Zona 6</div>
              <div className="text-xs text-zinc-400 mt-1">Calle Real & 15 Avenida • 3 Barberos</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-500 transition-all">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => onSelectBranch('Zona 5')}
            className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 transition-all group shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Sede 02</div>
              <div className="text-xl font-bold text-white group-hover:text-white mt-0.5">Sede Zona 5</div>
              <div className="text-xs text-zinc-400 mt-1">Bulevar Central • 3 Barberos</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-500 transition-all">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

