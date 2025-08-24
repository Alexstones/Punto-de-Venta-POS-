import type { Actions } from './$types';
import { admin } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
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

    // Validaciones simples
    if (discount < 0 || tax_rate < 0 || paid_cash < 0 || paid_card < 0) {
      return fail(400, { message: 'Valores negativos no permitidos' });
    }

    const { data: sale_id, error } = await admin.rpc('create_sale_v2', {
      p_customer_id: null, // cuando actives clientes, pásalo aquí
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

