import { NextResponse } from 'next/server';
import { createWalkIn } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, barberId, locationId, serviceId, serviceName, amountPaid, notes } = body;

    if (!clientName || !barberId || !locationId) {
      return NextResponse.json(
        { error: 'Nombre del cliente, barbero y sede son requeridos' },
        { status: 400 }
      );
    }

    const walkIn = await createWalkIn({
      clientName: clientName.trim(),
      barberId,
      locationId,
      serviceId,
      serviceName,
      amountPaid: Number(amountPaid) || 50,
      notes,
    });

    return NextResponse.json({
      success: true,
      appointment: walkIn,
      message: 'Cliente Walk-in registrado y cobrado con éxito',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

