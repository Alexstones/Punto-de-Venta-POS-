import type { PageServerLoad } from './$types';
import { admin } from '$lib/server/supabase';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay   = (d: Date) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

export const load: PageServerLoad = async () => {
  const now = new Date();

  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);

  const last7Start  = startOfDay(new Date(now.getTime() - 6 * 864e5));   // últimos 7 días (incluye hoy)
  const last30Start = startOfDay(new Date(now.getTime() - 29 * 864e5));  // últimos 30 días

  try {
    const [sales7Res, lowStockRes, recentRes, items30Res] = await Promise.all([
      admin.from('sales')
        .select('id,total,created_at,customer_id')
        .gte('created_at', last7Start.toISOString())
        .lte('created_at', todayEnd.toISOString())
        .order('created_at', { ascending: true }),
      admin.from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_low_stock', true),
      admin.from('sales')
        .select('id,total,paid,change,created_at,customer_id')
        .order('created_at', { ascending: false })
        .limit(6),
      // Agrega por producto usando relación con sales para filtrar por fecha
      admin.from('sale_items')
        .select('product_id, quantity, products(name), sales!inner(created_at)')
        .gte('sales.created_at', last30Start.toISOString())
        .lte('sales.created_at', todayEnd.toISOString())
    ]);

    const sales7 = sales7Res.data ?? [];
    const recent = recentRes.data ?? [];
    const lowStockCount = lowStockRes.count ?? 0;
    const items30 = items30Res.data ?? [];

    // ---- KPIs de hoy
    let todayRevenue = 0;
    let todayCount = 0;
    for (const s of sales7) {
      const d = new Date(s.created_at);
      if (d >= todayStart && d <= todayEnd) {
        todayRevenue += Number(s.total) || 0;
        todayCount += 1;
      }
    }
    todayRevenue = Number(todayRevenue.toFixed(2));

    // ---- Serie por día (7 días)
    const dayIndex: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7Start.getTime() + i * 864e5);
      dayIndex[ymd(d)] = 0;
    }
    for (const s of sales7) {
      const key = ymd(new Date(s.created_at));
      if (key in dayIndex) {
        dayIndex[key] += Number(s.total) || 0;
      }
    }
    const daily7 = Object.entries(dayIndex).map(([day, total]) => ({
      day,
      total: Number(total.toFixed(2))
    }));

    // ---- Top productos (30 días) por cantidad
    const mapTop = new Map<string, { name: string; qty: number }>();
    for (const row of items30 as any[]) {
      const pid = row.product_id as string;
      const name = row.products?.name ?? 'Producto';
      const q = Number(row.quantity) || 0;
      const prev = mapTop.get(pid) ?? { name, qty: 0 };
      prev.qty += q;
      mapTop.set(pid, prev);
    }
    const topProducts = Array.from(mapTop.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      error: null,
      kpis: {
        todayRevenue,
        todayCount,
        lowStockCount
      },
      daily7,
      recent
    };
  } catch (e: any) {
    console.error('dashboard load error', e);
    return {
      error: e?.message ?? 'Error cargando dashboard',
      kpis: { todayRevenue: 0, todayCount: 0, lowStockCount: 0 },
      daily7: [],
      recent: []
    };
  }
};
