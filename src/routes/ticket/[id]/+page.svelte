<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';

  export let data: {
    sale: {
      id: number;
      created_at: string;
      subtotal: number;
      discount: number;
      tax_rate: number;
      tax_amount: number;
      total_due: number;
      paid_cash: number;
      paid_card: number;
      payment_method: string | null;
      paid: number;
      change: number;
    };
    items: {
      quantity: number;
      unit_price: number;
      subtotal: number;
      products: { name: string; sku: string | null; barcode: string | null };
    }[];
    customer: { full_name: string | null } | null;
    ticketUrl: string;
    qrDataUrl: string;
  };

  const mxn = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n ?? 0);
  const dt = new Date(data.sale.created_at);

  // Auto-print si viene ?print=1
  $: if (browser && $page.url.searchParams.get('print') === '1') {
    setTimeout(() => window.print(), 100);
  }
</script>

<!-- Controles (no se imprimen) -->
<div class="no-print mb-4 flex gap-2">
  <a href="/pos" class="btn btn-outline">Nueva venta</a>
  <button class="btn btn-primary" on:click={() => window.print()}>Imprimir</button>
</div>

<!-- Recibo 80mm -->
<div class="receipt mx-auto rounded-xl border bg-white p-4 text-sm leading-5 dark:bg-white dark:text-black">
  <div class="text-center">
    <img
      src="/logo.png"
      alt=""
      class="mx-auto mb-2 h-10 object-contain"
      on:error={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
    />
    <div class="font-semibold">Tu Negocio</div>
    <div>RFC: XAXX010101000</div>
    <div>Av. Siempre Viva 742</div>
  </div>

  <div class="divider"></div>

  <div class="flex justify-between">
    <div><span class="font-medium">Ticket:</span> #{data.sale.id}</div>
    <div>
      {dt.toLocaleDateString('es-MX')}
      {dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>
  {#if data.customer}
    <div><span class="font-medium">Cliente:</span> {data.customer.full_name ?? 'Mostrador'}</div>
  {/if}

  <div class="divider"></div>

  <!-- Detalle de items -->
  <div class="space-y-1">
    {#each data.items as it}
      <div>
        <div class="flex justify-between">
          <div class="pr-2">{it.products?.name}</div>
          <div>{mxn(it.unit_price)}</div>
        </div>
        <div class="flex justify-between text-[0.9em] text-gray-600">
          <div>{it.quantity} x {mxn(it.unit_price)}</div>
          <div>{mxn(it.subtotal)}</div>
        </div>
      </div>
    {/each}
  </div>

  <div class="divider"></div>

  <!-- Totales -->
  <div class="space-y-1">
    <div class="flex justify-between"><span>Subtotal</span><span>{mxn(data.sale.subtotal)}</span></div>
    <div class="flex justify-between"><span>Descuento</span><span>-{mxn(data.sale.discount)}</span></div>
    <div class="flex justify-between">
      <span>IVA ({Number(data.sale.tax_rate ?? 0).toFixed(2)}%)</span><span>{mxn(data.sale.tax_amount)}</span>
    </div>
    <div class="flex justify-between font-semibold"><span>Total</span><span>{mxn(data.sale.total_due)}</span></div>
  </div>

  <div class="divider"></div>

  <!-- Pagos -->
  <div class="space-y-1">
    <div class="flex justify-between"><span>Efectivo</span><span>{mxn(data.sale.paid_cash)}</span></div>
    <div class="flex justify-between"><span>Tarjeta</span><span>{mxn(data.sale.paid_card)}</span></div>
    <div class="flex justify-between"><span>Pagado</span><span>{mxn(data.sale.paid)}</span></div>
    <div class="flex justify-between"><span>Cambio</span><span>{mxn(data.sale.change)}</span></div>
  </div>

  <div class="divider"></div>

  <!-- QR -->
  <div class="text-center">
    {#if data.qrDataUrl}
      <img src={data.qrDataUrl} alt="QR del ticket" class="mx-auto h-28 w-28" />
    {/if}
    <div class="text-[0.85em] text-gray-600 break-all">{data.ticketUrl}</div>
  </div>

  <div class="divider"></div>

  <div class="text-center">
    <div class="font-medium">¡Gracias por su compra!</div>
    <div class="text-[0.9em] text-gray-600">Vuelva pronto</div>
  </div>
</div>

<style>
  /* Recibo térmico 80mm */
  .receipt { width: 80mm; }
  .divider { border-top: 1px dashed #999; margin: 8px 0; }
  @page { size: 80mm auto; margin: 0; }
  @media print {
    .no-print { display: none !important; }
    body { background: white; color: black; }
    .receipt { border: none; border-radius: 0; }
  }
</style>
