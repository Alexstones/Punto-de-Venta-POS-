<script lang="ts">
  export let data: {
    error?: string | null;
    from?: string; to?: string;
    kpi?: { total: number; count: number };
    daily?: { day: string; total: number; count: number }[];
    recent?: { id: number; total: number; paid: number; change: number; created_at: string; customer_id: string | null }[];
    lowCount?: number;
    topCustomers?: { id: string; full_name: string; sales_count: number; total_spent: number; last_purchase_at: string | null }[];
    registered?: { count: number; total: number };
    unregistered?: { count: number; total: number };
    mostrador?: { sales_count: number; total_spent: number; last_purchase_at: string | null };
  } = {};

  // fallbacks seguros (evita 500 en SSR)
  let from = data?.from ?? '';
  let to = data?.to ?? '';

  const kpi = data?.kpi ?? { total: 0, count: 0 };
  const lowCount = data?.lowCount ?? 0;

  $: daily = data?.daily ?? [];
  $: recent = data?.recent ?? [];
  $: topCustomers = data?.topCustomers ?? [];

  const registered = data?.registered ?? { count: 0, total: 0 };
  const unregistered = data?.unregistered ?? { count: 0, total: 0 };
  const mostrador = data?.mostrador ?? { sales_count: 0, total_spent: 0, last_purchase_at: null };

  const mxn = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);

  // estilos reutilizables (mismo sistema que dashboard/POS/Inventario/Clientes)
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
  const badge =
    'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium';
</script>

<div class={pageWrap}>
  <h1 class="text-3xl font-bold mb-6 text-center md:text-left">Reportes 📊</h1>

  {#if data?.error}
    <div class={`${card} mb-4 bg-red-50/70 dark:bg-red-900/30 ring-red-200 dark:ring-red-800`}>
      <strong class="block mb-1">No se pudieron cargar algunos datos.</strong>
      <div class="text-sm opacity-80">{data.error}</div>
    </div>
  {/if}

  <!-- Filtros -->
  <form method="GET" class={`${card} mb-4 grid grid-cols-1 sm:grid-cols-5 gap-3`}>
    <div class="sm:col-span-2">
      <label for="from" class="block text-sm text-neutral-500 mb-1">Desde</label>
      <input id="from" class={inputCls} type="date" name="from" bind:value={from} />
    </div>
    <div class="sm:col-span-2">
      <label for="to" class="block text-sm text-neutral-500 mb-1">Hasta</label>
      <input id="to" class={inputCls} type="date" name="to" bind:value={to} />
    </div>
    <div class="sm:col-span-1 flex items-end">
      <button class={`${btn} ${btnPrimary} w-full`}>Aplicar</button>
    </div>
  </form>

  <!-- KPIs generales -->
  <div class="grid gap-4 md:grid-cols-3 mb-4">
    <div class={card}>
      <div class="text-sm text-neutral-500">Ingresos (rango)</div>
      <div class="text-2xl font-semibold mt-1">{mxn(kpi.total)}</div>
    </div>
    <div class={card}>
      <div class="text-sm text-neutral-500"># Ventas</div>
      <div class="text-2xl font-semibold mt-1">{kpi.count}</div>
    </div>
    <div class={card}>
      <div class="text-sm text-neutral-500">Productos con bajo stock</div>
      <div class="text-2xl font-semibold mt-1">{lowCount}</div>
    </div>
  </div>

  <!-- Breakdown: Registrados vs Sin registro -->
  <div class="grid gap-4 md:grid-cols-2 mb-4">
    <div class={card}>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-neutral-500">Registrados</div>
          <div class={`${badge} mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Cliente registrado</div>
        </div>
        <div class="text-right">
          <div class="text-lg font-semibold">{mxn(registered.total)}</div>
          <div class="text-sm text-neutral-500">#{registered.count} ventas</div>
        </div>
      </div>
    </div>

    <div class={card}>
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-neutral-500">Sin registro (Mostrador)</div>
          <div class={`${badge} mt-1 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300`}>No registrado</div>
        </div>
        <div class="text-right">
          <div class="text-lg font-semibold">{mxn(unregistered.total)}</div>
          <div class="text-sm text-neutral-500">#{unregistered.count} ventas</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Ventas por día -->
  <div class={`${card} mb-4 overflow-auto`}>
    <div class="mb-2 flex items-center justify-between">
      <div class="text-base font-semibold">Ventas por día</div>
      <span class="text-sm text-neutral-600 dark:text-neutral-300">{daily.length} registro(s)</span>
    </div>
    <table class="w-full text-sm">
      <thead class="bg-neutral-100/80 dark:bg-neutral-800/70">
        <tr>
          <th class="p-3 text-left rounded-tl-2xl">Fecha</th>
          <th class="p-3 text-right">Total</th>
          <th class="p-3 text-right rounded-tr-2xl"># Ventas</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
        {#each daily as d}
          <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
            <td class="p-3">{d.day}</td>
            <td class="p-3 text-right">{mxn(d.total)}</td>
            <td class="p-3 text-right">{d.count}</td>
          </tr>
        {/each}
        {#if daily.length === 0}
          <tr><td colspan="3" class="p-6 text-center text-neutral-500">Sin ventas en el rango.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Últimas ventas -->
  <div class={`${card} overflow-auto`}>
    <div class="mb-2 flex items-center justify-between">
      <div class="text-base font-semibold">Últimas 10 ventas</div>
      <span class="text-sm text-neutral-600 dark:text-neutral-300">{recent.length} registro(s)</span>
    </div>
    <table class="w-full text-sm">
      <thead class="bg-neutral-100/80 dark:bg-neutral-800/70">
        <tr>
          <th class="p-3 text-left rounded-tl-2xl">ID</th>
          <th class="p-3">Fecha</th>
          <th class="p-3 text-right">Total</th>
          <th class="p-3 text-right">Pago</th>
          <th class="p-3 text-right">Cambio</th>
          <th class="p-3 text-right rounded-tr-2xl">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
        {#each recent as s}
          <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
            <td class="p-3">
              <a class="text-blue-600 dark:text-blue-400 hover:underline" href={`/ticket/${s.id}`} target="_blank" rel="noopener noreferrer">#{s.id}</a>
              <span class={`${badge} ml-2 ${s.customer_id ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                {s.customer_id ? 'Registrado' : 'Sin registro'}
              </span>
            </td>
            <td class="p-3">{new Date(s.created_at).toLocaleString("es-MX")}</td>
            <td class="p-3 text-right">{mxn(s.total)}</td>
            <td class="p-3 text-right">{mxn(s.paid)}</td>
            <td class="p-3 text-right">{mxn(s.change)}</td>
            <td class="p-3 text-right">
              <a class={`${btn} ${btnOutline}`} href={`/ticket/${s.id}?print=1`} target="_blank" rel="noopener">Imprimir</a>
            </td>
          </tr>
        {/each}
        {#if recent.length === 0}
          <tr><td colspan="6" class="p-6 text-center text-neutral-500">Aún no hay ventas.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Top clientes (incluye Mostrador si aplica) -->
  <div class={`${card} mt-4 overflow-auto`}>
    <div class="mb-2 flex items-center justify-between">
      <div class="text-base font-semibold">Clientes frecuentes (Top 5)</div>
      <span class="text-sm text-neutral-600 dark:text-neutral-300">
        {topCustomers.length + (mostrador.sales_count > 0 ? 1 : 0)} fila(s)
      </span>
    </div>
    <table class="w-full text-sm">
      <thead class="bg-neutral-100/80 dark:bg-neutral-800/70">
        <tr>
          <th class="p-3 text-left rounded-tl-2xl">Cliente</th>
          <th class="p-3 text-right"># Ventas</th>
          <th class="p-3 text-right">Gastado</th>
          <th class="p-3">Última compra</th>
          <th class="p-3 text-right rounded-tr-2xl">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
        {#if mostrador.sales_count > 0}
          <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
            <td class="p-3">
              Mostrador
              <span class={`${badge} ml-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300`}>Sin registro</span>
            </td>
            <td class="p-3 text-right">{mostrador.sales_count}</td>
            <td class="p-3 text-right">{mxn(mostrador.total_spent)}</td>
            <td class="p-3">{mostrador.last_purchase_at ? new Date(mostrador.last_purchase_at).toLocaleString('es-MX') : '—'}</td>
            <td class="p-3 text-right">—</td>
          </tr>
        {/if}

        {#each topCustomers as c}
          <tr class="hover:bg-neutral-50/70 dark:hover:bg-white/5 transition-colors">
            <td class="p-3">
              {c.full_name}
              <span class={`${badge} ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Registrado</span>
            </td>
            <td class="p-3 text-right">{c.sales_count}</td>
            <td class="p-3 text-right">{mxn(c.total_spent)}</td>
            <td class="p-3">{c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleString('es-MX') : '—'}</td>
            <td class="p-3 text-right">
              <a class={`${btn} ${btnOutline}`} href={`/clientes/${c.id}`} target="_blank" rel="noopener noreferrer">Ver</a>
            </td>
          </tr>
        {/each}

        {#if topCustomers.length === 0 && mostrador.sales_count === 0}
          <tr><td colspan="5" class="p-6 text-center text-neutral-500">Sin datos todavía.</td></tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
