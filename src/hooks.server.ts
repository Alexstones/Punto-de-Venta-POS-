import type { Handle } from '@sveltejs/kit';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key: string) => event.cookies.get(key),
      set: (key: string, value: string, options: CookieOptions) =>
        event.cookies.set(key, value, { ...options, path: '/' }),
      remove: (key: string, options: CookieOptions) =>
        event.cookies.delete(key, { ...options, path: '/' })
    }
  });

  const { data: { session } } = await event.locals.supabase.auth.getSession();
  event.locals.session = session ?? null;

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};
