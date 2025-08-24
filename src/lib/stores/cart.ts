import { writable, derived } from 'svelte/store';

export type CartItem = {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
};

function createCart() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  return {
    subscribe,
    add(product: { id: string; name: string; price: number }, qty = 1) {
      update((items) => {
        const i = items.findIndex((x) => x.product_id === product.id);
        if (i === -1) {
          return [
            ...items,
            {
              product_id: product.id,
              name: product.name,
              unit_price: Number(product.price),
              quantity: qty
            }
          ];
        }
        const next = [...items];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      });
    },
    inc(product_id: string, step = 1) {
      update((items) => items.map((it) => (it.product_id === product_id ? { ...it, quantity: it.quantity + step } : it)));
    },
    dec(product_id: string, step = 1) {
      update((items) =>
        items
          .map((it) => (it.product_id === product_id ? { ...it, quantity: Math.max(0, it.quantity - step) } : it))
          .filter((it) => it.quantity > 0)
      );
    },
    remove(product_id: string) {
      update((items) => items.filter((it) => it.product_id !== product_id));
    },
    clear() {
      set([]);
    },
    serialize() {
      let $items: CartItem[] = [];
      const unsub = this.subscribe((v) => ($items = v));
      unsub();
      return $items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
    }
  };
}

export const cart = createCart();
export const total = derived(cart, ($items) => $items.reduce((s, i) => s + i.unit_price * i.quantity, 0));
