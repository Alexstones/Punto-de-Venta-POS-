<script lang="ts">
  export let data: {
    error: string | null;
    kpis: { todayRevenue: number; todayCount: number; lowStockCount: number };
    daily7: { day: string; total: number }[];
    recent: {
      id: number;
      total: number;
      paid: number;
      change: number;
      created_at: string;
      customer_id: string | null;
    }[];
  };

  const mxn = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);

  // Chart helpers
  const maxY = Math.max(1, ...data.daily7.map((d) => d.total));
  const barH = (v: number) => Math.round((v / maxY) * 96); // hasta 96px

  // utilidades como constantes para no repetir tanto
  const card =
    'rounded-xl p-4 bg-white/70 dark:bg-white/5 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10';
  const btn =
    'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition';
  const btnPrimary =
    'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500';
  const btnOutline =
    'ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50/60 dark:hover:bg-white/5';
  const badge =
    'inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:text-neutral-300';

  const tileBase =
    'flex h-20 flex-col items-center justify-center rounded-xl ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50/60 dark:hover:bg-white/5 transition';
  const tilePrimary = 'bg-gradient-to-b from-blue-600 to-cyan-500 text-white ring-0 hover:brightness-110';
  const tileDanger = 'bg-red-600/90 text-white ring-0 hover:bg-red-600';

  const keypadBase =
    'h-12 rounded-lg ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50/60 dark:hover:bg-white/5 transition text-sm font-semibold';
  const keyOk = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-0 hover:brightness-110';
  const keyDanger = 'bg-red-600/90 text-white ring-0 hover:bg-red-600';

  const kpi = [
    { label: 'Ingresos de hoy', value: mxn(data.kpis.todayRevenue) },
    { label: '# Ventas hoy', value: String(data.kpis.todayCount) },
    { label: 'Bajo stock', value: String(data.kpis.lowStockCount) }
  ];
</script>

<!-- TOP BAR -->
<div class="sticky top-0 z-20 mb-4 rounded-xl bg-gradient-to-r from-[#0f172a] via-[#0b253f] to-[#0f172a] p-3 shadow-lg ring-1 ring-white/10">
  <div class="flex items-center gap-3">
    <button class="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 transition">☰</button>
    <h1 class="text-xl font-semibold text-white tracking-wide">SALES</h1>
    <div class="ml-auto flex-1 max-w-2xl">
      <label class="relative block">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">🔎</span>
        <input
          placeholder="Enter ITEM CODE or Scan Product"
          class="w-full rounded-lg bg-white/10 pl-10 pr-3 py-2 text-white placeholder-white/60 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-cyan-400"
        />
      </label>
    </div>
    <div class="hidden md:flex items-center gap-2">
      <a class={`${btn} ${btnPrimary}`}>Nueva venta</a>
      <a class={`${btn} ${btnOutline}`}>Reportes</a>
    </div>
  </div>
</div>

{#if data.error}
  <div class={`${card} mb-4 bg-red-50 dark:bg-red-950`}>
    <div class="text-sm">{data.error}</div>
  </div>
{/if}

<!-- KPIs -->
<div class="grid gap-4 md:grid-cols-3">
  {#each kpi as item}
    <div class={`${card} relative overflow-hidden bg-gradient-to-br from-white/70 to-white/50 dark:from-white/10 dark:to-white/5 ring-1 ring-black/5 dark:ring-white/10`}>
      <div class="absolute right-3 top-3 text-xs rounded-md bg-black/5 dark:bg-white/10 px-2 py-1">KPI</div>
      <div class="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</div>
      <div class="mt-1 text-2xl font-semibold tracking-tight">{item.value}</div>
      <div class="mt-3 h-1.5 w-full rounded bg-neutral-200/70 dark:bg-neutral-800/70">
        <div class="h-full w-2/3 rounded bg-gradient-to-r from-cyan-400 to-blue-500"></div>
      </div>
    </div>
  {/each}
</div>

<!-- MIDDLE: Chart + Actions + Keypad -->
<div class="mt-4 grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Chart -->
  <div class={`${card} lg:col-span-2 xl:col-span-2`}>
    <div class="mb-3 flex items-center justify-between">
      <div class="text-base font-semibold">Ingresos últimos 7 días</div>
      <div class="text-xs text-neutral-500">Máximo diario: {mxn(maxY)}</div>
    </div>

    <div class="flex items-end gap-2 h-[120px]">
      {#if data.daily7.length}
        {#each data.daily7 as d}
          <div class="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              class="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400 shadow-sm"
              style={`height:${barH(d.total)}px`}
              title={`${d.day}: ${mxn(d.total)}`}
            />
            <div class="text-[10px] text-neutral-500 truncate">{d.day.slice(5)}</div>
          </div>
        {/each}
      {:else}
        <div class="text-sm text-neutral-500">Sin datos recientes.</div>
      {/if}
    </div>
  </div>

  <!-- Quick actions -->
  <div class={`${card} xl:col-span-1`}>
    <div class="mb-2 text-base font-semibold">Acciones rápidas</div>
    <div class="grid grid-cols-2 gap-2">
      <a class={`${tileBase} ${tilePrimary}`} href="/pos">
        <span class="text-xl leading-none">➕</span>
        <small class="text-[11px] opacity-80 mt-1">Nueva venta</small>
      </a>
      <a class={`${tileBase}`} href="/inventario">
        <span class="text-xl leading-none">📦</span>
        <small class="text-[11px] opacity-80 mt-1">Inventario</small>
      </a>
      <a class={`${tileBase}`} href="/clientes">
        <span class="text-xl leading-none">👤</span>
        <small class="text-[11px] opacity-80 mt-1">Clientes</small>
      </a>
      <a class={`${tileBase}`} href="/reportes">
        <span class="text-xl leading-none">📊</span>
        <small class="text-[11px] opacity-80 mt-1">Reportes</small>
      </a>
      <a class={`${tileBase}`} href="/price-check">
        <span class="text-xl leading-none">🛈</span>
        <small class="text-[11px] opacity-80 mt-1">Consulta precio</small>
      </a>
      <a class={`${tileBase}`} href="/envios">
        <span class="text-xl leading-none">🚚</span>
        <small class="text-[11px] opacity-80 mt-1">Envío a domicilio</small>
      </a>
      <a class={`${tileBase}`} href="/loyalty">
        <span class="text-xl leading-none">💎</span>
        <small class="text-[11px] opacity-80 mt-1">Loyalty</small>
      </a>
      <a class={`${tileBase} ${tileDanger}`} href="/void">
        <span class="text-xl leading-none">⊘</span>
        <small class="text-[11px] opacity-80 mt-1">Void</small>
      </a>
    </div>
  </div>

  <!-- Keypad -->
  <div class={`${card} xl:col-span-1`}>
    <div class="mb-2 text-base font-semibold">Teclado rápido</div>
    <div class="grid grid-cols-4 gap-2">
      {#each ['7','8','9','⌫','4','5','6','%','1','2','3','00','0','.','C','OK'] as key}
        <button
          class={`${keypadBase} ${key==='OK' ? keyOk : ''} ${(key==='C'||key==='⌫') ? keyDanger : ''}`}
          on:click={() => console.log('key', key)}
        >
          {key}
        </button>
      {/each}
    </div>
    <div class="mt-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3 text-right text-xl font-semibold">
      TOTAL: <span style="font-variant-numeric: tabular-nums;">{mxn(data.kpis.todayRevenue)}</span>
    </div>
  </div>
</div>

<!-- RECENT ACTIVITY -->
<div class={`${card} mt-4 overflow-auto`}>
  <div class="mb-2 flex items-center justify-between">
    <div class="text-base font-semibold">Actividad reciente</div>
    <a class={`${btn} ${btnOutline} text-sm`} href="/reportes">Ver más</a>
  </div>
  <table class="w-full text-sm">
    <thead class="bg-neutral-100/80 dark:bg-neutral-800/60">
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
        <tr class="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-white/5">
          <td class="p-2">
            <a class="underline decoration-dotted hover:decoration-solid" href={`/ticket/${s.id}`}>#{s.id}</a>
            <span class={`${badge} ml-2`}>{s.customer_id ? 'Registrado' : 'Sin registro'}</span>
          </td>
          <td class="p-2">{new Date(s.created_at).toLocaleString('es-MX')}</td>
          <td class="p-2 text-right" style="font-variant-numeric: tabular-nums;">{mxn(s.total)}</td>
          <td class="p-2 text-right" style="font-variant-numeric: tabular-nums;">{mxn(s.paid)}</td>
          <td class="p-2 text-right" style="font-variant-numeric: tabular-nums;">{mxn(s.change)}</td>
          <td class="p-2 text-right">
            <a class={`${btn} ${btnOutline}`} href={`/ticket/${s.id}?print=1`} target="_blank" rel="noopener">Imprimir</a>
          </td>
        </tr>
      {/each}
      {#if !data.recent.length}
        <tr>
          <td colspan="6" class="p-3 text-center text-neutral-500">Sin ventas aún.</td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
