import { supabase } from './supabaseClient';

export type Product = { id?: string; barcode: string; name: string; price: number | null };

export async function getProductByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('products')
    .select('id, barcode, name, price')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) {
    console.error('[getProductByBarcode] Supabase error:', error);
    throw error;
  }
  return data as Product | null;
}

export async function upsertProductByBarcode(
  barcode: string,
  name: string,
  price: number | null
) {
  // Enviar price si es número (incluye 0). Si es null, deja que DB ponga DEFAULT.
  const payload: Record<string, any> = { barcode, name };
  if (typeof price === 'number' && Number.isFinite(price)) {
    payload.price = price;
  }

  const { data, error } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'barcode' })
    .select('id, barcode, name, price')
    .single();

  if (error) {
    console.error('[upsertProductByBarcode] Supabase error:', error);
    throw error;
  }
  return data as Product;
}

export async function removeProductByBarcode(barcode: string) {
  const { error } = await supabase.from('products').delete().eq('barcode', barcode);
  if (error) {
    console.error('[removeProductByBarcode] Supabase error:', error);
    throw error;
  }
}
