<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  export let data: { session: import('@supabase/supabase-js').Session | null };

  let dark = false;

  // Aplica/elimina el modo oscuro solo en el cliente
  $: if (browser) {
    document.documentElement.classList.toggle("dark", dark);
  }

  // Ruta activa para navbar
  const active = (href: string) =>
    $page.url.pathname.startsWith(href)
      ? "underline font-semibold"
      : "hover:underline";

  const userEmail = data.session?.user?.email ?? null;
</script>

<div class="min-h-screen">
  <header class="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-neutral-950/70 dark:border-neutral-800">
    <nav class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
      <a href="/" class="font-semibold">POS</a>

      <a href="/pos" class={active("/pos")}>Ventas</a>
      <a href="/inventario" class={active("/inventario")}>Inventario</a>
      <a href="/clientes" class={active("/clientes")}>Clientes</a>
      <a href="/reportes" class={active("/reportes")}>Reportes</a>

      <div class="ms-auto flex items-center gap-2">
        <span class="hidden md:inline-block badge">Bun</span>

        {#if userEmail}
          <span class="hidden sm:inline text-sm text-neutral-600 dark:text-neutral-300">{userEmail}</span>
          <form method="POST" action="/auth/logout">
            <button class="btn btn-outline" title="Cerrar sesión">Salir</button>
          </form>
        {:else}
          <a class="btn btn-outline" href="/auth/login">Entrar</a>
          <a class="btn btn-primary" href="/auth/register">Registrarse</a>
        {/if}

        <button class="btn btn-outline" on:click={() => (dark = !dark)} title="Cambiar tema">
          {dark ? "☾" : "☀︎"}
        </button>
      </div>
    </nav>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-6">
    <slot />
  </main>
</div>
