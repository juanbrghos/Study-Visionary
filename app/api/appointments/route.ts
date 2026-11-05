import { NextResponse } from 'next/server';
import { getAppointments, createAppointment } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId') || undefined;
    const locationId = searchParams.get('locationId') || undefined;
    const date = searchParams.get('date') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const appointments = await getAppointments({
      barberId,
      locationId,
      date,
      status,
      search,
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, date, time, barberId, locationId, serviceId, notes } = body;

    if (!clientName || !clientPhone || !date || !time || !barberId || !locationId) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para agendar la cita' },
        { status: 400 }
      );
    }

    const appointment = await createAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date,
      time,
      barberId,
      locationId,
      serviceId,
      notes,
    });

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Cita reservada con éxito',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al agendar cita' }, { status: 400 });
  }
}

