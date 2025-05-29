// src/tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  auth: {
    signInWithOAuth: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    // ...other auth methods as needed
  },
  from: vi.fn(() => mockSupabase), // Allows chaining
  select: vi.fn(),
  upsert: vi.fn(),
  // ...other db methods as needed
};

// Usage in tests:
// vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }));
