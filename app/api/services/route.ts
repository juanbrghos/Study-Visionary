import { NextResponse } from 'next/server';
import { getServices } from '@/lib/db';

export async function GET() {
  try {
    const services = getServices();
    return NextResponse.json({ services });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

