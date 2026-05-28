import { createBrowserClient } from '@supabase/ssr';

// A volatile, file-level memory store that only lives as long as the browser tab context.
// Client-side transitions via Next.js links keep this alive, but hard refreshes wipe it.
let devMemoryStorage: Record<string, string> = {};

const customMemoryStorage = {
  getItem: (key: string) => devMemoryStorage[key] || null,
  setItem: (key: string, value: string) => {
    devMemoryStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete devMemoryStorage[key];
  },
};

export function createClient() {
  const isDev = process.env.NODE_ENV === 'development';

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Dev mode gets zero-trace memory storage; Production gets persistent localStorage
        storage: isDev 
          ? customMemoryStorage 
          : (typeof window !== 'undefined' ? window.localStorage : undefined),
        persistSession: true,
      },
    }
  );
}