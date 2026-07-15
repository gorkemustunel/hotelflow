#!/usr/bin/env node
// -----------------------------------------------------------------------------
// One-off setup script: creates the 8 demo admin/staff accounts in Supabase
// Auth so the app's real login screens (AdminSelectPage / StaffSelectPage)
// have something to authenticate against.
//
// Usage:
//   1. In the Supabase Dashboard → Project Settings → API, copy the
//      "service_role" key (NOT the anon key — this script needs elevated
//      permissions to create users directly, bypassing email confirmation).
//   2. Run:
//        SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/seed-auth-users.mjs
//      (VITE_SUPABASE_URL is read from your `.env` file automatically.)
//   3. Re-running is safe — accounts that already exist are skipped.
//
// The service role key is a secret with full database access. Never commit
// it, never put it in `.env` (which is bundled into the client build), and
// only ever use it locally for one-off admin scripts like this one.
// -----------------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

// `new URL(...).pathname` leaves a leading "/" before the drive letter on
// Windows (e.g. "/C:/Users/..."), which `existsSync`/`readFileSync` can't
// resolve — `fileURLToPath` normalizes that correctly on every platform.
loadDotEnv(fileURLToPath(new URL('../.env', import.meta.url)));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Eksik ortam değişkeni:');
  if (!SUPABASE_URL) console.error('  - VITE_SUPABASE_URL (.env dosyasında olmalı)');
  if (!SERVICE_ROLE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY (komut satırında geçici olarak ver, .env\'e KOYMA)');
  console.error('\nÖrnek: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-auth-users.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_PASSWORD = '1234';
const ADMIN_ROLE_IDS = new Set(['super_admin', 'hotel_manager']);
const EMAIL_DOMAIN = 'hotelflow.demo';

// Mirrors `DEMO_SWITCH_USER_IDS` in `src/data/staff.ts` — the 8 personas
// shown on the demo login hint panels.
const DEMO_USERS = [
  { staffId: 's0', name: 'Ahmet Demir', roleId: 'super_admin' },
  { staffId: 's9', name: 'Zeynep Yıldız', roleId: 'hotel_manager' },
  { staffId: 's5', name: 'Elif Demir', roleId: 'reception' },
  { staffId: 's1', name: 'Ayşe Yılmaz', roleId: 'housekeeping' },
  { staffId: 's3', name: 'Mehmet Kaya', roleId: 'technical' },
  { staffId: 's6', name: 'Can Arslan', roleId: 'room_service' },
  { staffId: 's10', name: 'Murat Usta', roleId: 'chef' },
  { staffId: 's7', name: 'Selin Koç', roleId: 'spa' },
];

function usernameFor(fullName) {
  return fullName
    .split(' ')[0]
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

let created = 0;
let skipped = 0;
let failed = 0;

for (const u of DEMO_USERS) {
  const username = usernameFor(u.name);
  const email = `${username}@${EMAIL_DOMAIN}`;
  const role = ADMIN_ROLE_IDS.has(u.roleId) ? 'admin' : 'staff';

  const { error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { role, staffId: u.staffId, name: u.name },
  });

  if (!error) {
    console.log(`✓ ${email}  (${role}, ${u.name})`);
    created += 1;
    continue;
  }

  if (error.message?.toLowerCase().includes('already been registered') || error.code === 'email_exists') {
    console.log(`· ${email} zaten mevcut, atlandı`);
    skipped += 1;
    continue;
  }

  console.error(`✗ ${email} oluşturulamadı: ${error.message}`);
  failed += 1;
}

console.log(`\n${created} oluşturuldu, ${skipped} zaten vardı, ${failed} başarısız.`);
console.log(`Tüm hesapların şifresi: ${DEMO_PASSWORD}`);
if (failed > 0) process.exit(1);
