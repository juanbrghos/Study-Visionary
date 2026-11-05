import { getDb, hashPassword } from './db';
import crypto from 'node:crypto';

export function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const userCount = (db.prepare('SELECT count(*) as count FROM users').get() as { count: number }).count;
  if (userCount > 0) {
    return { message: 'Database already seeded' };
  }

  const now = new Date().toISOString();

  // 1. LOCATIONS
  const insertLoc = db.prepare(`
    INSERT INTO locations (id, name, title, address, googleMapsUrl, wazeUrl, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLoc.run(
    'loc-z6',
    'Zona 6',
    'Sede Zona 6 - Calle Real',
    'Calle Real y 15 Avenida, Zona 6, Ciudad de Guatemala',
    'https://maps.app.goo.gl/kr8xpP1SEefd2QdE6',
    'https://waze.com/ul?q=https://maps.app.goo.gl/kr8xpP1SEefd2QdE6',
    now
  );

  insertLoc.run(
    'loc-z5',
    'Zona 5',
    'Sede Zona 5 - Bulevar Central',
    'Bulevar Los Jardines 22-10, Zona 5, Ciudad de Guatemala',
    'https://maps.app.goo.gl/eNorgV6reEc4xdWV7',
    'https://waze.com/ul?q=https://maps.app.goo.gl/eNorgV6reEc4xdWV7',
    now
  );

  // 2. SERVICES
  const insertService = db.prepare(`
    INSERT INTO services (id, name, category, description, price, priceText, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const servicesData = [
    {
      id: 'srv-corte',
      name: 'Corte de Cabello Normal / Fade',
      category: 'Corte de Cabello',
      description: 'Corte completo personalizado a navaja y tijera con perfilado y peinado.',
      price: 50,
      priceText: 'Q50',
    },
    {
      id: 'srv-cejas',
      name: 'Retoque y Perfilado de Cejas',
      category: 'Barba y Cejas',
      description: 'Delineado preciso a navaja y depilación de exceso.',
      price: 10,
      priceText: 'Q10',
    },
    {
      id: 'srv-barba',
      name: 'Arreglo y Afeitado de Barba',
      category: 'Barba y Cejas',
      description: 'Ritual con toalla caliente, vapor, aceites hidratantes y navaja tradicional.',
      price: 15,
      priceText: 'Q15',
    },
    {
      id: 'srv-tatuajes',
      name: 'Tatuajes Artísticos',
      category: 'Tatuajes',
      description: 'Piezas fine-line, blackwork y sombras. Valor sujeto a tamaño y complejidad.',
      price: null,
      priceText: 'Según diseño',
    },
    {
      id: 'srv-unas',
      name: 'Diseño y Cuidado de Uñas',
      category: 'Uñas',
      description: 'Manicura urbana completa, limpieza profunda, esmaltado y nail art personalizado.',
      price: null,
      priceText: 'Según diseño',
    },
    {
      id: 'srv-pelo',
      name: 'Pintado / Tinta de Pelo',
      category: 'Pintado / Tinta de Pelo',
      description: 'Decoloración profesional, tonos platinados, fantasía o cobertura de canas.',
      price: null,
      priceText: 'Según diseño',
    },
  ];

  for (const s of servicesData) {
    insertService.run(s.id, s.name, s.category, s.description, s.price, s.priceText, now);
  }

  // 3. USERS (ADMIN, CASHIER, BARBERS)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, passwordHash, name, role, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Admin
  insertUser.run(
    'usr-admin',
    'admin@visionary.com',
    hashPassword('AdminVisionary2026!'),
    'Administrador General',
    'ADMIN',
    now
  );

  // Cobrador
  insertUser.run(
    'usr-cobrador',
    'cobrador@visionary.com',
    hashPassword('CobradorVisionary2026!'),
    'Caja & Recepción',
    'CASHIER',
    now
  );

  // Barber Users & Barbers Data
  const insertBarber = db.prepare(`
    INSERT INTO barbers (id, name, specialty, bio, photoUrl, locationId, userId, availableHours, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const barbersData = [
    // ZONA 6
    {
      barberId: 'barber-z6-1',
      userId: 'usr-barber-z6-1',
      name: 'Carlos Ruiz',
      email: 'carlos.z6@visionary.com',
      pass: 'BarberZ6#1',
      locationId: 'loc-z6',
      specialty: 'Especialista Fade & Diseños',
      bio: 'Pionero en fades milimétricos a ras de piel y cortes geométricos de impacto.',
      photoUrl: 'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?auto=format&fit=crop&q=80&w=400',
      hours: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
    },
    {
      barberId: 'barber-z6-2',
      userId: 'usr-barber-z6-2',
      name: 'David Morales',
      email: 'david.z6@visionary.com',
      pass: 'BarberZ6#2',
      locationId: 'loc-z6',
      specialty: 'Especialista Barba & Tijera',
      bio: 'Maestro artesano del afeitado clásico con toalla caliente y texturizados tijera sobre peine.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      hours: ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
    },
    {
      barberId: 'barber-z6-3',
      userId: 'usr-barber-z6-3',
      name: 'Mateo López',
      email: 'mateo.z6@visionary.com',
      pass: 'BarberZ6#3',
      locationId: 'loc-z6',
      specialty: 'Colorimetría & Freestyle',
      bio: 'Experto en rubios platinados, degradados monocromáticos y líneas tribales contemporáneas.',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      hours: ['10:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:00 PM', '05:30 PM'],
    },
    // ZONA 5
    {
      barberId: 'barber-z5-1',
      userId: 'usr-barber-z5-1',
      name: 'Javier Gómez',
      email: 'javier.z5@visionary.com',
      pass: 'BarberZ5#1',
      locationId: 'loc-z5',
      specialty: 'Cortes Clásicos & Cejas',
      bio: 'Cortes ejecutivos de porte elegante, perfiles nítidos y diseño de cejas a navaja.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      hours: ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
    },
    {
      barberId: 'barber-z5-2',
      userId: 'usr-barber-z5-2',
      name: 'Andrés Pérez',
      email: 'andres.z5@visionary.com',
      pass: 'BarberZ5#2',
      locationId: 'loc-z5',
      specialty: 'Fades & Tatuajes',
      bio: 'Técnica pulida de degradados ultra oscuros a claros y aplicación de tatuajes fine line.',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
      hours: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:00 PM'],
    },
    {
      barberId: 'barber-z5-3',
      userId: 'usr-barber-z5-3',
      name: 'Samuel Hernández',
      email: 'samuel.z5@visionary.com',
      pass: 'BarberZ5#3',
      locationId: 'loc-z5',
      specialty: 'Diseño de Uñas & Freestyle',
      bio: 'Especialista en arte en uñas, estilismo urbano experimental y cortes vanguardistas.',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      hours: ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
    },
  ];

  for (const b of barbersData) {
    insertUser.run(
      b.userId,
      b.email,
      hashPassword(b.pass),
      b.name,
      'BARBER',
      now
    );

    insertBarber.run(
      b.barberId,
      b.name,
      b.specialty,
      b.bio,
      b.photoUrl,
      b.locationId,
      b.userId,
      JSON.stringify(b.hours),
      now
    );
  }

  // 4. INITIAL SEED APPOINTMENTS
  const insertApt = db.prepare(`
    INSERT INTO appointments (
      id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const todayStr = new Date().toISOString().split('T')[0];

  const initialAppointments = [
    {
      id: 'apt-001',
      code: 'VIS-7821',
      clientName: 'Alejandro Morales',
      clientPhone: '50241415522',
      date: todayStr,
      time: '09:00 AM',
      serviceId: 'srv-corte',
      serviceName: 'Corte de Cabello Normal / Fade',
      barberId: 'barber-z6-1',
      locationId: 'loc-z6',
      status: 'REALIZADA',
      isWalkIn: 0,
      amountPaid: 50,
      notes: 'Cliente puntual, fade medio',
    },
    {
      id: 'apt-002',
      code: 'VIS-7822',
      clientName: 'Fernando Castillo',
      clientPhone: '50255331199',
      date: todayStr,
      time: '10:00 AM',
      serviceId: 'srv-barba',
      serviceName: 'Arreglo y Afeitado de Barba',
      barberId: 'barber-z6-1',
      locationId: 'loc-z6',
      status: 'EN_PROCESO',
      isWalkIn: 0,
      amountPaid: null,
      notes: 'Toalla caliente requerida',
    },
    {
      id: 'apt-003',
      code: 'VIS-7823',
      clientName: 'Rodrigo Fuentes',
      clientPhone: '50230304411',
      date: todayStr,
      time: '11:00 AM',
      serviceId: 'srv-corte',
      serviceName: 'Corte de Cabello Normal / Fade',
      barberId: 'barber-z6-1',
      locationId: 'loc-z6',
      status: 'PENDIENTE',
      isWalkIn: 0,
      amountPaid: null,
      notes: 'Confirmado por WhatsApp',
    },
    {
      id: 'apt-004',
      code: 'VIS-7824',
      clientName: 'Mario Lemus (Walk-in)',
      clientPhone: 'Atención Directa',
      date: todayStr,
      time: '09:30 AM',
      serviceId: 'srv-corte',
      serviceName: 'Corte de Cabello Normal / Fade',
      barberId: 'barber-z5-1',
      locationId: 'loc-z5',
      status: 'REALIZADA',
      isWalkIn: 1,
      amountPaid: 50,
      notes: 'Cliente en mostrador',
    },
    {
      id: 'apt-005',
      code: 'VIS-7825',
      clientName: 'Christian Vega',
      clientPhone: '50249887766',
      date: todayStr,
      time: '02:00 PM',
      serviceId: 'srv-tatuajes',
      serviceName: 'Tatuajes Artísticos',
      barberId: 'barber-z5-2',
      locationId: 'loc-z5',
      status: 'PENDIENTE',
      isWalkIn: 0,
      amountPaid: null,
      notes: 'Diseño geométrico brazo izquierdo',
    },
  ];

  for (const a of initialAppointments) {
    insertApt.run(
      a.id,
      a.code,
      a.clientName,
      a.clientPhone,
      a.date,
      a.time,
      a.serviceId,
      a.serviceName,
      a.barberId,
      a.locationId,
      a.status,
      a.isWalkIn,
      a.amountPaid,
      a.notes,
      now,
      now
    );
  }

  return { message: 'Database seeded successfully with all roles, barbers, and services!' };
}

