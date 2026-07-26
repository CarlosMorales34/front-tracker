import { clickTarget, fillNameAndSubmit } from './tour-actions';
import { TourStepConfig } from './tour-steps';

// Estos dos recorridos son "manos a la obra": el usuario hace clic en el
// botón real, llena el formulario real y lo envía -- Joyride no puede
// hacerlo por él. Cada paso "espera" (via el `before` hook, ver
// OnboardingProvider) a que el elemento del PASO SIGUIENTE exista antes de
// mostrarlo, así el recorrido se pausa de forma natural hasta que el usuario
// complete la acción, en vez de asumir que ya lo hizo.
export const CATEGORY_TOUR_STEPS: TourStepConfig[] = [
  {
    route: '/actividades',
    target: '[data-tour="activities-new-category-button"]',
    placement: 'top',
    title: 'Crea tu primera categoría',
    content: 'Dale clic en este botón para abrir el formulario. Cuando lo tengas abierto, dale Siguiente.',
  },
  {
    target: '[data-tour="category-modal-form"]',
    placement: 'bottom',
    title: 'Nombra tu categoría',
    content:
      'Escribe un nombre (ej. "Estudio" o "Ejercicio") y elige un color. Dale clic en "Crear categoría" y luego en Siguiente.',
    fallbackAction: () => clickTarget('[data-tour="activities-new-category-button"]'),
  },
  {
    target: '[data-tour="activities-add-activity-button"]',
    placement: 'top',
    title: '¡Ya tienes tu primera categoría!',
    content: 'Ahora dale clic en "+ Nueva actividad" para agregar tu primera actividad dentro de ella.',
    fallbackAction: () =>
      fillNameAndSubmit('[data-tour="category-modal-form"]', '[data-tour="category-name-input"]', 'Mi categoría'),
  },
  {
    target: '[data-tour="activity-modal-form"]',
    placement: 'bottom',
    title: 'Nombra tu actividad',
    content: 'Escribe un nombre (ej. "Leer" o "Meditar"), dale clic en "Crear actividad" y luego en Siguiente.',
    fallbackAction: () => clickTarget('[data-tour="activities-add-activity-button"]'),
  },
  {
    target: '[data-tour="activities-activity-row"]',
    placement: 'bottom',
    title: '¡Listo!',
    content: 'Ya registraste tu primera categoría y tu primera actividad. A partir de aquí puedes registrar horas cada día.',
    fallbackAction: () =>
      fillNameAndSubmit('[data-tour="activity-modal-form"]', '[data-tour="activity-name-input"]', 'Mi actividad'),
  },
];

export const EXPENSES_TOUR_STEPS: TourStepConfig[] = [
  {
    route: '/finanzas',
    target: '[data-tour="finanzas-new-income-button"]',
    placement: 'left',
    title: 'Registra tu primer sueldo',
    content: 'Dale clic en este botón para abrir el formulario de ingresos.',
  },
  {
    target: '[data-tour="money-modal-form"]',
    placement: 'bottom',
    title: 'Agrega tu ingreso',
    content:
      'Escribe el concepto (ej. "Sueldo"), el monto y cada cuánto lo recibes. Dale clic en "Agregar" y luego en Siguiente.',
    fallbackAction: () => clickTarget('[data-tour="finanzas-new-income-button"]'),
  },
  {
    target: '[data-tour="finanzas-income-row"]',
    placement: 'bottom',
    title: '¡Ingreso registrado!',
    content: 'Ahora vamos a Gastos diarios para registrar tu primer gasto.',
    fallbackAction: () =>
      fillNameAndSubmit(
        '[data-tour="money-modal-form"]',
        '[data-tour="money-name-input"]',
        'Mi sueldo',
        '[data-tour="money-amount-input"]',
        '15000',
      ),
  },
  {
    route: '/gastos',
    target: '[data-tour="gastos-new-daily-button"]',
    placement: 'left',
    title: 'Registra tu primer gasto',
    content: 'Dale clic en este botón para abrir el formulario de gastos del día.',
  },
  {
    target: '[data-tour="expense-modal-form"]',
    placement: 'bottom',
    title: 'Agrega tu gasto',
    content: 'Escribe el concepto y el monto, dale clic en "Agregar" y luego en Siguiente.',
    fallbackAction: () => clickTarget('[data-tour="gastos-new-daily-button"]'),
  },
  {
    target: '[data-tour="gastos-daily-row"]',
    placement: 'bottom',
    title: '¡Listo!',
    content: 'Ya tienes tu primer ingreso y tu primer gasto registrados. Así vas a llevar tus finanzas día a día.',
    fallbackAction: () =>
      fillNameAndSubmit(
        '[data-tour="expense-modal-form"]',
        '[data-tour="expense-name-input"]',
        'Café',
        '[data-tour="expense-amount-input"]',
        '50',
      ),
  },
];
