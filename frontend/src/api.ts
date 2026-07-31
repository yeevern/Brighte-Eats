export interface Lead {
  id: number;
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
  created_at: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.errors ? JSON.stringify(data.errors) : data?.message || 'Request failed',
    );
  }

  return data as T;
}

export async function createLead(payload: LeadPayload): Promise<Lead> {
  return request<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listLeads(service?: string): Promise<Lead[]> {
  const query = service ? `?service=${encodeURIComponent(service)}` : '';
  return request<Lead[]>(`/leads${query}`);
}
