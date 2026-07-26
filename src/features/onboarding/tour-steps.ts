import { Placement, StepTarget } from 'react-joyride';

export interface TourStepConfig {
  // Si se define, el paso navega a esta ruta antes de mostrarse.
  route?: string;
  target: StepTarget;
  title: string;
  content: string;
  placement?: Placement | 'center';
  // Se ejecuta solo si el target de este paso todavía no existe cuando el
  // usuario le da "Siguiente" -- es decir, si no hizo la acción real (clic
  // en el botón, o llenar+enviar el formulario) que el paso anterior le
  // pedía. Deja al usuario en el mismo lugar a donde habría llegado si
  // hubiera hecho la acción, en vez de dejar el tour colgado esperando un
  // target que nunca va a aparecer.
  fallbackAction?: () => void | Promise<void>;
}

const DESKTOP_BREAKPOINT = '(min-width: 900px)';

// El Sidebar (desktop) y el BottomTabBar (mobile) renderizan los mismos
// NAV_ITEMS con el mismo data-tour, pero solo uno es visible según CSS
// (ver Sidebar.module.css / BottomTabBar.module.css, breakpoint 900px) --
// ambos quedan en el DOM. Se resuelve en cada llamada (no una vez al armar
// los steps) para que funcione bien si el usuario rota o resize.
function navTarget(href: string): () => HTMLElement | null {
  return () => {
    const isDesktop = window.matchMedia(DESKTOP_BREAKPOINT).matches;
    const scope = isDesktop ? 'desktop-nav' : 'mobile-nav';
    const specific = document.querySelector<HTMLElement>(`[data-tour-scope="${scope}"] [data-tour="nav-${href}"]`);
    // Fallback: Ajustes no vive en la tab bar mobile todavía (solo en el
    // Sidebar desktop) -- en ese caso se resalta la barra completa en vez
    // de fallar el paso.
    return specific ?? document.querySelector<HTMLElement>(`[data-tour-scope="${scope}"]`);
  };
}

export const TOUR_STEPS: TourStepConfig[] = [
  {
    route: '/dashboard',
    target: 'body',
    placement: 'center',
    title: '¡Bienvenido a Bienestar Integral!',
    content:
      'Esta app te ayuda a llevar seguimiento real de tu productividad, tus finanzas y tu cuerpo — sin adivinar. Te muestro rápido cómo funciona cada sección.',
  },
  {
    target: '[data-tour="dashboard-productivity"]',
    placement: 'bottom',
    title: 'Productividad de la semana',
    content:
      'Aquí ves qué tan productiva ha sido tu semana según las horas que registras en Actividades diarias. Se va llenando conforme registras — al inicio dice "conociéndote" hasta que haya datos suficientes.',
  },
  {
    target: '[data-tour="dashboard-streak"]',
    placement: 'bottom',
    title: 'Racha activa',
    content: 'Cuenta los días seguidos en los que registraste al menos una actividad. Es tu motivación para no cortar la racha.',
  },
  {
    target: '[data-tour="dashboard-category-hours"]',
    placement: 'top',
    title: 'Horas por categoría',
    content:
      'Un desglose de en qué se te va el tiempo, por categoría (ej. Trabajo, Estudio, Ejercicio). Se llena cuando creas categorías y actividades en la siguiente sección.',
  },
  {
    route: '/actividades',
    target: navTarget('/actividades'),
    placement: 'bottom',
    title: 'Actividades diarias',
    content: 'Aquí registras tus rutinas fijas (como Dormir o Trabajar) y las horas de tus actividades por categoría, día a día.',
  },
  {
    target: '[data-tour="activities-toggle"]',
    placement: 'bottom',
    title: 'Hoy / Semana',
    content:
      'Cambia entre el registro de un día específico y la vista semanal, que suma automáticamente tus horas y te compara contra la semana pasada.',
  },
  {
    route: '/semanal',
    target: navTarget('/semanal'),
    placement: 'bottom',
    title: 'Registro semanal',
    content: 'Un espacio para reflexionar sobre cada semana del año y llevar contadores propios (ej. "Libros leídos").',
  },
  {
    target: '[data-tour="weekly-content"]',
    placement: 'center',
    title: 'Tu año, semana por semana',
    content:
      'Navega por cada semana del año, agrega una nota de contexto (ej. si estuviste de vacaciones o enfermo) y lleva contadores personalizados que tú definas.',
  },
  {
    route: '/finanzas',
    target: navTarget('/finanzas'),
    placement: 'bottom',
    title: 'Finanzas',
    content: 'El control de tu dinero: cuánto entra, cuánto sale, y cuánto te queda disponible en tiempo real.',
  },
  {
    target: '[data-tour="finanzas-capital"]',
    placement: 'bottom',
    title: 'Capital: presupuesto y tarjetas',
    content:
      'Tu presupuesto (liquidez) se ajusta solo cuando registras ingresos o gastos — corrígelo a mano si contaste tu dinero real. También llevas tus tarjetas de crédito aquí, para ver tu capital total.',
  },
  {
    route: '/gastos',
    target: navTarget('/gastos'),
    placement: 'bottom',
    title: 'Gastos diarios',
    content: 'Registra tus gastos variables del día a día y tus gastos fijos mensuales (renta, suscripciones, etc.) — alimentan directo a Finanzas.',
  },
  {
    target: '[data-tour="gastos-summary"]',
    placement: 'bottom',
    title: 'Tu resumen del mes',
    content: 'Ingresos, gastos y lo que te sobra este mes, siempre a la vista mientras vas anotando.',
  },
  {
    route: '/peso',
    target: navTarget('/peso'),
    placement: 'bottom',
    title: 'Peso y Entrenamientos',
    content: 'Esta sección lleva tu peso mensual y, en una segunda pestaña, tus sesiones de entrenamiento.',
  },
  {
    target: '[data-tour="peso-toggle"]',
    placement: 'bottom',
    title: 'Registro de peso / Entrenamientos',
    content:
      'En "Registro de peso" llevas tu peso mes a mes con tu meta y tendencia. En "Entrenamientos" registras cada sesión (ejercicios, peso, repeticiones) y ves tu progresión con gráficas.',
  },
  {
    route: '/ajustes',
    target: navTarget('/ajustes'),
    placement: 'bottom',
    title: 'Ajustes',
    content: 'Aquí vas a poder configurar tus preferencias más adelante. Por ahora, desde acá puedes volver a ver este recorrido cuando quieras.',
  },
  {
    target: '[data-tour="onboarding-restart"]',
    placement: 'top',
    title: '¡Listo!',
    content: 'Ya conoces toda la app. Explora, registra tus datos reales, y si quieres repasar este recorrido, dale clic aquí cuando quieras.',
  },
];
