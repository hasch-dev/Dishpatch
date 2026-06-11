import { createBrowserClient } from "@supabase/ssr";

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
  const isDev = process.env.NODE_ENV === "development";

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage:
          isDev
            ? customMemoryStorage
            : typeof window !== "undefined"
              ? window.localStorage
              : undefined,

        persistSession: true,
      },
    }
  );

  if (typeof window !== "undefined") {
    client.auth.getSession().then(({ data, error }) => {
      console.log("=== SUPABASE SESSION DEBUG ===");
      console.log("error:", error);
      console.log("session:", data.session);
      console.log("user:", data.session?.user);
      console.log("role:", data.session?.user?.role);
      console.log("access token exists:", !!data.session?.access_token);
      console.log("==============================");
    });
  }

  return client;
}