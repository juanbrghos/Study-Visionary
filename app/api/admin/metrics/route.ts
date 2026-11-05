import { NextResponse } from 'next/server';
import { getAdminMetrics } from '@/lib/db';

export async function GET() {
  try {
    const metrics = getAdminMetrics();
    return NextResponse.json({ metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

