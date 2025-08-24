import type { PageServerLoad } from './$types';
import { admin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';

  const base = admin
    .from('v_customer_stats')
    .select('id, full_name, sales_count, total_spent, last_purchase_at');

  const query = q
    ? base.ilike('full_name', `%${q}%`).order('total_spent', { ascending: false })
    : base.order('last_purchase_at', { ascending: false }).limit(50);

  const { data, error } = await query;
  if (error) return { error: error.message, q, customers: [] };

  return { error: null, q, customers: data ?? [] };
};
