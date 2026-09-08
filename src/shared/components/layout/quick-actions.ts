import { ComponentType, SVGProps } from 'react';
import { BarbellIcon, ChecklistIcon, ReceiptIcon, ScaleIcon } from '../icons/icons';
import { NavDomain } from './nav-items';

export interface QuickAction {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  domain: NavDomain;
}

// Las 4 acciones de creación/registro que ya existen en la app, reutilizadas
// tal cual -- mismas rutas y modales que cada módulo ya usa desde su propio
// botón "+". "Actividad" solo navega (sin query param) porque crear una
// actividad exige elegir categoría primero, algo que ya vive dentro de
// ActivitiesView y no tiene un equivalente "sin contexto" que reutilizar sin
// inventar un flujo nuevo. Los otros 3 sí soportan abrir su modal de
// inmediato vía `?crear=...`, que cada vista lee al montar (ver
// ExpensesView, BodyProgressView, TrainingView).
export const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'actividad',
    label: 'Actividad',
    description: 'Planificar o completar',
    href: '/actividades',
    icon: ChecklistIcon,
    domain: 'activities',
  },
  {
    key: 'gasto',
    label: 'Gasto',
    description: 'Registrar movimiento',
    href: '/gastos?crear=gasto',
    icon: ReceiptIcon,
    domain: 'finance',
  },
  {
    key: 'peso',
    label: 'Peso',
    description: 'Nueva medición',
    href: '/salud/progreso?crear=peso',
    icon: ScaleIcon,
    domain: 'health',
  },
  {
    key: 'entrenamiento',
    label: 'Entrenamiento',
    description: 'Iniciar sesión',
    href: '/salud/entrenamientos?crear=entrenamiento',
    icon: BarbellIcon,
    domain: 'health',
  },
];

export function filterQuickActionsByModules(
  actions: QuickAction[],
  modules: { hasActivities: boolean; hasFinance: boolean; hasHealth: boolean } | null,
): QuickAction[] {
  if (!modules) return actions;
  return actions.filter((action) => {
    if (action.domain === 'activities') return modules.hasActivities;
    if (action.domain === 'finance') return modules.hasFinance;
    return modules.hasHealth;
  });
}
