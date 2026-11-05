"use strict";(()=>{var e={};e.id=711,e.ids=[711],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2609:(e,a,t)=>{t.r(a),t.d(a,{originalPathname:()=>u,patchFetch:()=>b,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>N,staticGenerationAsyncStorage:()=>T});var r={};t.r(r),t.d(r,{GET:()=>l,POST:()=>c});var n=t(9303),i=t(8716),o=t(670),s=t(7070),E=t(1038);async function l(e){try{let{searchParams:a}=new URL(e.url),t=a.get("locationId")||void 0,r=(0,E.Zq)(t);return s.NextResponse.json({barbers:r})}catch(e){return s.NextResponse.json({error:e.message},{status:500})}}async function c(e){try{let a=await e.json();if("updateHours"===a.action){let e=(0,E.gF)(a.barberId,a.hours);return s.NextResponse.json({success:!0,barber:e})}let t=(0,E._S)(a);return s.NextResponse.json({success:!0,barber:t},{status:201})}catch(e){return s.NextResponse.json({error:e.message},{status:500})}}let p=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/barbers/route",pathname:"/api/barbers",filename:"route",bundlePath:"app/api/barbers/route"},resolvedPagePath:"C:\\Users\\juanb\\OneDrive\\Escritorio\\Pagina barberia\\app\\api\\barbers\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:d,staticGenerationAsyncStorage:T,serverHooks:N}=p,u="/api/barbers/route";function b(){return(0,o.patchFetch)({serverHooks:N,staticGenerationAsyncStorage:T})}},1038:(e,a,t)=>{t.d(a,{So:()=>N,Pc:()=>R,_S:()=>D,Lr:()=>A,V2:()=>U,Nz:()=>C,By:()=>L,Zq:()=>O,JC:()=>u,JH:()=>I,U2:()=>b,LW:()=>S,gF:()=>v});let r=require("node:sqlite"),n=require("node:path");var i=t.n(n);let o=require("node:fs");var s=t.n(o);let E=require("node:crypto");var l=t.n(E);let c=i().join(process.cwd(),"data");s().existsSync(c)||s().mkdirSync(c,{recursive:!0});let p=i().join(c,"visionary.db"),d=null;function T(){return d||function(e){e.exec(`
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
  `)}(d=new r.DatabaseSync(p)),d}function N(e,a){let t=T(),r=t.prepare("SELECT * FROM users WHERE email = ?").get(e);if(!r||!function(e,a){try{let[t,r]=a.split(":");if(!t||!r)return!1;let n=Buffer.from(r,"hex"),i=l().scryptSync(e,t,64);return l().timingSafeEqual(n,i)}catch{return!1}}(a,r.passwordHash))return null;let n=null;if("BARBER"===r.role&&(n=t.prepare("SELECT b.*, l.name as locationName FROM barbers b LEFT JOIN locations l ON b.locationId = l.id WHERE b.userId = ?").get(r.id))&&n.availableHours)try{n.availableHours=JSON.parse(n.availableHours)}catch{n.availableHours=[]}return{id:r.id,email:r.email,name:r.name,role:r.role,barber:n||void 0}}function u(){return T().prepare("SELECT * FROM locations ORDER BY name ASC").all()}function b(){return T().prepare("SELECT * FROM services ORDER BY price ASC").all()}function O(e){let a=T(),t=`
    SELECT b.*, l.name as locationName, l.title as locationTitle 
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
  `,r=[];return e&&(t+=" WHERE b.locationId = ? OR l.name = ?",r.push(e,e)),t+=" ORDER BY b.name ASC",a.prepare(t).all(...r).map(e=>{try{e.availableHours=JSON.parse(e.availableHours)}catch{e.availableHours=[]}return e})}function m(e){let a=T().prepare(`
    SELECT b.*, l.name as locationName, l.title as locationTitle 
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
    WHERE b.id = ?
  `).get(e);if(a)try{a.availableHours=JSON.parse(a.availableHours)}catch{a.availableHours=[]}return a}function I(e,a){return T().prepare(`
    SELECT time FROM appointments 
    WHERE barberId = ? 
      AND date = ? 
      AND status != 'CANCELADA'
  `).all(e,a).map(e=>e.time)}function L(e={}){let a=T(),t=`
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
  `,r=[];if(e.barberId&&(t+=" AND a.barberId = ?",r.push(e.barberId)),e.locationId&&(t+=" AND (a.locationId = ? OR l.name = ?)",r.push(e.locationId,e.locationId)),e.date&&(t+=" AND a.date = ?",r.push(e.date)),e.status&&(t+=" AND a.status = ?",r.push(e.status)),e.search){t+=" AND (a.clientName LIKE ? OR a.clientPhone LIKE ? OR a.code LIKE ?)";let a=`%${e.search}%`;r.push(a,a,a)}return t+=" ORDER BY a.date DESC, a.time ASC, a.createdAt DESC",a.prepare(t).all(...r)}function R(e){let a=T();if(a.prepare(`
    SELECT id FROM appointments 
    WHERE barberId = ? AND date = ? AND time = ? AND status != 'CANCELADA'
  `).get(e.barberId,e.date,e.time))throw Error("Este horario ya ha sido reservado por otro cliente. Por favor elige otro horario.");let t=e.serviceName,r=null;if(e.serviceId){let n=a.prepare("SELECT name, price FROM services WHERE id = ?").get(e.serviceId);n&&(t=n.name,r=n.price)}let n="apt-"+l().randomUUID().slice(0,8),i=new Date().toISOString();return a.prepare(`
    INSERT INTO appointments (
      id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', 0, ?, ?, ?, ?)
  `).run(n,"VIS-"+Math.floor(1e3+9e3*Math.random()),e.clientName,e.clientPhone,e.date,e.time,e.serviceId||null,t||"Corte General",e.barberId,e.locationId,r,e.notes||null,i,i),a.prepare(`
    SELECT a.*, b.name as barberName, l.name as locationName 
    FROM appointments a
    JOIN barbers b ON a.barberId = b.id
    JOIN locations l ON a.locationId = l.id
    WHERE a.id = ?
  `).get(n)}function A(e){let a=T(),t="walk-"+l().randomUUID().slice(0,8),r=new Date().toISOString(),n=r.split("T")[0],i=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),o=e.serviceName;if(e.serviceId&&!o){let t=a.prepare("SELECT name FROM services WHERE id = ?").get(e.serviceId);t&&(o=t.name)}return a.prepare(`
    INSERT INTO appointments (
      id, code, clientName, clientPhone, date, time, serviceId, serviceName, barberId, locationId, status, isWalkIn, amountPaid, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, 'Atenci\xf3n Directa', ?, ?, ?, ?, ?, ?, 'REALIZADA', 1, ?, ?, ?, ?)
  `).run(t,"WLK-"+Math.floor(1e3+9e3*Math.random()),e.clientName+" (Walk-in)",n,i,e.serviceId||null,o||"Corte Walk-in",e.barberId,e.locationId,e.amountPaid||50,e.notes||"Cliente atendido sin cita previa",r,r),a.prepare(`
    SELECT a.*, b.name as barberName, l.name as locationName 
    FROM appointments a
    JOIN barbers b ON a.barberId = b.id
    JOIN locations l ON a.locationId = l.id
    WHERE a.id = ?
  `).get(t)}function S(e,a,t){let r=T(),n=new Date().toISOString();return null!=t?r.prepare(`
      UPDATE appointments 
      SET status = ?, amountPaid = ?, updatedAt = ? 
      WHERE id = ?
    `).run(a,t,n,e):r.prepare(`
      UPDATE appointments 
      SET status = ?, updatedAt = ? 
      WHERE id = ?
    `).run(a,n,e),r.prepare("SELECT * FROM appointments WHERE id = ?").get(e)}function U(e){return T().prepare("DELETE FROM appointments WHERE id = ?").run(e),{success:!0}}function C(){let e=T(),a=e.prepare("SELECT count(*) as c FROM appointments").get().c,t=e.prepare("SELECT count(*) as c FROM appointments WHERE status = 'REALIZADA'").get().c,r=e.prepare("SELECT count(*) as c FROM appointments WHERE status = 'PENDIENTE'").get().c,n=e.prepare("SELECT count(*) as c FROM appointments WHERE status = 'EN_PROCESO'").get().c,i=e.prepare(`
    SELECT COALESCE(SUM(COALESCE(amountPaid, 50)), 0) as totalRevenue 
    FROM appointments 
    WHERE status = 'REALIZADA'
  `).get(),o=i?.totalRevenue||0,s=e.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 6'
  `).get().c,E=e.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 5'
  `).get().c,l=e.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 6' AND a.status = 'REALIZADA'
  `).get().c,c=e.prepare(`
    SELECT count(*) as c FROM appointments a 
    JOIN locations l ON a.locationId = l.id 
    WHERE l.name = 'Zona 5' AND a.status = 'REALIZADA'
  `).get().c;return{totalAppointments:a,completedAppointments:t,pendingAppointments:r,inProgressAppointments:n,totalRevenue:o,locations:{zona6:{total:s,completed:l,pending:s-l},zona5:{total:E,completed:c,pending:E-c}},barbersWorkload:e.prepare(`
    SELECT 
      b.id, b.name, b.specialty, l.name as locationName,
      COUNT(a.id) as totalAppointments,
      SUM(CASE WHEN a.status = 'REALIZADA' THEN 1 ELSE 0 END) as completedAppointments
    FROM barbers b
    JOIN locations l ON b.locationId = l.id
    LEFT JOIN appointments a ON b.id = a.barberId
    GROUP BY b.id
    ORDER BY totalAppointments DESC
  `).all()}}function v(e,a){return T().prepare("UPDATE barbers SET availableHours = ? WHERE id = ?").run(JSON.stringify(a),e),m(e)}function D(e){let a=T(),t="usr-barber-"+l().randomUUID().slice(0,8),r="barber-"+l().randomUUID().slice(0,8),n=new Date().toISOString();return a.prepare(`
    INSERT INTO users (id, email, passwordHash, name, role, createdAt)
    VALUES (?, ?, ?, ?, 'BARBER', ?)
  `).run(t,e.email,function(e){let a=l().randomBytes(16).toString("hex"),t=l().scryptSync(e,a,64).toString("hex");return`${a}:${t}`}(e.password),e.name,n),a.prepare(`
    INSERT INTO barbers (id, name, specialty, bio, photoUrl, locationId, userId, availableHours, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(r,e.name,e.specialty,e.bio,e.photoUrl||"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",e.locationId,t,JSON.stringify(e.availableHours||["09:00 AM","10:00 AM","11:00 AM","02:00 PM","04:00 PM","05:30 PM"]),n),m(r)}}};var a=require("../../../webpack-runtime.js");a.C(e);var t=e=>a(a.s=e),r=a.X(0,[276,972],()=>t(2609));module.exports=r})();