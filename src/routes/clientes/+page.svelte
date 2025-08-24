<script lang="ts">
  export let data: {
    error: string | null;
    q: string;
    customers: { id: string; full_name: string; sales_count: number; total_spent: number; last_purchase_at: string | null }[];
  };
  let q = data.q;
  const mxn = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);
</script>

<h1 class="text-2xl font-semibold mb-4">Clientes</h1>

{#if data.error}
  <div class="card mb-3 bg-red-50 dark:bg-red-950">
    <div class="text-sm">{data.error}</div>
  </div>
{/if}

<form method="GET" class="card mb-4 flex gap-2">
  <input class="input" name="q" bind:value={q} placeholder="Buscar por nombre..." />
  <button class="btn btn-primary">Buscar</button>
</form>

<div class="card overflow-auto">
  <table class="w-full text-sm">
    <thead class="bg-gray-100 dark:bg-neutral-800/70">
      <tr>
        <th class="p-2 text-left">Nombre</th>
        <th class="p-2 text-right"># Ventas</th>
        <th class="p-2 text-right">Gastado</th>
        <th class="p-2">Última compra</th>
        <th class="p-2 text-right">Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each data.customers as c}
        <tr class="border-t border-neutral-200 dark:border-neutral-800">
          <td class="p-2">{c.full_name}</td>
          <td class="p-2 text-right">{c.sales_count}</td>
          <td class="p-2 text-right">{mxn(c.total_spent)}</td>
          <td class="p-2">{c.last_purchase_at ? new Date(c.last_purchase_at).toLocaleString('es-MX') : '—'}</td>
          <td class="p-2 text-right">
            <a class="btn btn-outline" href={`/clientes/${c.id}`}>Ver</a>
          </td>
        </tr>
      {/each}
      {#if !data.customers.length}
        <tr><td colspan="5" class="p-3 text-center text-neutral-500">Sin resultados.</td></tr>
      {/if}
    </tbody>
  </table>
</div>
