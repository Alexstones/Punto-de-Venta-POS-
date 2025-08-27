<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    getProductByBarcode,
    upsertProductByBarcode,
    removeProductByBarcode,
    type Product
  } from '$lib/products';

  // ===== Config =====
  export let storageKey = 'pos_products_cache'; // cache local (opcional)
  export let autoAddIfMissing = true;           // crea en Supabase si no existe
  export let defaultName = 'Sin nombre';        // nombre provisional
  export let defaultPrice: number | null = 0;   // usa 0 si price es NOT NULL con default 0
  export let inputAutofocus = true;             // foco automático al input

  const dispatch = createEventDispatcher<{ decoded: string }>();

  // ===== Estado =====
  let errorMsg = '';
  let saving = false;

  let lastBarcode = '';
  let lastAt = 0;

  // Cache local (barcode -> { name, price })
  type CatalogItem = { name: string; price: number | null };
  type Catalog = Record<string, CatalogItem>;
  let cache: Catalog = {};

  // Editor inline
  let editing = false;
  let productName = '';
  let productPriceStr = '';

  // Entrada manual
  let manualBarcode = '';
  let manualInputEl: HTMLInputElement;

  // ===== Utilidades =====
  function loadCache() {
    try { cache = JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch { cache = {}; }
  }
  function saveCache() { localStorage.setItem(storageKey, JSON.stringify(cache)); }

  function parsePrice(str: string): number | null {
    const normalized = (str ?? '').toString().trim().replace(/[,$\s]/g, '').replace(',', '.');
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  const fmtCurrency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  function displayPrice(p: number | null | undefined) {
    return (p === null || p === undefined) ? '—' : fmtCurrency.format(p);
  }

  // ===== Flujo principal =====
  async function acceptBarcode(barcode: string) {
    const normalized = (barcode ?? '').trim();
    if (!normalized) return;

    lastBarcode = normalized;
    lastAt = Date.now();
    dispatch('decoded', normalized);

    await hydrateProductUI(normalized);

    if (inputAutofocus && manualInputEl) {
      await tick();
      manualInputEl.focus();
      manualInputEl.select();
    }
  }

  async function hydrateProductUI(barcode: string) {
    try {
      errorMsg = '';

      // 1) Pre-cargar desde cache de forma SEGURA (sin usar "!")
      const cached = cache[barcode];                         // puede ser undefined
      const initialName = cached?.name ?? '';
      const initialPrice: number | null =
        cached?.price !== undefined ? cached.price : (defaultPrice ?? null);

      productName = initialName;
      productPriceStr = initialPrice !== null ? String(initialPrice) : '';

      // 2) Consultar Supabase
      let prod: Product | null = await getProductByBarcode(barcode);

      // 3) Crear si no existe y está habilitado
      if (!prod && autoAddIfMissing) {
        saving = true;
        try {
          const priceToCreate: number | null = initialPrice;
          prod = await upsertProductByBarcode(barcode, initialName || defaultName, priceToCreate);
        } finally {
          saving = false;
        }
      }

      // 4) Actualizar UI + cache con datos de DB si existen
      if (prod) {
        productName = prod.name ?? '';
        const dbPrice: number | null = (prod.price ?? null) as number | null;
        productPriceStr = dbPrice !== null ? String(dbPrice) : '';
        cache[barcode] = { name: productName || defaultName, price: dbPrice };
        saveCache();
      } else {
        // No existe (y autoAdd=false): persistimos lo visto en UI
        const priceFromUI = parsePrice(productPriceStr);
        cache[barcode] = { name: productName || defaultName, price: priceFromUI };
        saveCache();
      }

      // 5) Abrir editor si faltan datos “reales”
      const priceVal = parsePrice(productPriceStr);
      editing = (!prod || !productName || productName === defaultName || priceVal === null);
    } catch (e: any) {
      console.error('[hydrateProductUI] error:', e);
      errorMsg = e?.message ?? 'No se pudo consultar/crear el producto';
      saving = false;
    }
  }

  async function confirmSave() {
    if (!lastBarcode) { errorMsg = 'Primero ingresa o procesa un código.'; return; }
    const name = (productName ?? '').trim() || defaultName;

    // Si está vacío o inválido, usa defaultPrice (puede ser 0)
    let price = parsePrice(productPriceStr);
    if (price === null) price = defaultPrice ?? null;

    try {
      errorMsg = '';
      saving = true;
      const saved = await upsertProductByBarcode(lastBarcode, name, price);
      const savedPrice: number | null = (saved.price ?? null) as number | null;
      cache[lastBarcode] = { name: saved.name, price: savedPrice };
      saveCache();
      productPriceStr = savedPrice !== null ? String(savedPrice) : '';
      editing = false;
    } catch (e: any) {
      console.error('[confirmSave] error:', e);
      errorMsg = e?.message ?? 'No se pudo guardar en Supabase';
    } finally { saving = false; }
  }

  async function removeFromCatalogSupabase() {
    if (!lastBarcode) return;
    try {
      errorMsg = '';
      saving = true;
      await removeProductByBarcode(lastBarcode);
      delete cache[lastBarcode];
      saveCache();
      productName = '';
      productPriceStr = '';
      editing = false;
    } catch (e: any) {
      console.error('[removeFromCatalogSupabase] error:', e);
      errorMsg = e?.message ?? 'No se pudo eliminar';
    } finally { saving = false; }
  }

  onMount(() => {
    loadCache();
    if (inputAutofocus && manualInputEl) manualInputEl.focus();
  });
</script>

<div class="bg-neutral-900/50 backdrop-blur-md border border-neutral-800 rounded-2xl shadow p-6 space-y-4">
  <h3 class="text-xl font-semibold text-neutral-200">Gestión de Productos</h3>

  {#if errorMsg}
    <div transition:fade class="bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-3 text-sm">
      <p>{errorMsg}</p>
    </div>
  {/if}

  <!-- Entrada manual -->
  <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-900/40">
    <label class="block text-sm text-neutral-300 mb-1">Ingresar código</label>
    <div class="flex gap-2">
      <input
        bind:this={manualInputEl}
        class="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        type="text"
        bind:value={manualBarcode}
        placeholder="Escanea con lector USB o pega el código"
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            acceptBarcode(manualBarcode);
            manualBarcode = '';
          }
        }}
      />
      <button
        type="button"
        class="px-3 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white shadow"
        on:click={() => { acceptBarcode(manualBarcode); manualBarcode = ''; }}>
        Procesar
      </button>
    </div>
  </div>

  <!-- Panel de resultados + acciones -->
  <div class="rounded-xl border border-neutral-800 p-4 bg-neutral-900/40">
    <div class="space-y-2">
      <p class="text-sm text-neutral-400">Último código</p>
      <p class="font-mono text-lg text-neutral-100 break-all">{lastBarcode || '—'}</p>

      <p class="text-sm text-neutral-400">Producto</p>
      {#if lastBarcode}
        <p class="text-base text-neutral-100">
          {productName || defaultName} — <span class="text-neutral-300">
            {displayPrice(parsePrice(productPriceStr))}
          </span>
        </p>
      {:else}
        <p class="text-base text-neutral-500 italic">Escanea o ingresa un código…</p>
      {/if}
    </div>

    <div class="flex flex-col gap-2 mt-4">
      <button
        type="button"
        class="px-3 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white shadow"
        on:click={() => (editing = true)}
        disabled={!lastBarcode}>
        {productName && productName !== defaultName ? 'Editar producto' : 'Agregar nombre / precio'}
      </button>

      <button
        type="button"
        class="px-3 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow"
        on:click={removeFromCatalogSupabase}
        disabled={!lastBarcode}>
        Quitar de Supabase
      </button>
    </div>

    <!-- Tabla resumen -->
    {#if lastBarcode}
      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-neutral-300">
            <tr>
              <th class="text-left py-2 pr-4">Producto</th>
              <th class="text-left py-2 pr-4">Código</th>
              <th class="text-left py-2 pr-4">Precio</th>
            </tr>
          </thead>
          <tbody class="text-neutral-100">
            <tr class="border-t border-neutral-800">
              <td class="py-2 pr-4">{productName || defaultName}</td>
              <td class="py-2 pr-4 font-mono break-all">{lastBarcode}</td>
              <td class="py-2 pr-4">{displayPrice(parsePrice(productPriceStr))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}

    {#if editing}
      <div class="mt-4 rounded-lg border border-neutral-800 p-3 bg-neutral-900/60" transition:fade>
        <label class="block text-sm text-neutral-300 mb-1">Datos del producto</label>
        <code class="block text-xs text-neutral-400 mb-3 break-all">Código: {lastBarcode}</code>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span class="block text-xs text-neutral-400 mb-1">Nombre</span>
            <input
              class="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              type="text"
              bind:value={productName}
              placeholder="Ej. Refresco 600ml" />
          </div>
          <div>
            <span class="block text-xs text-neutral-400 mb-1">Precio</span>
            <input
              class="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              type="number"
              step="0.01"
              min="0"
              bind:value={productPriceStr}
              placeholder="0.00" />
          </div>
        </div>

        <div class="flex gap-2 mt-3">
          <button
            type="button"
            class="px-3 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white shadow"
            on:click={confirmSave}
            disabled={!lastBarcode || saving}>
            {saving ? 'Guardando…' : 'Guardar en Supabase'}
          </button>
          <button
            type="button"
            class="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700"
            on:click={() => (editing = false)}
            disabled={saving}>
            Cancelar
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
