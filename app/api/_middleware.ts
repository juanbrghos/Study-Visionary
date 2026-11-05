import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';

// Simple in-memory rate limiter: max 20 requests per minute per IP
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;
const ipMap = new Map<string, { timestamps: number[] }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = ipMap.get(ip) ?? { timestamps: [] };
  // Remove timestamps older than window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT) {
    ipMap.set(ip, entry);
    return true;
  }
  entry.timestamps.push(now);
  ipMap.set(ip, entry);
  return false;
}

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Rate limiting for all API routes
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('client-ip') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes, intente más tarde' }, { status: 429 });
  }

  // Public endpoints that don't need auth (e.g., health checks) can be added here.
  // For simplicity, assume all /api/* require authentication via custom headers.
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (!email || !role) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const user = getUserByEmail(email);
  if (!user || user.role !== role) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  // Role based access control
  if (pathname.startsWith('/api/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/appointments/walkin')) {
    if (role !== 'CASHIER') {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/appointments/') && request.method === 'PATCH') {
    // Allow BARBER to update own appointments, admin as well
    if (role !== 'BARBER' && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }
  }

  // If all checks pass, continue
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};

