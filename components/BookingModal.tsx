'use client';

import React, { useState } from 'react';
import { X, Check, MessageSquare, AlertCircle, Calendar, Clock, Scissors, MapPin } from 'lucide-react';
import { BarberData } from './BarbersSection';
import { ServiceItem, SERVICES_CATALOG } from './ServicesCatalog';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber: BarberData | null;
  initialTime: string;
  initialDate: string;
  initialService: ServiceItem | null;
  onBookingSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  barber,
  initialTime,
  initialDate,
  initialService,
  onBookingSuccess,
}: BookingModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [selectedServiceId, setSelectedServiceId] = useState(initialService?.id || 'srv-corte');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Sync state if props change when opening
  React.useEffect(() => {
    if (initialTime) setSelectedTime(initialTime);
    if (initialDate) setSelectedDate(initialDate);
    if (initialService) setSelectedServiceId(initialService.id);
    setErrorMessage('');
    setConfirmedAppointment(null);
  }, [initialTime, initialDate, initialService, isOpen]);

  if (!isOpen || !barber) return null;

  const activeService = SERVICES_CATALOG.find((s) => s.id === selectedServiceId) || SERVICES_CATALOG[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          date: selectedDate,
          time: selectedTime,
          barberId: barber.id,
          locationId: barber.locationId,
          serviceId: activeService.id,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo reservar la cita.');
      }

      setConfirmedAppointment(data.appointment);
      onBookingSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Message Formatter
  const getWhatsAppUrl = (apt: any) => {
    const text = `*CONFIRMACIÓN DE CITA - VISIONARY BARBER SHOP*%0A%0A` +
      `*Código:* ${apt.code}%0A` +
      `*Cliente:* ${apt.clientName}%0A` +
      `*Servicio:* ${activeService.name} (${activeService.priceText})%0A` +
      `*Barbero:* ${barber.name}%0A` +
      `*Sede:* ${barber.locationName}%0A` +
      `*Fecha:* ${apt.date}%0A` +
      `*Hora:* ${apt.time}%0A%0A` +
      `_¡Nos vemos pronto en VISIONARY!_`;
    return `https://wa.me/?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121215] border border-zinc-800 w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedAppointment ? (
          /* SUCCESS VIEW */
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 bg-zinc-900 text-white border border-zinc-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">
                Reserva Exitosa
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                ¡Cita Confirmada!
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tu horario ha quedado bloqueado en tiempo real en el sistema central de VISIONARY.
              </p>
            </div>

            {/* Appointment Summary Box */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 text-left text-xs font-mono space-y-2.5 text-zinc-300">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">CÓDIGO DE RESERVA:</span>
                <strong className="text-white font-bold">{confirmedAppointment.code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CLIENTE:</span>
                <span className="text-white">{confirmedAppointment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">TELÉFONO:</span>
                <span className="text-zinc-300">{confirmedAppointment.clientPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SERVICIO:</span>
                <span className="text-white">{activeService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">TARIFA:</span>
                <span className="text-white font-bold">{activeService.priceText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">BARBERO:</span>
                <span className="text-white">{barber.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SEDE:</span>
                <span className="text-white">{barber.locationName}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-500">FECHA & HORA:</span>
                <strong className="text-white">{confirmedAppointment.date} a las {confirmedAppointment.time}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={getWhatsAppUrl(confirmedAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Confirmación por WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div>
            {/* Header info */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={barber.photoUrl}
                alt={barber.name}
                className="w-14 h-14 rounded-2xl object-cover border border-zinc-700 grayscale contrast-125"
              />
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-700 text-zinc-300 uppercase">
                  {barber.locationName}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Agendar con {barber.name}
                </h3>
                <p className="text-xs text-zinc-400">{barber.specialty}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-white shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Tipo de Servicio Solicitado</span>
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3.5 rounded-xl focus:outline-none focus:border-zinc-500 font-medium"
                >
                  {SERVICES_CATALOG.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.priceText}) — {s.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Nombre Completo del Cliente
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo Álvarez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white p-3.5 rounded-xl focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Client Phone */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 55443322"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white p-3.5 rounded-xl focus:outline-none focus:border-zinc-500 font-mono"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Fecha</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3.5 rounded-xl focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Hora</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    required
                    value={selectedTime}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-mono font-bold p-3.5 rounded-xl focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                  Notas / Detalles Especiales (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Llevaré foto de referencia para fade..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3.5 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-3.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <span>Bloqueando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar Cita</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

