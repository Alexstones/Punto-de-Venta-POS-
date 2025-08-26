import type { Actions } from './$types';
import { admin } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

// --- Utils: parseo de payloads de escaneo ---
type ScanResult =
  | { kind: 'id'; value: string; qty?: number }
  | { kind: 'barcode'; value: string; qty?: number }
  | { kind: 'sku'; value: string; qty?: number };

function parseScanPayload(raw: string): ScanResult {
  const code = raw.trim();

  // JSON: { id?, barcode?, sku?, qty? }
  try {
    const obj = JSON.parse(code);
    if (obj && typeof obj === 'object') {
      const qty = Number(obj.qty) > 0 ? Number(obj.qty) : undefined;
      if (obj.id) return { kind: 'id', value: String(obj.id), qty };
      if (obj.barcode) return { kind: 'barcode', value: String(obj.barcode), qty };
      if (obj.sku) return { kind: 'sku', value: String(obj.sku), qty };
    }
  } catch { /* no era JSON */ }

  // URL tipo pos://product/<id>?qty=2 o pos://?barcode=XYZ&qty=3
  try {
    const u = new URL(code);
    if (u.protocol === 'pos:' || u.protocol === 'pos://') {
      const qtyParam = u.searchParams.get('qty');
      const qty = qtyParam ? Math.max(1, Number(qtyParam)) : undefined;

      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'product' && parts[1]) return { kind: 'id', value: parts[1], qty };

      const bc = u.searchParams.get('barcode');
      if (bc) return { kind: 'barcode', value: bc, qty };
      const sku = u.searchParams.get('sku');
      if (sku) return { kind: 'sku', value: sku, qty };
    }
  } catch { /* no era URL */ }

  // Fallback: barcode
  return { kind: 'barcode', value: code };
}

export const actions: Actions = {
  // Escanear (opcional, para consulta/agregar server-side)
  scan: async ({ request }) => {
    const form = await request.formData();
    const raw = String(form.get('code') ?? '').trim();
    const mode = (String(form.get('mode') ?? 'price').trim().toLowerCase()) as 'price' | 'add';

    if (!raw) return fail(400, { message: 'Código vacío', ok: false });

    const parsed = parseScanPayload(raw);

    let query = admin.from('products')
      .select('id, name, price, sku, barcode, stock, is_active')
      .limit(1);

    if (parsed.kind === 'id') query = query.eq('id', parsed.value);
    else if (parsed.kind === 'sku') query = query.eq('sku', parsed.value);
    else query = query.eq('barcode', parsed.value);

    const { data, error } = await query;

    if (error) {
      console.error('scan query error', error);
      return fail(500, { message: 'Error al buscar el producto', ok: false });
    }
    if (!data || data.length === 0) {
      return fail(404, { message: 'Producto no encontrado', code: raw, ok: false });
    }

    const product = data[0];
    const qty = parsed.qty && parsed.qty > 0 ? parsed.qty : 1;

    // No podemos modificar el store del cliente aquí; devolvemos datos para que el cliente actúe.
    return { ok: true, mode, product, qty };
  },

  // Cobro
  checkout: async ({ request }) => {
    const form = await request.formData();

    const itemsStr   = String(form.get('items') ?? '[]');
    const discount   = Number(String(form.get('discount') ?? '').trim() || 0);
    const tax_rate   = Number(String(form.get('tax_rate') ?? '').trim() || 0);
    const paid_cash  = Number(String(form.get('paid_cash') ?? '').trim() || 0);
    const paid_card  = Number(String(form.get('paid_card') ?? '').trim() || 0);

    let items: { product_id: string; quantity: number }[] = [];
    try {
      const parsed = JSON.parse(itemsStr);
      if (!Array.isArray(parsed)) throw new Error('bad array');
      items = parsed;
    } catch {
      return fail(400, { message: 'Items inválidos' });
    }
    if (items.length === 0) return fail(400, { message: 'Carrito vacío' });

    if (discount < 0 || tax_rate < 0 || paid_cash < 0 || paid_card < 0) {
      return fail(400, { message: 'Valores negativos no permitidos' });
    }

    const { data: sale_id, error } = await admin.rpc('create_sale_v2', {
      p_customer_id: null,
      p_items: items,
      p_discount: discount,
      p_tax_rate: tax_rate,
      p_paid_cash: paid_cash,
      p_paid_card: paid_card
    });

    if (error) {
      console.error('create_sale_v2 error', error);
      return fail(500, { message: error.message });
    }

    throw redirect(303, `/ticket/${sale_id}`);
  }
};
