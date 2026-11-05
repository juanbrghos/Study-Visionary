import { NextResponse } from 'next/server';
import { getLocations } from '@/lib/db';

export async function GET() {
  try {
    const locations = await getLocations();
    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

