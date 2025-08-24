<script lang="ts">
  export let data: {
    error: string | null;
    kpis: { todayRevenue: number; todayCount: number; lowStockCount: number };
    daily7: { day: string; total: number }[];
    recent: { id: number; total: number; paid: number; change: number; created_at: string; customer_id: string | null }[];
  };

  const mxn = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);

  // Para el gráfico (escala)
  const maxY = Math.max(1, ...data.daily7.map(d => d.total));
  const barH = (v: number) => Math.round((v / maxY) * 80); // altura en px (máx 80)
</script>

<h1 class="text-2xl font-semibold mb-4">Dashboard</h1>

{#if data.error}
  <div class="card mb-4 bg-red-50 dark:bg-red-950">
    <div class="text-sm">{data.error}</div>
  </div>
{/if}

<!-- KPIs -->
<div class="grid gap-4 md:grid-cols-3">
  <div class="card">
    <div class="text-sm text-neutral-500">Ingresos de hoy</div>
    <div class="text-2xl font-semibold mt-1">{mxn(data.kpis.todayRevenue)}</div>
  </div>
  <div class="card">
    <div class="text-sm text-neutral-500"># Ventas hoy</div>
    <div class="text-2xl font-semibold mt-1">{data.kpis.todayCount}</div>
  </div>
  <div class="card">
    <div class="text-sm text-neutral-500">Bajo stock</div>
    <div class="text-2xl font-semibold mt-1">{data.kpis.lowStockCount}</div>
  </div>
</div>

<!-- Gráfico + acciones -->
<div class="grid gap-4 lg:grid-cols-3 mt-4">
  <!-- Gráfico 7 días -->
  <div class="card lg:col-span-2">
    <div class="flex items-center justify-between mb-2">
      <div class="text-base font-semibold">Ingresos últimos 7 días</div>
      <div class="text-xs text-neutral-500">Máximo diario: {mxn(maxY)}</div>
    </div>

    <!-- Mini bar chart (CSS) -->
    <div class="flex items-end gap-2 h-28">
      {#each data.daily7 as d}
        <div class="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div class="w-full rounded-t-md bg-neutral-900 dark:bg-white" style={`height:${barH(d.total)}px`} />
          <div class="text-[10px] text-neutral-500 truncate">{d.day.slice(5)}</div>
        </div>
      {/each}
      {#if !data.daily7.length}
        <div class="text-sm text-neutral-500">Sin datos recientes.</div>
      {/if}
    </div>
  </div>

  <!-- Acciones rápidas -->
  <div class="card">
    <div class="text-base font-semibold mb-2">Acciones rápidas</div>
    <div class="grid gap-2">
      <a class="btn btn-primary w-full text-center" href="/pos">➕ Nueva venta</a>
      <a class="btn btn-outline w-full text-center" href="/inventario">📦 Inventario</a>
      <a class="btn btn-outline w-full text-center" href="/clientes">👤 Clientes</a>
      <a class="btn btn-outline w-full text-center" href="/reportes">📊 Reportes</a>
    </div>
  </div>
</div>

<!-- Últimas ventas -->
<div class="card mt-4 overflow-auto">
  <div class="text-base font-semibold mb-2">Actividad reciente</div>
  <table class="w-full text-sm">
    <thead class="bg-gray-100 dark:bg-neutral-800/70">
      <tr>
        <th class="p-2 text-left">Ticket</th>
        <th class="p-2">Fecha</th>
        <th class="p-2 text-right">Total</th>
        <th class="p-2 text-right">Pagado</th>
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
          <td class="p-2">{new Date(s.created_at).toLocaleString('es-MX')}</td>
          <td class="p-2 text-right">{mxn(s.total)}</td>
          <td class="p-2 text-right">{mxn(s.paid)}</td>
          <td class="p-2 text-right">{mxn(s.change)}</td>
          <td class="p-2 text-right">
            <a class="btn btn-outline" href={`/ticket/${s.id}?print=1`} target="_blank" rel="noopener">Imprimir</a>
          </td>
        </tr>
      {/each}
      {#if !data.recent.length}
        <tr><td colspan="6" class="p-3 text-center text-neutral-500">Sin ventas aún.</td></tr>
      {/if}
    </tbody>
  </table>
</div>

<style>
  /* El chart usa 80px de alto (controlado en barH) */
</style>
