import { apiFetch } from '../../../shared/lib/api-client';
import { CreditCard, UpdateCreditCardInput } from '../types/finance.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const creditCardsApi = {
  list: (accessToken?: string | null): Promise<CreditCard[]> =>
    apiFetch<CreditCard[]>('/api/credit-cards', { headers: authHeaders(accessToken) }),

  create: (
    name: string,
    creditLimit: number,
    dueDay: number,
    amountOwed: number,
    accessToken?: string | null,
  ): Promise<CreditCard> =>
    apiFetch<CreditCard>('/api/credit-cards', {
      method: 'POST',
      body: JSON.stringify({ name, creditLimit, dueDay, amountOwed }),
      headers: authHeaders(accessToken),
    }),

  update: (id: string, input: UpdateCreditCardInput, accessToken?: string | null): Promise<CreditCard> =>
    apiFetch<CreditCard>(`/api/credit-cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  delete: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/credit-cards/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),
};
