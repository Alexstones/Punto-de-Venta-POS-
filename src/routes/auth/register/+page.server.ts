import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) throw redirect(303, '/');
  return {};
};

export const actions: Actions = {
  register: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const full_name = String(form.get('full_name') ?? '').trim();

    if (!email || !password) {
      return fail(400, { message: 'Email y contraseña son requeridos' });
    }

    const redirectTo = `${url.origin}/auth/login`; // a dónde los mandará el enlace de confirmación (si está activa)
    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: redirectTo
      }
    });

    if (error) return fail(400, { message: error.message });

    // Si no hay confirmación por correo, algunos proyectos devuelven sesión aquí.
    if (data.session) throw redirect(303, '/');

    // Con confirmación por correo activada:
    return { message: 'Revisa tu correo para confirmar tu cuenta.' };
  }
};
