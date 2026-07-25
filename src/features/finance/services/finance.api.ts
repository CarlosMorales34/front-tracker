import { apiFetch } from '../../../shared/lib/api-client';
import {
  DebtPayment,
  FinanceAnnualIncome,
  FinanceSettings,
  FinanceWeekSummary,
  MoneyEntry,
  MoneyEntryRecurrence,
  MoneyEntryType,
  SavingsEntry,
} from '../types/finance.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const financeApi = {
  getSettings: (accessToken?: string | null): Promise<FinanceSettings> =>
    apiFetch<FinanceSettings>('/api/finance/settings', { headers: authHeaders(accessToken) }),

  updateSettings: (input: Partial<FinanceSettings>, accessToken?: string | null): Promise<FinanceSettings> =>
    apiFetch<FinanceSettings>('/api/finance/settings', {
      method: 'PUT',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  getWeekSummary: (weekStartDate: string, accessToken?: string | null): Promise<FinanceWeekSummary> =>
    apiFetch<FinanceWeekSummary>(`/api/finance/weeks/${weekStartDate}`, { headers: authHeaders(accessToken) }),

  createEntry: (
    type: MoneyEntryType,
    name: string,
    amount: number,
    recurrence: MoneyEntryRecurrence,
    weekStartDate: string,
    accessToken?: string | null
  ): Promise<MoneyEntry> =>
    apiFetch<MoneyEntry>('/api/finance/entries', {
      method: 'POST',
      body: JSON.stringify({ type, name, amount, recurrence, weekStartDate }),
      headers: authHeaders(accessToken),
    }),

  updateEntry: (
    id: string,
    input: { name?: string; amount?: number; recurrence?: MoneyEntryRecurrence },
    accessToken?: string | null
  ): Promise<MoneyEntry> =>
    apiFetch<MoneyEntry>(`/api/finance/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: authHeaders(accessToken),
    }),

  deleteEntry: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/finance/entries/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  addDebtPayment: (weekStartDate: string, amount: number, accessToken?: string | null): Promise<DebtPayment> =>
    apiFetch<DebtPayment>('/api/finance/debt-payments', {
      method: 'POST',
      body: JSON.stringify({ weekStartDate, amount }),
      headers: authHeaders(accessToken),
    }),

  addSavings: (weekStartDate: string, amount: number, accessToken?: string | null): Promise<SavingsEntry> =>
    apiFetch<SavingsEntry>('/api/finance/savings', {
      method: 'POST',
      body: JSON.stringify({ weekStartDate, amount }),
      headers: authHeaders(accessToken),
    }),

  getAnnualIncome: (accessToken?: string | null): Promise<FinanceAnnualIncome[]> =>
    apiFetch<FinanceAnnualIncome[]>('/api/finance/annual-income', { headers: authHeaders(accessToken) }),

  putAnnualIncome: (year: number, amount: number, accessToken?: string | null): Promise<{ id: string; year: number; amount: number }> =>
    apiFetch<{ id: string; year: number; amount: number }>('/api/finance/annual-income', {
      method: 'PUT',
      body: JSON.stringify({ year, amount }),
      headers: authHeaders(accessToken),
    }),

  deleteAnnualIncome: (id: string, accessToken?: string | null): Promise<void> =>
    apiFetch<void>(`/api/finance/annual-income/${id}`, { method: 'DELETE', headers: authHeaders(accessToken) }),

  setWallet: (balance: number, accessToken?: string | null): Promise<FinanceSettings> =>
    apiFetch<FinanceSettings>('/api/finance/wallet', {
      method: 'PUT',
      body: JSON.stringify({ balance }),
      headers: authHeaders(accessToken),
    }),
};
