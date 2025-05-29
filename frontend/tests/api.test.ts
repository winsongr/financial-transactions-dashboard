import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from '../src/lib/api.ts';
import type { Scheme, User, DashboardSummary, SchemeDistribution } from '../src/lib/types.ts';

const mockSchemes: Scheme[] = [
  { scheme: 'Scheme A', users: [{ inv_name: 'Alice', total_amount: 100, total_units: 10 }] },
];
const mockUsers: User[] = [
  { pan: 'ABCDE1234F', inv_name: 'Alice', schemes: [{ scheme: 'Scheme A', total_units: 10, total_amount: 100, nav_price: 10 }] },
];
const mockSummary: DashboardSummary = {
  total_investors: 1,
  total_schemes: 1,
  total_investments: 100,
  total_nav_units: 10,
  total_nav_amount: 1000,
};
const mockDistribution: SchemeDistribution[] = [
  { scheme: 'Scheme A', total_units: 10, total_amount: 100 },
];

global.fetch = vi.fn() as unknown as typeof fetch;

function mockFetchJson(data: unknown, ok = true) {
  (fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({
    ok,
    json: async () => data,
  });
}

describe('api', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getSchemes returns schemes from array', async () => {
    mockFetchJson(mockSchemes);
    const result = await api.getSchemes();
    expect(result).toEqual(mockSchemes);
  });

  it('getSchemes returns schemes from object', async () => {
    mockFetchJson({ schemes: mockSchemes });
    const result = await api.getSchemes();
    expect(result).toEqual(mockSchemes);
  });

  it('getUserAggregates returns users from array', async () => {
    mockFetchJson(mockUsers);
    const result = await api.getUserAggregates();
    expect(result).toEqual(mockUsers);
  });

  it('getUserAggregates returns users from object', async () => {
    mockFetchJson({ users: mockUsers });
    const result = await api.getUserAggregates();
    expect(result).toEqual(mockUsers);
  });

  it('getDashboardSummary returns summary', async () => {
    mockFetchJson(mockSummary);
    const result = await api.getDashboardSummary();
    expect(result).toEqual(mockSummary);
  });

  it('getSchemeDistribution returns distribution from array', async () => {
    mockFetchJson(mockDistribution);
    const result = await api.getSchemeDistribution();
    expect(result).toEqual(mockDistribution);
  });

  it('getSchemeDistribution returns distribution from object', async () => {
    mockFetchJson({ data: mockDistribution });
    const result = await api.getSchemeDistribution();
    expect(result).toEqual(mockDistribution);
  });

  it('exportReport returns a Blob', async () => {
    const blob = new Blob(['test'], { type: 'application/pdf' });
    (fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({ ok: true, blob: async () => blob });
    const result = await api.exportReport();
    expect(result).toBeInstanceOf(Blob);
  });

  it('uploadCsv uploads a CSV file', async () => {
    const file = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
    mockFetchJson({ success: true });
    const result = await api.uploadCsv(file);
    expect(result).toEqual({ success: true });
  });

  it('uploadCsv throws on non-CSV file', async () => {
    const file = new File(['abc'], 'test.txt', { type: 'text/plain' });
    await expect(api.uploadCsv(file)).rejects.toThrow('Only CSV files are allowed.');
  });

  it('fetchApi throws on error', async () => {
    (fetch as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(api["getSchemes"]()).rejects.toThrow('API error: 500');
  });
}); 