<script lang="ts">
  import { BrowserMultiFormatReader } from '@zxing/browser';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher<{ decoded: string }>();

  let videoEl: HTMLVideoElement;
  let reader: BrowserMultiFormatReader | null = null;
  let active = false;
  let errorMsg = '';
  let lastCode = '';
  let lastAt = 0;

  async function start() {
    try {
      errorMsg = '';
      if (!reader) reader = new BrowserMultiFormatReader();
      await reader.decodeFromVideoDevice(undefined, videoEl, (res) => {
        if (res) {
          const code = res.getText();
          const now = Date.now();
          // evita duplicados por “ruido” (cooldown 1.2s)
          if (code !== lastCode || now - lastAt > 1200) {
            lastCode = code;
            lastAt = now;
            dispatch('decoded', code);
          }
        }
      });
      active = true;
    } catch (e: any) {
      errorMsg = e?.message ?? 'No se pudo iniciar la cámara';
      active = false;
    }
  }

  function stop() {
    if (reader) reader.reset();
    active = false;
  }

  onMount(() => {
    start();
  });
  onDestroy(() => {
    stop();
  });
</script>

<div class="glass-card shadow-neutral-700/30 p-6 space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="text-xl font-semibold text-neutral-200">
      Escáner de Códigos
    </h3>
    <div class="flex items-center space-x-2">
      <span class="text-sm text-neutral-400">{active ? 'Cámara Activa' : 'Inactiva'}</span>
      <span
        class="w-3 h-3 rounded-full {active ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'} transition-colors duration-200 animate-pulse-slow"></span>
    </div>
  </div>

  {#if errorMsg}
    <div transition:fade class="bg-red-900/50 text-red-300 border border-red-700 rounded-lg p-3 text-sm">
      <p>{errorMsg}</p>
    </div>
  {/if}

  <div class="relative overflow-hidden rounded-xl border border-neutral-800">
    <video bind:this={videoEl} class="block w-full aspect-[4/3]" autoplay muted playsinline></video>
  </div>

  <div class="flex gap-4">
    <button on:click={active ? stop : start} class="btn-neon-secondary flex-1">
      {active ? 'Detener' : 'Iniciar'} Escaneo
    </button>
  </div>
</div>