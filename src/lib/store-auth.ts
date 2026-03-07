import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

const BCRYPT_COST = 12;
const SESSION_EXPIRY_HOURS = 24;
const INVITE_EXPIRY_DAYS = 7;

// Types
export interface StoreUser {
  id: string;
  email: string;
  vendor_id: string | null;  // UUID
  us_vendor_id: string | null;  // UUID
  role: string;
  is_active: boolean;
  last_login: string | null;
  permissions: {
    can_view_analytics: boolean;
    can_export_data: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface StoreSession {
  id: string;
  store_user_id: string;
  token: string;
  expires_at: string;
  ip_address: string | null;
  created_at: string;
}

export interface StoreInvite {
  id: string;
  vendor_id: string | null;  // UUID
  us_vendor_id: string | null;  // UUID
  invite_code: string;
  email: string | null;
  expires_at: string;
  used_at: string | null;
  created_by: string;
  created_at: string;
}

export interface VendorInfo {
  id: string;  // UUID (pouch_vendors.id)
  name: string;
  country: 'uk' | 'us';
  logo_url?: string;
  website_url?: string;
  realVendorId: number | null;  // INTEGER (vendors.id) - used for UK data table queries
  usVendorUuid: string | null;  // UUID (us_vendors.id) - used for US data table queries
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Token generation
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateInviteCode(): string {
  return randomBytes(24).toString('base64url');
}

// Session management
export async function createSession(
  userId: string,
  ipAddress?: string
): Promise<{ session: StoreSession; token: string } | null> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  const { data, error } = await supabaseAdmin()
    .from('store_sessions')
    .insert({
      store_user_id: userId,
      token: createHash('sha256').update(token).digest('hex'),
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return { session: data, token };
}

export async function validateSession(token: string): Promise<StoreUser | null> {
  const hashedToken = createHash('sha256').update(token).digest('hex');

  const { data: session, error: sessionError } = await supabaseAdmin()
    .from('store_sessions')
    .select('*, store_user:store_users(*)')
    .eq('token', hashedToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) {
    return null;
  }

  return session.store_user as StoreUser;
}

export async function invalidateSession(token: string): Promise<boolean> {
  const hashedToken = createHash('sha256').update(token).digest('hex');

  const { error } = await supabaseAdmin()
    .from('store_sessions')
    .delete()
    .eq('token', hashedToken);

  return !error;
}

export async function invalidateAllUserSessions(userId: string): Promise<boolean> {
  const { error } = await supabaseAdmin()
    .from('store_sessions')
    .delete()
    .eq('store_user_id', userId);

  return !error;
}

// User management
export async function createStoreUser(
  email: string,
  password: string,
  vendorId?: string,
  usVendorId?: string,
  role: string = 'store_owner'
): Promise<StoreUser | null> {
  const passwordHash = await hashPassword(password);

  const { data, error } = await supabaseAdmin()
    .from('store_users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      vendor_id: vendorId || null,
      us_vendor_id: usVendorId || null,
      role,
      is_active: true,
      permissions: {
        can_view_analytics: true,
        can_export_data: false,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating store user:', error);
    return null;
  }

  return data;
}

export async function getStoreUserByEmail(email: string): Promise<(StoreUser & { password_hash: string }) | null> {
  const { data, error } = await supabaseAdmin()
    .from('store_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getStoreUserById(id: string): Promise<StoreUser | null> {
  const { data, error } = await supabaseAdmin()
    .from('store_users')
    .select('id, email, vendor_id, us_vendor_id, role, is_active, last_login, permissions, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function updateLastLogin(userId: string): Promise<void> {
  await supabaseAdmin()
    .from('store_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId);
}

// Invite management
export async function createInvite(
  vendorId?: string,
  usVendorId?: string,
  email?: string,
  createdBy: string = 'admin'
): Promise<StoreInvite | null> {
  const inviteCode = generateInviteCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const { data, error } = await supabaseAdmin()
    .from('store_invites')
    .insert({
      vendor_id: vendorId || null,
      us_vendor_id: usVendorId || null,
      invite_code: inviteCode,
      email: email?.toLowerCase() || null,
      expires_at: expiresAt.toISOString(),
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invite:', error);
    return null;
  }

  return data;
}

export async function validateInviteCode(code: string): Promise<StoreInvite | null> {
  const admin = supabaseAdmin();
  if (!admin) {
    console.error('validateInviteCode: supabaseAdmin is null');
    return null;
  }

  const { data, error } = await admin
    .from('store_invites')
    .select('*')
    .eq('invite_code', code)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('validateInviteCode error:', error.code, error.message, 'for code:', code);
    return null;
  }

  return data;
}

export async function markInviteAsUsed(inviteId: string): Promise<boolean> {
  const { error } = await supabaseAdmin()
    .from('store_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', inviteId);

  return !error;
}

// Vendor info helpers
export async function getVendorInfo(vendorId?: string, usVendorId?: string): Promise<VendorInfo | null> {
  // Both vendor_id and us_vendor_id now reference pouch_vendors table
  const idToUse = vendorId || usVendorId;

  if (idToUse) {
    const { data, error } = await supabaseAdmin()
      .from('pouch_vendors')
      .select('id, name, country, logo_url, website_url, vendor_id, us_vendor_id')
      .eq('id', idToUse)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        country: (data.country === 'us' ? 'us' : 'uk') as 'uk' | 'us',
        logo_url: data.logo_url,
        website_url: data.website_url,
        realVendorId: data.vendor_id || null,  // INTEGER vendor_id from vendors table
        usVendorUuid: data.us_vendor_id || null,  // UUID from us_vendors table
      };
    }
  }

  return null;
}

// Auth helper for API routes
export async function authenticateStoreRequest(
  request: Request
): Promise<{ user: StoreUser; vendor: VendorInfo | null } | null> {
  // Get token from cookie or Authorization header
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  );
  const tokenFromCookie = cookies['store_session'];

  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.replace('Bearer ', '');

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return null;
  }

  const user = await validateSession(token);
  if (!user || !user.is_active) {
    return null;
  }

  const vendor = await getVendorInfo(user.vendor_id || undefined, user.us_vendor_id || undefined);

  return { user, vendor };
}

// Cookie helper
export function createSessionCookie(token: string): string {
  const maxAge = SESSION_EXPIRY_HOURS * 60 * 60;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `store_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(): string {
  return 'store_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}

// Cache-control headers for auth endpoints (must never be cached)
export const AUTH_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, private, must-revalidate',
  'Pragma': 'no-cache',
};
