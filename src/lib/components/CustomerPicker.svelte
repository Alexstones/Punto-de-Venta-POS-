<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { currentCustomer, type Customer } from '$lib/stores/customer';
  let q = '';
  let results: Customer[] = [];

  async function search() {
    const { data } = await supabase
      .from('customers')
      .select('id, full_name')
      .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10);
    results = (data as any) ?? [];
  }

  async function quickCreate() {
    if (!q.trim()) return;
    const { data, error } = await supabase.from('customers').insert({ full_name: q.trim() }).select('id, full_name').single();
    if (!error && data) currentCustomer.set(data);
    q = ''; results = [];
  }
</script>

<div class="card space-y-2">
  <div class="text-sm font-medium">Cliente</div>
  <div class="flex gap-2">
    <input class="input" placeholder="Buscar o escribir nombre..." bind:value={q} on:keydown={(e) => e.key==='Enter' && search()} />
    <button class="btn btn-outline" on:click={search}>Buscar</button>
    <button class="btn btn-primary" on:click={quickCreate}>Crear rápido</button>
  </div>

  <div class="text-sm">
    Seleccionado: 
    <span class="font-medium">
      {$currentCustomer ? $currentCustomer.full_name : 'Mostrador (sin registro)'}
    </span>
    {#if $currentCustomer}
      <button class="btn btn-outline ml-2" on:click={() => currentCustomer.set(null)}>Quitar</button>
    {/if}
  </div>

  {#if results.length}
    <ul class="text-sm border rounded-xl divide-y dark:border-neutral-800 dark:divide-neutral-800">
      {#each results as c}
        <li class="p-2 flex items-center justify-between">
          <span>{c.full_name}</span>
          <button class="btn btn-outline" on:click={() => (currentCustomer.set(c), results = [], q = '')}>Elegir</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
