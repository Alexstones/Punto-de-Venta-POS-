<script lang="ts">
  export let form: { message?: string } | undefined;
</script>

<h1 class="text-2xl font-semibold mb-4">Registrarse</h1>

<form method="POST" action="?/register" class="card grid gap-3 max-w-md">
  <div>
    <label for="full_name" class="block text-sm text-neutral-500 mb-1">Nombre</label>
    <input id="full_name" name="full_name" class="input" />
  </div>
  <div>
    <label for="email" class="block text-sm text-neutral-500 mb-1">Email</label>
    <input id="email" name="email" type="email" class="input" required />
  </div>
  <div>
    <label for="password" class="block text-sm text-neutral-500 mb-1">Contraseña</label>
    <input id="password" name="password" type="password" class="input" required />
  </div>

  {#if form?.message}
    <div class="text-sm text-emerald-700">{form.message}</div>
  {/if}

  <button class="btn btn-primary">Crear cuenta</button>

  <div class="text-sm text-neutral-600">
    ¿Ya tienes cuenta? <a class="underline" href="/auth/login">Entrar</a>
  </div>
</form>
