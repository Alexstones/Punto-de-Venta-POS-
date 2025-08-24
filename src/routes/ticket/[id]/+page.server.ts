import type { PageServerLoad } from './$types';
import { admin } from '$lib/server/supabase';
import { error } from '@sveltejs/kit';
import QRCode from 'qrcode';

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id);
  if (!Number.isFinite(id)) throw error(400, 'Ticket inválido');

  // Venta
  const { data: sale, error: e1 } = await admin
    .from('sales')
    .select(
      'id, created_at, customer_id, subtotal, discount, tax_rate, tax_amount, total_due, paid_cash, paid_card, payment_method, total, paid, change'
    )
    .eq('id', id)
    .single();

  if (e1 || !sale) throw error(404, e1?.message || 'Venta no encontrada');

  // Items + producto
  const { data: items, error: e2 } = await admin
    .from('sale_items')
    .select('product_id, quantity, unit_price, subtotal, products(name, sku, barcode)')
    .eq('sale_id', id)
    .order('id', { ascending: true });

  if (e2) throw error(500, e2.message);

  // Cliente (opcional)
  let customer: { id: string; full_name: string | null } | null = null;
  if (sale.customer_id) {
    const { data: c } = await admin
      .from('customers')
      .select('id, full_name')
      .eq('id', sale.customer_id)
      .single();
    customer = c ?? null;
  }

  // URL absoluta del ticket (para el QR)
  const ticketUrl = `${url.origin}/ticket/${id}`;

  // Genera QR (DataURL)
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(ticketUrl, { margin: 0, scale: 4 });
  } catch (e) {
    // si falla el QR, seguimos sin romper el ticket
    qrDataUrl = '';
  }

  return {
    sale,
    items: items ?? [],
    customer,
    ticketUrl,
    qrDataUrl
  };
};
