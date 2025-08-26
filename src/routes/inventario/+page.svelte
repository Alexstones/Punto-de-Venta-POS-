<script lang="ts">
  export let data: { products?: any[] } = { products: [] };

  let name = '';
  let price: number | string = '';
  let sku = '';
  let barcode = '';
  let stock: number | string = '';
  let low_stock_threshold: number | string = 3;
  let message: string | null = null;

  function toCurrency(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
      .format(Number(n) || 0);
  }

  // ---- estilos reutilizables (mismo diseño que dashboard/POS) ----
  const pageWrap =
    'bg-gradient-to-br from-blue-50 to-blue-200 dark:from-blue-950 dark:to-blue-800 text-neutral-800 dark:text-neutral-100 p-6 min-h-screen';
  const card =
    'rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10 shadow-lg';
  const inputCls =
    'px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900';
  const btn =
    'inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition';
  const btnPrimary =
    'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 shadow-lg';

  // ---- fallback seguro para evitar TypeError en SSR ----
  $: products = data?.products ?? [];
</script>

<div class={pageWrap}>
  <h1 class="text-3xl font-bold mb-6 text-center md:text-left">Inventario 📦</h1>

  <!-- Formulario -->
  <form
    method="post"
    action="?/add"
    class={`${card} grid grid-cols-1 md:grid-cols-6 gap-3`}
  >
    <input
      name="name"
      bind:value={name}
      placeholder="Nombre"
      class={`md:col-span-2 ${inputCls}`}
      required
    />
    <input
      name="price"
      bind:value={price}
      placeholder="Precio"
      inputmode="decimal"
      class={inputCls}
    />
    <input
      name="sku"
      bind:value={sku}
      placeholder="SKU"
      class={inputCls}
    />
    <input
      name="barcode"
      bind:value={barcode}
      placeholder="Código de barras"
      class={inputCls}
    />
    <input
      name="stock"
      bind:value={stock}
      placeholder="Stock"
      inputmode="numeric"
      class={inputCls}
    />
    <input
      name="low_stock_threshold"
      bind:value={low_stock_threshold}
      placeholder="Alerta stock"
      inputmode="numeric"
      class={inputCls}
    />

    <button class={`md:col-span-6 ${btn} ${btnPrimary} py-3 text-base`} type="submit">
      ➕ Agregar producto
    </button>
  </form>

  {#if message}
    <p class="mt-2 text-sm text-red-600">{message}</p>
  {/if}

  <!-- Listado -->
  <section class="mt-8">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-semibold text-xl">Listado</h2>
      <span class="text-sm text-neutral-600 dark:text-neutral-300">
        {products.length} producto(s)
      </span>
    </div>

    <div class="overflow-auto rounded-2xl bg-white/80 dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 shadow-lg">
      <table class="w-full text-sm">
        <thead class="bg-neutral-100/80 dark:bg-neutral-800/70">
          <tr class="text-neutral-600 dark:text-neutral-300 uppercase text-xs tracking-wide">
            <th class="p-3 text-left rounded-tl-2xl">Nombre</th>
            <th class="p-3">SKU</th>
            <th class="p-3">Código</th>
            <th class="p-3 text-right">Precio</th>
            <th class="p-3 text-right">Stock</th>
            <th class="p-3 text-right rounded-tr-2xl">Alerta</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
          {#each products as p}
            <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
              <td class="p-3 font-medium">{p?.name ?? '—'}</td>
              <td class="p-3">{p?.sku ?? '—'}</td>
              <td class="p-3">{p?.barcode ?? '—'}</td>
              <td class="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                {toCurrency(p?.price)}
              </td>
              <td class="p-3 text-right">{p?.stock ?? 0}</td>
              <td class="p-3 text-right">
                <span class={`px-2 py-0.5 rounded-full text-xs font-bold
                  ${(p?.stock ?? 0) <= (p?.low_stock_threshold ?? 0)
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                  {p?.low_stock_threshold ?? 0}
                </span>
              </td>
            </tr>
          {/each}
          {#if products.length === 0}
            <tr>
              <td colspan="6" class="p-6 text-center text-neutral-500 dark:text-neutral-400">
                No hay productos registrados.
              </td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </section>
</div>
