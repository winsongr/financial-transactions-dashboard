import { Scheme, User, DashboardSummary, SchemeDistribution } from './types.ts';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6000';

async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

export async function getSchemes(): Promise<Scheme[]> {

  const data = await fetchApi<{ schemes: Scheme[] } | Scheme[]>('/api/transactions/scheme-users');
  if (Array.isArray(data)) return data;
  if ('schemes' in data) return data.schemes;
  throw new Error('Invalid API response for schemes');
}

export async function getUserAggregates(): Promise<User[]> {
  const data = await fetchApi<{ users: User[] } | User[]>('/api/transactions/user-scheme-aggregates');
  if (Array.isArray(data)) return data;
  if ('users' in data) return data.users;
  throw new Error('Invalid API response for user aggregates');
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return await fetchApi<DashboardSummary>('/api/transactions/dashboard-summary');
}

export async function getSchemeDistribution(): Promise<SchemeDistribution[]> {
  const data = await fetchApi<{ data: SchemeDistribution[] } | SchemeDistribution[]>('/api/transactions/scheme-distribution');
  if (Array.isArray(data)) return data;
  if ('data' in data) return data.data;
  throw new Error('Invalid API response for scheme distribution');
}

export async function exportReport(): Promise<Blob> {
  try {
    const res = await fetch(`${BASE_URL}/api/transactions/export-report`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf,application/octet-stream',
      },
    });
    if (!res.ok) throw new Error(`Export error: ${res.status}`);
    return await res.blob();
  } catch (error) {
    console.error('Export report error:', error);
    throw error;
  }
}

export async function uploadCsv(file: File): Promise<unknown> {
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    throw new Error('Only CSV files are allowed.');
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${BASE_URL}/api/transactions/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      let errorMsg = `Upload error: ${res.status}`;
      try {
        const data = await res.clone().json();
        if (data && data.details) {
          errorMsg = Array.isArray(data.details) ? data.details.join('\n') : data.details;
        } else if (data && (data.error || data.message)) {
          errorMsg = data.error || data.message;
        } else if (data && data.detail) {
          errorMsg = data.detail;
        }
      } catch {
        try {
          const text = await res.text();
          if (text) errorMsg = text;
        } catch {
          // ignore
        }
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (error) {
    console.error('Upload CSV error:', error);
    throw error;
  }
} 