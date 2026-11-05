export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { updateAppointmentStatus, deleteAppointment } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, amountPaid } = body;

    if (!status) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    const updated = await updateAppointmentStatus(id, status, amountPaid);
    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await deleteAppointment(id);
    return NextResponse.json({ success: true, message: 'Cita eliminada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

