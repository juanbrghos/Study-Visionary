'use client';

import React from 'react';
import Logo from './Logo';
import { MapPin, Phone, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenLogin: () => void;
}

export default function Footer({ onOpenLogin }: FooterProps) {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/80 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-2">
            <Logo size="md" />
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md font-light">
              VISIONARY BARBER SHOP representa la evolución del estilo urbano masculino en Guatemala. Fusionamos precisión clásica a navaja libre con estética monocromática contemporánea.
            </p>
            <div className="text-[11px] font-mono text-zinc-500">
              Sede Zona 6 • Sede Zona 5 • Ciudad de Guatemala
            </div>
          </div>

          {/* Col 2: Sedes y Waze */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Sedes & Waze
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a
                  href="https://waze.com/ul?q=https://maps.app.goo.gl/kr8xpP1SEefd2QdE6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Zona 6: Waze Directo</span>
                </a>
              </li>
              <li>
                <a
                  href="https://waze.com/ul?q=https://maps.app.goo.gl/eNorgV6reEc4xdWV7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Zona 5: Waze Directo</span>
                </a>
              </li>
              <li>
                <span className="text-[11px] font-mono text-zinc-500">Lun - Sáb: 8:30 AM - 7:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Acceso Interno */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white">
              Portal Interno
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Acceso restringido para el equipo de barbería, recepción y gerencia.
            </p>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Acceso Staff</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © {new Date().getFullYear()} VISIONARY BARBER SHOP. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Zona 6 & Zona 5</span>
            <span>Monochrome Aesthetic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

