const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const spiritsEnabled = Boolean(url && key);
let clientPromise;
let signingIn;

export async function authenticatedClient() {
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, key),
  );
  const client = await clientPromise;
  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  if (!data.session) {
    signingIn ??= client.auth.signInAnonymously().finally(() => {
      signingIn = null;
    });
    const { error } = await signingIn;
    if (error) throw error;
  }
  return client;
}

export async function guestbook(action, payload = {}) {
  const client = await authenticatedClient();
  const { data: result, error } = await client.rpc("spirit_guestbook", {
    action,
    payload,
  });
  if (error) throw new Error(error.message);
  return result;
}
