import { apiFetch } from '../../../shared/lib/api-client';
import { DailyExpense, ExpensesSummary, FixedMonthlyExpense } from '../types/expenses.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const expensesApi = {
  listDaily: (date: string, accessToken?: string | null): Promise<DailyExpense[]> =>
    apiFetch<DailyExpense[]>(`/api/expenses/daily?date=${date}`, { headers: authHeaders(accessToken) }),

  createDaily: (name: string, amount: number, expenseDate: string, accessToken?: string | null): Promise<DailyExpense> =>
    apiFetch<DailyExpense>('/api/expenses/daily', {
      method: 'POST',
      body: JSON.stringify({ name, amount, expenseDate }),
      headers: authHeaders(accessToken),
    }),

  updateDaily: (
    id: string,
    input: { name?: string; amount?: number },
    accessToken?: string | null
  ): Promise<DailyExpense> =>
    apiFetch<DailyExpense>(`/api/expenses/daily/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  deleteDaily: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/expenses/daily/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  listFixed: (accessToken?: string | null): Promise<FixedMonthlyExpense[]> =>
    apiFetch<FixedMonthlyExpense[]>('/api/expenses/fixed', { headers: authHeaders(accessToken) }),

  createFixed: (name: string, amount: number, accessToken?: string | null): Promise<FixedMonthlyExpense> =>
    apiFetch<FixedMonthlyExpense>('/api/expenses/fixed', {
      method: 'POST',
      body: JSON.stringify({ name, amount }),
      headers: authHeaders(accessToken),
    }),

  updateFixed: (
    id: string,
    input: { name?: string; amount?: number },
    accessToken?: string | null
  ): Promise<FixedMonthlyExpense> =>
    apiFetch<FixedMonthlyExpense>(`/api/expenses/fixed/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  deleteFixed: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/expenses/fixed/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  getSummary: (date: string, accessToken?: string | null): Promise<ExpensesSummary> =>
    apiFetch<ExpensesSummary>(`/api/expenses/summary?date=${date}`, { headers: authHeaders(accessToken) }),
};
