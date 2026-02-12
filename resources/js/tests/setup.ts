import { vi } from 'vitest';

// Mock sessionStorage
const store: Record<string, string> = {};
vi.stubGlobal('sessionStorage', {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
});

// Mock window.location
vi.stubGlobal('location', {
    href: 'http://localhost/signup',
    search: '',
    replace: vi.fn(),
});

// Mock window.history
vi.stubGlobal('history', {
    replaceState: vi.fn(),
    pushState: vi.fn(),
});

// Mock window.scrollTo
vi.stubGlobal('scrollTo', vi.fn());
