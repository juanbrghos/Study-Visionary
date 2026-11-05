import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// --- Funciones helper para las rutas API de Next.js ---

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
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

export async function createAppointment(data: {
  code: string;
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
  return await prisma.appointment.create({
    data,
  });
}

export async function createWalkIn(data: {
  code: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  serviceId?: string;
  serviceName?: string;
  barberId: string;
  locationId: string;
  amountPaid?: number;
  notes?: string;
}) {
  return await prisma.appointment.create({
    data: {
      ...data,
      isWalkIn: true,
      status: 'REALIZADA',
    },
  });
}

export async function authenticateUser(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
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