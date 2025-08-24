<script lang="ts">
  export let data: { products: any[] };

  let name = '';
  let price: number | string = '';
  let sku = '';
  let barcode = '';
  let stock: number | string = '';
  let low_stock_threshold: number | string = 3;
  let message: string | null = null;

  function toCurrency(n: number) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);
  }
</script>

<h1 class="text-2xl font-semibold mb-4">Inventario</h1>

<form
  method="post"
  action="?/add"
  class="card grid grid-cols-1 md:grid-cols-6 gap-3"
>
  <input name="name" bind:value={name} placeholder="Nombre" class="md:col-span-2 input" required />
  <input name="price" bind:value={price} placeholder="Precio" inputmode="decimal" class="input" />
  <input name="sku" bind:value={sku} placeholder="SKU" class="input" />
  <input name="barcode" bind:value={barcode} placeholder="Código de barras" class="input" />
  <input name="stock" bind:value={stock} placeholder="Stock" inputmode="numeric" class="input" />
  <input name="low_stock_threshold" bind:value={low_stock_threshold} placeholder="Alerta stock" inputmode="numeric" class="input" />
  <button class="md:col-span-6 btn btn-primary" type="submit">Agregar producto</button>
</form>

{#if message}
  <p class="mt-2 text-sm text-red-600">{message}</p>
{/if}

<section class="mt-8">
  <h2 class="font-medium mb-2">Listado</h2>
  <div class="overflow-auto border rounded-xl bg-white dark:bg-neutral-900 dark:border-neutral-800">
    <table class="w-full text-sm">
      <thead class="bg-gray-100 dark:bg-neutral-800/70">
        <tr>
          <th class="p-2 text-left">Nombre</th>
          <th class="p-2">SKU</th>
          <th class="p-2">Código</th>
          <th class="p-2 text-right">Precio</th>
          <th class="p-2 text-right">Stock</th>
          <th class="p-2 text-right">Alerta</th>
        </tr>
      </thead>
      <tbody>
        {#each data.products as p}
          <tr class="border-t border-neutral-200 dark:border-neutral-800">
            <td class="p-2">{p.name}</td>
            <td class="p-2">{p.sku}</td>
            <td class="p-2">{p.barcode}</td>
            <td class="p-2 text-right">{toCurrency(p.price)}</td>
            <td class="p-2 text-right">{p.stock}</td>
            <td class="p-2 text-right">{p.low_stock_threshold}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
