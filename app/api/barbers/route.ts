export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getBarbers, createBarber, updateBarberHours } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId') || undefined;
    const barbers = await getBarbers(locationId);
    return NextResponse.json({ barbers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'updateHours') {
      const updated = await updateBarberHours(body.barberId, body.hours);
      return NextResponse.json({ success: true, barber: updated });
    }

    const newBarber = await createBarber(body);
    return NextResponse.json({ success: true, barber: newBarber }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

