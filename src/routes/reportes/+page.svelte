<script lang="ts">
  export let data: {
    error: string | null;
    from: string; to: string;
    kpi: { total: number; count: number };
    daily: { day: string; total: number; count: number }[];
    recent: { id: number; total: number; paid: number; change: number; created_at: string; customer_id: string | null }[];
    lowCount: number;
    topCustomers: { id: string; full_name: string; sales_count: number; total_spent: number; last_purchase_at: string | null }[];
    registered: { count: number; total: number };
    unregistered: { count: number; total: number };
    mostrador: { sales_count: number; total_spent: number; last_purchase_at: string | null };
  };

  let from = data.from;
  let to = data.to;

  const mxn = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n ?? 0);
</script>

<h1 class="text-2xl font-semibold mb-4">Reportes</h1>

{#if data.error}
  <div class="card mb-4 bg-red-50 dark:bg-red-950">
    <strong class="block mb-1">No se pudieron cargar algunos datos.</strong>
    <div class="text-sm opacity-80">{data.error}</div>
  </div>
{/if}

<form method="GET" class="card mb-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
  <div class="sm:col-span-2">
    <label for="from" class="block text-sm text-neutral-500 mb-1">Desde</label>
    <input id="from" class="input" type="date" name="from" bind:value={from} />
  </div>
  <div class="sm:col-span-2">
    <label for="to" class="block text-sm text-neutral-500 mb-1">Hasta</label>
    <input id="to" class="input" type="date" name="to" bind:value={to} />
  </div>
  <div class="sm:col-span-1 flex items-end">
    <button class="btn btn-primary w-full">Aplicar</button>
  </div>
</form>

<!-- KPIs generales -->
<div class="grid gap-4 md:grid-cols-3 mb-4">
  <div class="card">
    <div class="text-sm text-neutral-500">Ingresos (rango)</div>
    <div class="text-2xl font-semibold mt-1">{mxn(data.kpi.total)}</div>
  </div>
  <div class="card">
    <div class="text-sm text-neutral-500"># Ventas</div>
    <div class="text-2xl font-semibold mt-1">{data.kpi.count}</div>
  </div>
  <div class="card">
    <div class="text-sm text-neutral-500">Productos con bajo stock</div>
    <div class="text-2xl font-semibold mt-1">{data.lowCount}</div>
  </div>
</div>

<!-- Breakdown: Registrados vs Sin registro -->
<div class="grid gap-4 md:grid-cols-2 mb-4">
  <div class="card">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm text-neutral-500">Registrados</div>
        <div class="text-xs badge mt-1">Cliente registrado</div>
      </div>
      <div class="text-right">
        <div class="text-lg font-semibold">{mxn(data.registered.total)}</div>
        <div class="text-sm text-neutral-500">#{data.registered.count} ventas</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm text-neutral-500">Sin registro (Mostrador)</div>
        <div class="text-xs badge mt-1">No registrado</div>
      </div>
      <div class="text-right">
        <div class="text-lg font-semibold">{mxn(data.unregistered.total)}</div>
        <div class="text-sm text-neutral-500">#{data.unregistered.count} ventas</div>
      </div>
    </div>
  </div>
</div>

<div class="card mb-4 overflow-auto">
  <div class="text-base font-semibold mb-2">Ventas por día</div>
  <table class="w-full text-sm">
    <thead class="bg-gray-100 dark:bg-neutral-800/70">
      <tr>
        <th class="p-2 text-left">Fecha</th>
        <th class="p-2 text-right">Total</th>
        <th class="p-2 text-right"># Ventas</th>
      </tr>
    </thead>
    <tbody>
      {#each data.daily as d}
        <tr class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="p-2">{d.day}</td>
          <td class="p-2 text-right">{mxn(d.total)}</td>
          <td class="p-2 text-right">{d.count}</td>
        </tr>
      {/each}
      {#if !data.daily.length}
        <tr><td colspan="3" class="p-3 text-center text-neutral-500">Sin ventas en el rango.</td></tr>
      {/if}
    </tbody>
  </table>
</div>

<div class="card overflow-auto">
  <div class="text-base font-semibold mb-2">Últimas 10 ventas</div>
  <table class="w-full text-sm">
    <thead class="bg-gray-100 dark:bg-neutral-800/70">
      <tr>
        <th class="p-2 text-left">ID</th>
        <th class="p-2">Fecha</th>
        <th class="p-2 text-right">Total</th>
        <th class="p-2 text-right">Pago</th>
        <th class="p-2 text-right">Cambio</th>
        <th class="p-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each data.recent as s}
        <tr class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="p-2">
            <a class="underline" href={`/ticket/${s.id}`}>#{s.id}</a>
            <span class="badge ml-2">{s.customer_id ? 'Registrado' : 'Sin registro'}</span>
          </td>
          <td class="p-2">{new Date(s.created_at).toLocaleString("es-MX")}</td>
          <td class="p-2 text-right">{mxn(s.total)}</td>
          <td class="p-2 text-right">{mxn(s.paid)}</td>
          <td class="p-2 text-right">{mxn(s.change)}</td>
          <td class="p-2 text-right">
            <a class="btn btn-outline" href={`/ticket/${s.id}?print=1`} target="_blank" rel="noopener">
              Imprimir
            </a>
          </td>
        </tr>
      {/each}
      {#if !data.recent.length}
        <tr><td colspan="6" class="p-3 text-center text-neutral-500">Aún no hay ventas.</td></tr>
      {/if}
    </tbody>
  </table>
</div>

<!-- Top clientes (incluye Mostrador si aplica) -->
<div class="card mt-4 overflow-auto">
  <div class="text-base font-semibold mb-2">Clientes frecuentes (Top 5)</div>
  <table class="w-full text-sm">
    <thead class="bg-gray-100 dark:bg-neutral-800/70">
      <tr>
        <th class="p-2 text-left">Cliente</th>
        <th class="p-2 text-right"># Ventas</th>
        <th class="p-2 text-right">Gastado</th>
        <th class="p-2">Última compra</th>
        <th class="p-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#if data.mostrador.sales_count > 0}
        <tr class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="p-2">
            Mostrador
            <span class="badge ml-2">Sin registro</span>
          </td>
          <td class="p-2 text-right">{data.mostrador.sales_count}</td>
          <td class="p-2 text-right">{mxn(data.mostrador.total_spent)}</td>
          <td class="p-2">{data.mostrador.last_purchase_at ? new Date(data.mostrador.last_purchase_at).toLocaleString('es-MX') : '—'}</td>
          <td class="p-2 text-right">—</td>
        </tr>
      {/if}

      {#each data.topCustomers as c}
        <tr class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="p-2">
            {c.full_name}
            <span class="badge ml-2">Registrado</span>
          </td>
          <td class="p-2 text-right">{c.sales_count}</td>
          <td class="p-2 text-right">{mxn(c.total_spent)}</td>
          <td class="p-2">{c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleString('es-MX') : '—'}</td>
          <td class="p-2 text-right">
            <a class="btn btn-outline" href={`/clientes/${c.id}`}>Ver</a>
          </td>
        </tr>
      {/each}

      {#if !data.topCustomers?.length && data.mostrador.sales_count === 0}
        <tr><td colspan="5" class="p-3 text-center text-neutral-500">Sin datos todavía.</td></tr>
      {/if}
    </tbody>
  </table>
</div>
