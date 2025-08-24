import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.session) throw redirect(303, '/');
  return {};
};

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { message: 'Email y contraseña son requeridos' });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(400, { message: error.message });

    throw redirect(303, '/');
  }
};
