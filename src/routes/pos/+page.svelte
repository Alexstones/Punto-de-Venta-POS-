<script lang="ts">
  import { onMount } from "svelte";
  import { cart, total } from "$lib/stores/cart";
  import { supabase } from "$lib/supabaseClient";
  import Scanner from "$lib/components/Scanner.svelte";

  let query = "";
  let inputEl: HTMLInputElement;

  // pagos y totales locales (visual)
  let discount: number | string = "";
  let taxRate: number | string = "";
  let paidCash: number | string = "";
  let paidCard: number | string = "";

  // derivados (solo UI)
  $: subtotal = ($total as number) || 0;
  $: d = Number(discount) || 0;
  $: r = Number(taxRate) || 0;
  $: tax = Math.max(0, (subtotal - Math.max(0, Math.min(d, subtotal))) * (r / 100));
  $: totalDue = Math.max(0, subtotal - Math.max(0, Math.min(d, subtotal)) + tax);
  $: paid = (Number(paidCash) || 0) + (Number(paidCard) || 0);
  $: change = Math.max(0, paid - totalDue);
  $: falta = Math.max(0, totalDue - paid);

  onMount(() => inputEl?.focus());

  async function addByQuery() {
    const q = query.trim();
    if (!q) return;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, is_active")
      .or(`barcode.eq.${q},sku.eq.${q},name.ilike.%${q}%`)
      .eq("is_active", true)
      .limit(1);

    if (error || !data?.length) {
      alert("Producto no encontrado");
      return;
    }
    cart.add(data[0], 1);
    query = "";
    inputEl?.focus();
  }

  async function addByBarcode(code: string) {
    const { data } = await supabase
      .from("products")
      .select("id, name, price, is_active")
      .eq("barcode", code)
      .eq("is_active", true)
      .limit(1);
    if (data?.length) cart.add(data[0], 1);
  }

  const mxn = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);
</script>

<h1 class="text-2xl font-semibold mb-4">Punto de Venta</h1>

<div class="grid gap-4 lg:grid-cols-3">
  <!-- Izquierda: búsqueda + escáner + carrito -->
  <div class="lg:col-span-2 space-y-4">
    <div class="card flex gap-2">
      <input
        bind:this={inputEl}
        bind:value={query}
        class="input"
        placeholder="Escanea o escribe nombre / SKU / código"
        on:keydown={(e) => e.key === "Enter" && addByQuery()}
      />
      <button class="btn btn-primary" on:click={addByQuery}>Agregar</button>
    </div>

    <div class="card">
      <div class="text-sm font-medium mb-2">Escáner</div>
      <Scanner on:decoded={(e) => addByBarcode(e.detail)} />
    </div>

    <div class="card overflow-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-neutral-100/80 backdrop-blur dark:bg-neutral-800/70">
          <tr>
            <th class="p-2 text-left">Producto</th>
            <th class="p-2 text-right">Precio</th>
            <th class="p-2 text-right">Cant</th>
            <th class="p-2 text-right">Subtotal</th>
            <th class="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {#each $cart as line}
            <tr class="border-t border-neutral-200 dark:border-neutral-800">
              <td class="p-2 font-medium">{line.name}</td>
              <td class="p-2 text-right">{mxn(line.unit_price)}</td>
              <td class="p-2 text-right">
                <div class="inline-flex items-center gap-2">
                  <button class="btn btn-outline px-2 py-1" on:click={() => cart.dec(line.product_id)}>-</button>
                  <span class="min-w-[2ch] text-right inline-block">{line.quantity}</span>
                  <button class="btn btn-outline px-2 py-1" on:click={() => cart.inc(line.product_id)}>+</button>
                </div>
              </td>
              <td class="p-2 text-right">{mxn(line.unit_price * line.quantity)}</td>
              <td class="p-2 text-right">
                <button class="btn btn-outline px-2 py-1 text-red-600" on:click={() => cart.remove(line.product_id)}>Eliminar</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if !$cart.length}
        <p class="text-center text-sm text-neutral-500 py-6">Agrega productos para comenzar la venta.</p>
      {/if}
    </div>
  </div>

  <!-- Derecha: totales, descuentos/IVA, pagos -->
  <form method="POST" action="?/checkout" class="space-y-4">
    <div class="card space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm text-neutral-500">Subtotal</span>
        <div class="text-lg font-semibold">{mxn(subtotal)}</div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="discount" class="block text-sm text-neutral-500 mb-1">Descuento (MXN)</label>
          <input id="discount" name="discount" bind:value={discount} inputmode="decimal" class="input" />
        </div>
        <div>
          <label for="taxRate" class="block text-sm text-neutral-500 mb-1">IVA (%)</label>
          <input id="taxRate" name="tax_rate" bind:value={taxRate} inputmode="decimal" class="input" />
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-neutral-500">Impuesto</span>
        <div>{mxn(tax)}</div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm text-neutral-500">Total</span>
        <div class="text-2xl font-semibold">{mxn(totalDue)}</div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="paidCash" class="block text-sm text-neutral-500 mb-1">Efectivo</label>
          <input id="paidCash" name="paid_cash" bind:value={paidCash} inputmode="decimal" class="input" />
        </div>
        <div>
          <label for="paidCard" class="block text-sm text-neutral-500 mb-1">Tarjeta</label>
          <input id="paidCard" name="paid_card" bind:value={paidCard} inputmode="decimal" class="input" />
        </div>
      </div>

      <div class="flex items-center justify-between text-sm">
        <span>Cambio</span>
        <strong>{mxn(change)}</strong>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span>Faltante</span>
        <strong>{mxn(falta)}</strong>
      </div>

      <!-- items serializados -->
      <input type="hidden" name="items" value={JSON.stringify(cart.serialize())} />

      <div class="grid gap-2">
        <button class="btn btn-primary" type="submit" disabled={$total <= 0}>Cobrar</button>
        <button class="btn btn-outline" type="button" on:click={() => cart.clear()}>Vaciar</button>
      </div>
    </div>
  </form>
</div>
