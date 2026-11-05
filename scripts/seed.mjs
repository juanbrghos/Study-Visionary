import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'visionary.db');
const db = new DatabaseSync(DB_PATH);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    googleMapsUrl TEXT NOT NULL,
    wazeUrl TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL,
    priceText TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    bio TEXT NOT NULL,
    photoUrl TEXT NOT NULL,
    locationId TEXT NOT NULL,
    userId TEXT UNIQUE,
    availableHours TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    clientName TEXT NOT NULL,
    clientPhone TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    serviceId TEXT,
    serviceName TEXT,
    barberId TEXT NOT NULL,
    locationId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDIENTE',
    isWalkIn INTEGER NOT NULL DEFAULT 0,
    amountPaid REAL,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (barberId) REFERENCES barbers(id) ON DELETE CASCADE,
    FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barberId, date, time);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
`);

// Clear or check existing
const count = db.prepare('SELECT count(*) as count FROM users').get().count;
if (count > 0) {
  console.log('Database already has users. Re-seeding clean records...');
  db.exec(`
    DELETE FROM appointments;
    DELETE FROM barbers;
    DELETE FROM services;
    DELETE FROM locations;
    DELETE FROM users;
  `);
}

const now = new Date().toISOString();

// Locations
const insertLoc = db.prepare(`
  INSERT INTO locations (id, name, title, address, googleMapsUrl, wazeUrl, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertLoc.run('loc-z6', 'Zona 6', 'Sede Zona 6 - Calle Real', 'Calle Real y 15 Avenida, Zona 6, Ciudad de Guatemala', 'https://maps.app.goo.gl/kr8xpP1SEefd2QdE6', 'https://waze.com/ul?q=https://maps.app.goo.gl/kr8xpP1SEefd2QdE6', now);
insertLoc.run('loc-z5', 'Zona 5', 'Sede Zona 5 - Bulevar Central', 'Bulevar Los Jardines 22-10, Zona 5, Ciudad de Guatemala', 'https://maps.app.goo.gl/eNorgV6reEc4xdWV7', 'https://waze.com/ul?q=https://maps.app.goo.gl/eNorgV6reEc4xdWV7', now);

// Services
const insertService = db.prepare(`
  INSERT INTO services (id, name, category, description, price, priceText, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const services = [
  { id: 'srv-corte', name: 'Corte de Cabello Normal / Fade', category: 'Corte de Cabello', description: 'Corte completo a tijera y máquina con perfilado y peinado.', price: 50, priceText: 'Q50' },
  { id: 'srv-cejas', name: 'Retoque de Cejas', category: 'Barba y Cejas', description: 'Delineado a navaja para una mirada limpia y definida.', price: 10, priceText: 'Q10' },
  { id: 'srv-barba', name: 'Arreglo de Barba', category: 'Barba y Cejas', description: 'Toalla caliente, aceites esenciales y navaja tradicional.', price: 15, priceText: 'Q15' },
  { id: 'srv-tatuajes', name: 'Tatuajes Artísticos', category: 'Tatuajes', description: 'Fine-line, blackwork y sombras con tintas prémium.', price: null, priceText: 'Según diseño' },
  { id: 'srv-unas', name: 'Diseño de Uñas', category: 'Uñas', description: 'Manicura urbana, limpieza profunda y estilos de autor.', price: null, priceText: 'Según diseño' },
  { id: 'srv-pelo', name: 'Pintado / Tinta de Pelo', category: 'Pintado / Tinta de Pelo', description: 'Decoloración platinada, color fantasía o cobertura de canas.', price: null, priceText: 'Según diseño' },
];

for (const s of services) {
  insertService.run(s.id, s.name, s.category, s.description, s.price, s.priceText, now);
}

// Users & Barbers
const insertUser = db.prepare(`
  INSERT INTO users (id, email, passwordHash, name, role, createdAt)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertUser.run('usr-admin', 'admin@visionary.com', hashPassword('AdminVisionary2026!'), 'Administrador General', 'ADMIN', now);
insertUser.run('usr-cobrador', 'cobrador@visionary.com', hashPassword('CobradorVisionary2026!'), 'Caja y Recepción', 'CASHIER', now);

const insertBarber = db.prepare(`
  INSERT INTO barbers (id, name, specialty, bio, photoUrl, locationId, userId, availableHours, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const barbers = [
  // Zona 6
  {
    barberId: 'barber-z6-1',
    userId: 'usr-barber-z6-1',
    name: 'Carlos Ruiz',
    email: 'carlos.z6@visionary.com',
    pass: 'BarberZ6#1',
    locationId: 'loc-z6',
    specialty: 'Especialista Fade & Diseños',
    bio: 'Pionero en fades milimétricos y arte freestyle con navaja.',
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
    bio: 'Maestro de la toalla caliente, perfilado milimétrico y corte clásico.',
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
    bio: 'Experto en rubios platinados, decoloración y diseños geométricos.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    hours: ['10:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:00 PM', '05:30 PM'],
  },
  // Zona 5
  {
    barberId: 'barber-z5-1',
    userId: 'usr-barber-z5-1',
    name: 'Javier Gómez',
    email: 'javier.z5@visionary.com',
    pass: 'BarberZ5#1',
    locationId: 'loc-z5',
    specialty: 'Cortes Clásicos & Cejas',
    bio: 'Elegancia sobria, cortes ejecutivos y perfilado a navaja libre.',
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
    bio: 'Técnica en desvanecidos limpios y tatuajes finos personalizados.',
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
    bio: 'Diseño de uñas con técnica moderna y estilismo urbano exclusivo.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    hours: ['10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
  },
];

for (const b of barbers) {
  insertUser.run(b.userId, b.email, hashPassword(b.pass), b.name, 'BARBER', now);
  insertBarber.run(b.barberId, b.name, b.specialty, b.bio, b.photoUrl, b.locationId, b.userId, JSON.stringify(b.hours), now);
}

// Sample initial appointments
const insertApt = db.prepare(`
  INSERT INTO appointments (
    id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const todayStr = new Date().toISOString().split('T')[0];

const sampleApts = [
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
    serviceName: 'Arreglo de Barba',
    barberId: 'barber-z6-1',
    locationId: 'loc-z6',
    status: 'EN_PROCESO',
    isWalkIn: 0,
    amountPaid: null,
    notes: 'Toalla caliente',
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
    notes: 'WhatsApp confirmado',
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
    notes: 'Tatuaje fine-line',
  },
];

for (const a of sampleApts) {
  insertApt.run(a.id, a.code, a.clientName, a.clientPhone, a.date, a.time, a.serviceId, a.serviceName, a.barberId, a.locationId, a.status, a.isWalkIn, a.amountPaid, a.notes, now, now);
}

console.log('✓ Seeding complete: 2 Locations, 6 Services, 8 Users (Admin, Cashier, 6 Barbers), 6 Barbers profiles, 5 Appointments.');

