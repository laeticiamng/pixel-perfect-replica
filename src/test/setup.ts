import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock react-helmet-async globally so <Helmet> / <HelmetProvider> never
// touches real DOM head manipulation inside jsdom (fixes HelmetDispatcher crash).
vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: { children?: React.ReactNode }) => children ?? null,
  HelmetProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});


// Recursive Supabase query builder mock — supports arbitrary .select().eq().limit() chains
function createQueryMock(): any {
  const result = { data: null, error: null };
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === "then") return (fn: any) => Promise.resolve(result).then(fn);
      if (prop === "catch") return (fn: any) => Promise.resolve(result).catch(fn);
      if (prop === "finally") return (fn: any) => Promise.resolve(result).finally(fn);
      // Return a function that returns a new chainable proxy
      return vi.fn(() => new Proxy({}, handler));
    },
  };
  return new Proxy({}, handler);
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithOtp: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => createQueryMock()),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));
