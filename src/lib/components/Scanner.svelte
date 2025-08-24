<script lang="ts">
  import { BrowserMultiFormatReader } from '@zxing/browser';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

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
            lastCode = code; lastAt = now;
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

  onMount(() => { start(); });
  onDestroy(() => { stop(); });
</script>

<div class="space-y-2">
  <div class="flex gap-2 items-center">
    <button class="btn btn-outline" on:click={active ? stop : start}>
      {active ? 'Detener' : 'Iniciar'} cámara
    </button>
    {#if errorMsg}
      <span class="text-sm text-red-600">{errorMsg}</span>
    {/if}
  </div>

  <div class="overflow-hidden rounded-xl border dark:border-neutral-800">
    <video bind:this={videoEl} class="block w-full aspect-[4/3]" autoplay muted playsinline></video>
  </div>
</div>
