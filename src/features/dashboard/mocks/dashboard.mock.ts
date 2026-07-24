import { DashboardData } from '../types/dashboard.types';

// Datos de ejemplo para poder construir y probar el Home antes de que
// existan las secciones reales (Actividades, Semanal, Finanzas, Gastos,
// Peso). Cuando cada sección tenga su propio endpoint, este mock se
// reemplaza por el fetch correspondiente y se borra este archivo — ver
// features/metrics para el patrón ya usado (services/*.api.ts + tipos).
export const MOCK_DASHBOARD_DATA: DashboardData = {
  greetingName: 'Erwin',
  dateRangeLabel: 'Sáb 8 – Vie 14 feb',
  streakDays: 18,
  productivity: {
    percent: 87,
    goalHours: 112,
    note: '3 días con enfoque sostenido (>2h continuas). La constancia diaria pesa más que los picos aislados.',
  },
  streak: {
    days: 18,
    note: 'Registro consecutivo sin días en blanco — el hábito se sostiene solo mientras no se rompe la cadena.',
  },
  categoryHours: [
    { label: 'Estudios', hours: 11 },
    { label: 'Recreación', hours: 47 },
    { label: 'P. Personal', hours: 3 },
    { label: 'C. Personal', hours: 40 },
  ],
  monthlyBalance: {
    amount: 12114,
    income: 23321,
    expenses: 11207,
  },
  currentWeight: {
    kg: 62.5,
    goalKg: 60,
  },
  annualBalance: {
    amount: 92304,
    growthPercentVsPreviousYear: 18,
    byYear: [
      { year: 2025, amount: 78120 },
      { year: 2024, amount: 61450 },
      { year: 2023, amount: 54900 },
    ],
  },
};
