import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'visionary.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initTables(dbInstance);
  }
  return dbInstance;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

function initTables(db: DatabaseSync) {
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
}

// AUTHENTICATION
export function getUserByEmail(email: string) {
  const db = getDb();
  const row = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get(email) as any;
  return row || null;
}
export function authenticateUser(email: string, pass: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!row) return null;

  const valid = verifyPassword(pass, row.passwordHash);
  if (!valid) return null;

  let barber = null;
  if (row.role === 'BARBER') {
    barber = db.prepare('SELECT b.*, l.name as locationName FROM barbers b LEFT JOIN locations l ON b.locationId = l.id WHERE b.userId = ?').get(row.id) as any;
    if (barber && barber.availableHours) {
      try {
        barber.availableHours = JSON.parse(barber.availableHours);
      } catch {
        barber.availableHours = [];
      }
    }
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    barber: barber || undefined,
  };
}

// LOCATIONS & SERVICES
export function getLocations() {
  const db = getDb();
  return db.prepare('SELECT * FROM locations ORDER BY name ASC').all() as any[];
}

export function getServices() {
  const db = getDb();
  return db.prepare('SELECT * FROM services ORDER BY price ASC').all() as any[];
}

// BARBERS
export function getBarbers(locationId?: string) {
  const db = getDb();
  let sql = `
    SELECT b.*, l.name as locationName, l.title as locationTitle 
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
  `;
  const params: any[] = [];
  if (locationId) {
    sql += ' WHERE b.locationId = ? OR l.name = ?';
    params.push(locationId, locationId);
  }
  sql += ' ORDER BY b.name ASC';

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map((r) => {
    try {
      r.availableHours = JSON.parse(r.availableHours);
    } catch {
      r.availableHours = [];
    }
    return r;
  });
}

export function getBarberById(barberId: string) {
  const db = getDb();
  const row = db.prepare(`
    SELECT b.*, l.name as locationName, l.title as locationTitle 
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
    WHERE b.id = ?
  `).get(barberId) as any;

  if (row) {
    try {
      row.availableHours = JSON.parse(row.availableHours);
    } catch {
      row.availableHours = [];
    }
  }
  return row;
}

// AVAILABILITY SYNC (REAL TIME)
export function getReservedSlots(barberId: string, date: string): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT time FROM appointments 
    WHERE barberId = ? 
      AND date = ? 
      AND status != 'CANCELADA'
  `).all(barberId, date) as { time: string }[];

  return rows.map((r) => r.time);
}

// APPOINTMENTS
export interface AppointmentFilter {
  barberId?: string;
  locationId?: string;
  date?: string;
  status?: string;
  search?: string;
}

export function getAppointments(filters: AppointmentFilter = {}) {
  const db = getDb();
  let sql = `
    SELECT 
      a.*,
      b.name as barberName,
      b.specialty as barberSpecialty,
      l.name as locationName,
      l.title as locationTitle,
      s.name as fullServiceName,
      s.priceText as servicePriceText
    FROM appointments a
    JOIN barbers b ON a.barberId = b.id
    JOIN locations l ON a.locationId = l.id
    LEFT JOIN services s ON a.serviceId = s.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters.barberId) {
    sql += ' AND a.barberId = ?';
    params.push(filters.barberId);
  }
  if (filters.locationId) {
    sql += ' AND (a.locationId = ? OR l.name = ?)';
    params.push(filters.locationId, filters.locationId);
  }
  if (filters.date) {
    sql += ' AND a.date = ?';
    params.push(filters.date);
  }
  if (filters.status) {
    sql += ' AND a.status = ?';
    params.push(filters.status);
  }
  if (filters.search) {
    sql += ' AND (a.clientName LIKE ? OR a.clientPhone LIKE ? OR a.code LIKE ?)';
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY a.date DESC, a.time ASC, a.createdAt DESC';
  return db.prepare(sql).all(...params) as any[];
}

export function createAppointment(data: {
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
  const db = getDb();

  // Check if slot is already occupied
  const existing = db.prepare(`
    SELECT id FROM appointments 
    WHERE barberId = ? AND date = ? AND time = ? AND status != 'CANCELADA'
  `).get(data.barberId, data.date, data.time);

  if (existing) {
    throw new Error('Este horario ya ha sido reservado por otro cliente. Por favor elige otro horario.');
  }

  // Get service if not provided
  let serviceName = data.serviceName;
  let servicePrice = null;
  if (data.serviceId) {
    const s = db.prepare('SELECT name, price FROM services WHERE id = ?').get(data.serviceId) as any;
    if (s) {
      serviceName = s.name;
      servicePrice = s.price;
    }
  }

  const id = 'apt-' + crypto.randomUUID().slice(0, 8);
  const code = 'VIS-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO appointments (
      id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', 0, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    code,
    data.clientName,
    data.clientPhone,
    data.date,
    data.time,
    data.serviceId || null,
    serviceName || 'Corte General',
    data.barberId,
    data.locationId,
    servicePrice,
    data.notes || null,
    now,
    now
  );

  return db.prepare(`
    SELECT a.*, b.name as barberName, l.name as locationName 
    FROM appointments a
    JOIN barbers b ON a.barberId = b.id
    JOIN locations l ON a.locationId = l.id
    WHERE a.id = ?
  `).get(id) as any;
}

export function createWalkIn(data: {
  clientName: string;
  barberId: string;
  locationId: string;
  serviceId?: string;
  serviceName?: string;
  amountPaid: number;
  notes?: string;
}) {
  const db = getDb();
  const id = 'walk-' + crypto.randomUUID().slice(0, 8);
  const code = 'WLK-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  let serviceName = data.serviceName;
  if (data.serviceId && !serviceName) {
    const s = db.prepare('SELECT name FROM services WHERE id = ?').get(data.serviceId) as any;
    if (s) serviceName = s.name;
  }

  const insert = db.prepare(`
    INSERT INTO appointments (
      id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, 'Atención Directa', ?, ?, ?, ?, ?, ?, 'REALIZADA', 1, ?, ?, ?, ?)
  `);

  insert.run(
    id,
    code,
    data.clientName + ' (Walk-in)',
    today,
    time,
    data.serviceId || null,
    serviceName || 'Corte Walk-in',
    data.barberId,
    data.locationId,
    data.amountPaid || 50,
    data.notes || 'Cliente atendido sin cita previa',
    now,
    now
  );

  return db.prepare(`
    SELECT a.*, b.name as barberName, l.name as locationName 
    FROM appointments a
    JOIN barbers b ON a.barberId = b.id
    JOIN locations l ON a.locationId = l.id
    WHERE a.id = ?
  `).get(id) as any;
}

export function updateAppointmentStatus(id: string, status: string, amountPaid?: number) {
  const db = getDb();
  const now = new Date().toISOString();

  if (amountPaid !== undefined && amountPaid !== null) {
    db.prepare(`
      UPDATE appointments 
      SET status = ?, amountPaid = ?, updatedAt = ? 
      WHERE id = ?
    `).run(status, amountPaid, now, id);
  } else {
    db.prepare(`
      UPDATE appointments 
      SET status = ?, updatedAt = ? 
      WHERE id = ?
    `).run(status, now, id);
  }

  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
}

export function deleteAppointment(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  return { success: true };
}

// ADMIN DASHBOARD METRICS
export function getAdminMetrics() {
  const db = getDb();

  const totalAppointments = (db.prepare('SELECT count(*) as c FROM appointments').get() as any).c;
  const completedAppointments = (db.prepare("SELECT count(*) as c FROM appointments WHERE status = 'REALIZADA'").get() as any).c;
  const pendingAppointments = (db.prepare("SELECT count(*) as c FROM appointments WHERE status = 'PENDIENTE'").get() as any).c;
  const inProgressAppointments = (db.prepare("SELECT count(*) as c FROM appointments WHERE status = 'EN_PROCESO'").get() as any).c;

  // Total revenue calculated from real paid amounts + standard Q50 for completed without explicit amount
  const revenueRow = db.prepare(`
    SELECT COALESCE(SUM(COALESCE(amountPaid, 50)), 0) as totalRevenue 
    FROM appointments 
    WHERE status = 'REALIZADA'
  `).get() as any;
  const totalRevenue = revenueRow?.totalRevenue || 0;

  // Distribution by location
  const z6Total = (db.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 6'
  `).get() as any).c;

  const z5Total = (db.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 5'
  `).get() as any).c;

  const z6Completed = (db.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 6' AND a.status = 'REALIZADA'
  `).get() as any).c;

  const z5Completed = (db.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 5' AND a.status = 'REALIZADA'
  `).get() as any).c;

  // Barber workload
  const barbersWorkload = db.prepare(`
    SELECT 
      b.id, b.name, b.specialty, l.name as locationName,
      COUNT(a.id) as totalAppointments,
      SUM(CASE WHEN a.status = 'REALIZADA' THEN 1 ELSE 0 END) as completedAppointments
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
    LEFT JOIN appointments a ON b.id = a.barberId
    GROUP BY b.id
    ORDER BY totalAppointments DESC
  `).all() as any[];

  return {
    totalAppointments,
    completedAppointments,
    pendingAppointments,
    inProgressAppointments,
    totalRevenue,
    locations: {
      zona6: {
        total: z6Total,
        completed: z6Completed,
        pending: z6Total - z6Completed,
      },
      zona5: {
        total: z5Total,
        completed: z5Completed,
        pending: z5Total - z5Completed,
      },
    },
    barbersWorkload,
  };
}

// MANAGEMENT OF BARBERS & SCHEDULES (ADMIN)
export function updateBarberHours(barberId: string, hours: string[]) {
  const db = getDb();
  db.prepare('UPDATE barbers SET availableHours = ? WHERE id = ?').run(JSON.stringify(hours), barberId);
  return getBarberById(barberId);
}

export function createBarber(data: {
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  locationId: string;
  email: string;
  password: string;
  availableHours: string[];
}) {
  const db = getDb();
  const userId = 'usr-barber-' + crypto.randomUUID().slice(0, 8);
  const barberId = 'barber-' + crypto.randomUUID().slice(0, 8);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, passwordHash, name, role, createdAt)
    VALUES (?, ?, ?, ?, 'BARBER', ?)
  `).run(userId, data.email, hashPassword(data.password), data.name, now);

  db.prepare(`
    INSERT INTO barbers (id, name, specialty, bio, photoUrl, locationId, userId, availableHours, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    barberId,
    data.name,
    data.specialty,
    data.bio,
    data.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    data.locationId,
    userId,
    JSON.stringify(data.availableHours || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '05:30 PM']),
    now
  );

  return getBarberById(barberId);
}
