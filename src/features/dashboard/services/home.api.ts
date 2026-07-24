import { apiFetch } from '../../../shared/lib/api-client';
import { DashboardData } from '../types/dashboard.types';

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

interface HomeSummaryDto {
  streak: { days: number; hasData: boolean };
  productivity: { percent: number | null; hasData: boolean };
  categoryHours: { categoryId: string; name: string; color: string; hours: number }[];
  monthlyBalance: { amount: number; income: number; expenses: number; hasData: boolean };
  currentWeight: { kg: number | null; goalKg: number; hasData: boolean };
  annualBalance: {
    year: number;
    amount: number;
    growthPercentVsPreviousYear: number | null;
    byYear: { year: number; amount: number }[];
    hasData: boolean;
  };
}

export const homeApi = {
  getSummary: async (accessToken?: string | null): Promise<DashboardData> => {
    const dto = await apiFetch<HomeSummaryDto>('/api/home/summary', { headers: authHeaders(accessToken) });
    return {
      streakDays: dto.streak.days,
      streakHasData: dto.streak.hasData,
      productivityPercent: dto.productivity.percent,
      productivityHasData: dto.productivity.hasData,
      categoryHours: dto.categoryHours,
      monthlyBalance: dto.monthlyBalance,
      monthlyBalanceHasData: dto.monthlyBalance.hasData,
      currentWeightKg: dto.currentWeight.kg,
      weightGoalKg: dto.currentWeight.goalKg,
      currentWeightHasData: dto.currentWeight.hasData,
      annualBalance: dto.annualBalance,
      annualBalanceHasData: dto.annualBalance.hasData,
    };
  },
};
