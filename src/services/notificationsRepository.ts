import type { AppNotification } from '@/types';
import { supabase } from './supabaseClient';
import { rowToNotification, notificationToRow, type NotificationRow } from './domainMappers';

function client() {
  if (!supabase) throw new Error('Supabase yapılandırılmamış — .env dosyasında VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY eksik.');
  return supabase;
}

export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await client().from('notifications').select('*').order('timestamp', { ascending: false }).limit(100);
  if (error) throw error;
  return (data as NotificationRow[]).map(rowToNotification);
}

export async function insertNotification(n: AppNotification): Promise<void> {
  const { error } = await client().from('notifications').insert(notificationToRow(n));
  if (error) throw error;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await client().from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(audience: AppNotification['audience'], roomNumber?: string): Promise<void> {
  let query = client().from('notifications').update({ read: true }).eq('audience', audience);
  if (audience === 'guest' && roomNumber) query = query.eq('room_number', roomNumber);
  const { error } = await query;
  if (error) throw error;
}

export function subscribeNotifications(onChange: () => void) {
  const channel = client()
    .channel('notifications-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, onChange)
    .subscribe();
  return () => client().removeChannel(channel);
}
