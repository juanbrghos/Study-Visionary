export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getReservedSlots } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const barberId = searchParams.get('barberId');
    const date = searchParams.get('date');

    if (!barberId || !date) {
      return NextResponse.json(
        { error: 'barberId y date son obligatorios' },
        { status: 400 }
      );
    }

    const reservedSlots = getReservedSlots(barberId, date);
    return NextResponse.json({
      barberId,
      date,
      reservedSlots,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

