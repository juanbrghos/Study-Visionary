import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function getDb(): any {
  // Return the Prisma client as a generic 'any' so legacy seed scripts that expect a
  // raw SQLite interface (db.prepare) will still type‑check. Runtime behaviour still
  // uses Prisma for all API calls.
  return prisma as any;
}

export function hashPassword(password: string): string {
  // Simple SHA‑256 hash for demo purposes; replace with bcrypt in production.
  return crypto.createHash('sha256').update(password).digest('hex');
}


// --- Funciones helper para las rutas API de Next.js ---

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function getLocations() {
  return await prisma.location.findMany({
    include: { barbers: true },
  });
}

export async function getServices() {
  return await prisma.service.findMany();
}



export async function getBarbers(locationId?: string) {
  return await prisma.barber.findMany({
    where: locationId ? { locationId } : undefined,
    include: { location: true },
  });
}

export async function createBarber(data: {
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  locationId: string;
  availableHours: string;
}) {
  return await prisma.barber.create({
    data,
  });
}

export async function updateBarberHours(id: string, availableHours: string) {
  return await prisma.barber.update({
    where: { id },
    data: { availableHours },
  });
}

export async function getReservedSlots(barberId: string, date: string) {
  const appointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date,
      status: { not: 'CANCELADA' },
    },
    select: { time: true },
  });
  return appointments.map((a) => a.time);
}

export async function getAppointments(filters?: {
  barberId?: string;
  locationId?: string;
  date?: string;
  status?: string;
  search?: string;
}) {
  const { barberId, locationId, date, status, search } = filters || {};

  return await prisma.appointment.findMany({
    where: {
      ...(barberId && { barberId }),
      ...(locationId && { locationId }),
      ...(date && { date }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { clientName: { contains: search, mode: 'insensitive' } },
          { clientPhone: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      barber: true,
      location: true,
      service: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createAppointment(data: {
  code?: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  serviceId?: string;
  serviceName?: string;
  barberId: string;
  locationId: string;
  notes?: string;
}) {
  const generatedCode = data.code || `VIS-${Math.floor(1000 + Math.random() * 9000)}`;

  return await prisma.appointment.create({
    data: {
      ...data,
      code: generatedCode,
    },
  });
}

export async function createWalkIn(data: {
  code?: string;
  clientName: string;
  clientPhone?: string;
  date?: string;
  time?: string;
  serviceId?: string;
  serviceName?: string;
  barberId: string;
  locationId: string;
  amountPaid?: number;
  notes?: string;
}) {
  const generatedCode = data.code || `WALK-${Math.floor(1000 + Math.random() * 9000)}`;
  const today = new Date().toISOString().split('T')[0];

  return await prisma.appointment.create({
    data: {
      code: generatedCode,
      clientName: data.clientName,
      clientPhone: data.clientPhone || 'N/A',
      date: data.date || today,
      time: data.time || 'NOW',
      barberId: data.barberId,
      locationId: data.locationId,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      amountPaid: data.amountPaid ?? 50,
      notes: data.notes,
      isWalkIn: true,
      status: 'REALIZADA',
    },
  });
}

export async function authenticateUser(email: string, password?: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  if (password && user.passwordHash !== password) {
    return null;
  }

  return user;
}

export async function getAdminMetrics() {
  const [totalAppointments, totalBarbers, totalLocations] = await Promise.all([
    prisma.appointment.count(),
    prisma.barber.count(),
    prisma.location.count(),
  ]);

  return {
    totalAppointments,
    totalBarbers,
    totalLocations,
  };
}

export async function updateAppointmentStatus(id: string, status: string, amountPaid?: number) {
  return await prisma.appointment.update({
    where: { id },
    data: {
      status,
      ...(amountPaid !== undefined && { amountPaid }),
    },
  });
}

export async function deleteAppointment(id: string) {
  return await prisma.appointment.delete({
    where: { id },
  });
}