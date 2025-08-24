<script lang="ts">
  export let form: { message?: string } | undefined;
</script>

<h1 class="text-2xl font-semibold mb-4">Entrar</h1>

<form method="POST" action="?/login" class="card grid gap-3 max-w-md">
  <div>
    <label for="email" class="block text-sm text-neutral-500 mb-1">Email</label>
    <input id="email" name="email" type="email" class="input" required />
  </div>
  <div>
    <label for="password" class="block text-sm text-neutral-500 mb-1">Contraseña</label>
    <input id="password" name="password" type="password" class="input" required />
  </div>

  {#if form?.message}
    <div class="text-sm text-red-600">{form.message}</div>
  {/if}

  <button class="btn btn-primary">Entrar</button>

  <div class="text-sm text-neutral-600">
    ¿No tienes cuenta? <a class="underline" href="/auth/register">Regístrate</a>
  </div>
</form>
