import type { PageServerLoad } from './$types';
import { admin } from '$lib/server/supabase';

const isoOnly = (d: Date) => d.toISOString().slice(0, 10);

export const load: PageServerLoad = async ({ url }) => {
  try {
    // Fechas (últimos 14 días por defecto)
    const today = new Date();
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');

    const fromDate =
      fromParam && !isNaN(Date.parse(fromParam))
        ? new Date(fromParam)
        : new Date(today.getTime() - 13 * 864e5);
    const toDate =
      toParam && !isNaN(Date.parse(toParam)) ? new Date(toParam) : today;

    const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(toDate);   end.setHours(23, 59, 59, 999);

    // Ventas en el rango (incluye customer_id para clasificar)
    const { data: sales, error: e1 } = await admin
      .from('sales')
      .select('id,total,paid,change,created_at,customer_id')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (e1) {
      console.error('sales query error', e1);
      return {
        error: e1.message ?? 'Error consultando ventas',
        from: isoOnly(start), to: isoOnly(end),
        kpi: { total: 0, count: 0 },
        daily: [], recent: [],
        lowCount: 0,
        topCustomers: [],
        registered: { count: 0, total: 0 },
        unregistered: { count: 0, total: 0 },
        mostrador: { sales_count: 0, total_spent: 0, last_purchase_at: null as string | null }
      };
    }

    // KPIs y agregados por día
    let kpi_total = 0;
    let kpi_count = 0;
    const byDay = new Map<string, { total: number; count: number }>();

    // Clasificación registrados / sin registro
    let regCount = 0, regTotal = 0;
    let unregCount = 0, unregTotal = 0;
    let mostradorLast: string | null = null;

    for (const s of sales ?? []) {
      const t = Number(s.total) || 0;
      kpi_total += t;
      kpi_count += 1;
      const key = isoOnly(new Date(s.created_at));
      const prev = byDay.get(key) ?? { total: 0, count: 0 };
      prev.total += t; prev.count += 1;
      byDay.set(key, prev);

      if (s.customer_id) {
        regCount += 1; regTotal += t;
      } else {
        unregCount += 1; unregTotal += t;
        if (!mostradorLast || new Date(s.created_at) > new Date(mostradorLast)) {
          mostradorLast = s.created_at;
        }
      }
    }

    const daily = Array.from(byDay.entries())
      .map(([day, v]) => ({ day, total: Number(v.total.toFixed(2)), count: v.count }))
      .sort((a, b) => (a.day < b.day ? -1 : 1));

    // Bajo stock
    const { count: lowCount, error: e2 } = await admin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_low_stock', true);
    if (e2) console.error('low stock count error', e2);

    // Top clientes (vista opcional)
    let topCustomers:
      { id: string; full_name: string; sales_count: number; total_spent: number; last_purchase_at: string | null }[] = [];
    const { data: tc, error: e3 } = await admin
      .from('v_customer_stats')
      .select('id, full_name, sales_count, total_spent, last_purchase_at')
      .order('total_spent', { ascending: false })
      .limit(5);
    if (!e3) topCustomers = tc ?? [];
    else console.warn('top customers view error (ok si aún no la creas):', e3.message);

    // Resumen mostrador (sin registro)
    const mostrador = {
      sales_count: unregCount,
      total_spent: Number(unregTotal.toFixed(2)),
      last_purchase_at: mostradorLast
    };

    return {
      error: null,
      from: isoOnly(start),
      to: isoOnly(end),
      kpi: { total: Number(kpi_total.toFixed(2)), count: kpi_count },
      daily,
      recent: (sales ?? []).slice(0, 10), // incluye customer_id
      lowCount: lowCount ?? 0,
      topCustomers,
      registered: { count: regCount, total: Number(regTotal.toFixed(2)) },
      unregistered: { count: unregCount, total: Number(unregTotal.toFixed(2)) },
      mostrador
    };
  } catch (err: any) {
    console.error('reportes load fatal', err);
    return {
      error: err?.message ?? 'Error inesperado',
      from: '', to: '',
      kpi: { total: 0, count: 0 },
      daily: [], recent: [],
      lowCount: 0,
      topCustomers: [],
      registered: { count: 0, total: 0 },
      unregistered: { count: 0, total: 0 },
      mostrador: { sales_count: 0, total_spent: 0, last_purchase_at: null as string | null }
    };
  }
};
