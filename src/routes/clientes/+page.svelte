<script lang="ts">
  export let data: {
    error?: string | null;
    q?: string;
    customers?: {
      id: string;
      full_name: string;
      sales_count: number;
      total_spent: number;
      last_purchase_at: string | null;
    }[];
  } = { error: null, q: '', customers: [] };

  let q = data?.q ?? '';
  const customers = data?.customers ?? [];

  const mxn = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);

  // utilidades de estilo reutilizables (sin @apply)
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
  const btnOutline =
    'ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50/60 dark:hover:bg-white/10';
</script>

<div class={pageWrap}>
  <h1 class="text-3xl font-bold mb-6 text-center md:text-left">Clientes 👥</h1>

  {#if data?.error}
    <div class={`${card} mb-4 bg-red-50/70 dark:bg-red-900/30 ring-red-200 dark:ring-red-800`}>
      <div class="text-sm">{data.error}</div>
    </div>
  {/if}

  <!-- Buscador -->
  <form method="GET" class={`${card} mb-4 flex gap-2`}>
    <input class={inputCls} name="q" bind:value={q} placeholder="Buscar por nombre..." />
    <button class={`${btn} ${btnPrimary}`}>Buscar</button>
  </form>

  <!-- Tabla -->
  <div class={`${card} overflow-auto`}>
    <div class="mb-3 flex items-center justify-between">
      <div class="text-base font-semibold">Resultados</div>
      <span class="text-sm text-neutral-600 dark:text-neutral-300">{customers.length} cliente(s)</span>
    </div>

    <table class="w-full text-sm">
      <thead class="bg-neutral-100/80 dark:bg-neutral-800/70">
        <tr class="text-neutral-600 dark:text-neutral-300 uppercase text-xs tracking-wide">
          <th class="p-3 text-left rounded-tl-2xl">Nombre</th>
          <th class="p-3 text-right"># Ventas</th>
          <th class="p-3 text-right">Gastado</th>
          <th class="p-3">Última compra</th>
          <th class="p-3 text-right rounded-tr-2xl">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
        {#each customers as c}
          <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
            <td class="p-3 font-medium">{c.full_name}</td>
            <td class="p-3 text-right">{c.sales_count}</td>
            <td class="p-3 text-right font-semibold text-green-600 dark:text-green-400">{mxn(c.total_spent)}</td>
            <td class="p-3">
              {c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleString('es-MX') : '—'}
            </td>
            <td class="p-3 text-right">
              <a class={`${btn} ${btnOutline}`} href={`/clientes/${c.id}`}>Ver</a>
            </td>
          </tr>
        {/each}

        {#if customers.length === 0}
          <tr>
            <td colspan="5" class="p-6 text-center text-neutral-500 dark:text-neutral-400">
              Sin resultados.
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
