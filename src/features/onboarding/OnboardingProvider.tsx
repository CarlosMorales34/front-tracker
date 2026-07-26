'use client';

import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { EventData, Joyride, Locale, STATUS, Step, StepTarget } from 'react-joyride';
import { useAuth } from '../auth/context/AuthContext';
import { CATEGORY_TOUR_STEPS, EXPENSES_TOUR_STEPS } from './action-tour-steps';
import { TOUR_STEPS, TourStepConfig } from './tour-steps';
import { TourPromptModal } from './TourPromptModal';

const STORAGE_KEY = 'vitalis_onboarding_completed';

type Phase = 'idle' | 'welcome' | 'category-prompt' | 'category-tour' | 'expenses-prompt' | 'expenses-tour';

const ES_LOCALE: Locale = {
  back: 'Atrás',
  close: 'Cerrar',
  last: 'Listo',
  next: 'Siguiente',
  nextWithProgress: 'Siguiente ({current} de {total})',
  skip: 'Saltar',
};

interface OnboardingContextValue {
  restart: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>');
  return ctx;
}

function resolveTarget(target: StepTarget): HTMLElement | null {
  if (typeof target === 'function') return target();
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  return null;
}

// React StrictMode (activo en dev) monta cada <Joyride> dos veces, y ambas
// instancias llaman a `before` para el mismo step -- sin esto, dos llamadas
// concurrentes a `fallbackAction` corren en paralelo (ej. dos requestSubmit
// casi simultáneos sobre el mismo formulario), y ninguna llega a completar
// limpiamente. Se identifica el paso en curso por su target (string), así
// que una segunda invocación para el mismo target reutiliza la promesa de
// la primera en vez de repetir la acción.
const fallbacksInFlight = new Map<string, Promise<void>>();

async function runFallbackOnce(target: StepTarget, action: () => void | Promise<void>): Promise<void> {
  const key = typeof target === 'string' ? target : 'fn';
  const existing = fallbacksInFlight.get(key);
  if (existing) return existing;

  const promise = Promise.resolve()
    .then(() => action())
    .finally(() => {
      fallbacksInFlight.delete(key);
    });
  fallbacksInFlight.set(key, promise);
  return promise;
}

// Sondea hasta que el target del step exista en el DOM (o se acabe el
// tiempo) -- usado en el hook `before` de cada step. Sirve tanto para
// esperar una navegación de ruta como para esperar a que el usuario
// complete una acción real (crear categoría, enviar un formulario, etc.),
// ya que en ambos casos el elemento del siguiente step no existe todavía
// cuando Joyride intenta mostrarlo. Usa setInterval en vez de
// requestAnimationFrame: rAF se pausa por completo en pestañas sin foco, lo
// que dejaría este polling colgado indefinidamente en ese caso.
function waitForTarget(target: StepTarget, timeoutMs = 8000): Promise<void> {
  if (target === 'body') return Promise.resolve();
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (resolveTarget(target) || Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

function buildSteps(configs: TourStepConfig[], router: ReturnType<typeof useRouter>, interactive = false): Step[] {
  return configs.map((config) => ({
    target: config.target,
    title: config.title,
    content: config.content,
    placement: config.placement,
    skipBeacon: true,
    // Los tours de acción (crear categoría/actividad/ingreso/gasto) necesitan
    // que el clic real llegue al botón/input resaltado -- si no, el overlay
    // de Joyride lo absorbe y el usuario nunca puede completar la acción. El
    // tour informativo no lo necesita (solo se mira, no se interactúa).
    spotlightClicks: interactive,
    before: async () => {
      if (config.route && window.location.pathname !== config.route) {
        router.push(config.route);
      }
      // Si el usuario le dio "Siguiente" sin hacer la acción real que pedía
      // el paso anterior (clic en un botón, o llenar+enviar un formulario),
      // el target de este paso todavía no existe. En vez de quedarse
      // esperando algo que nunca va a aparecer, `fallbackAction` hace esa
      // acción por él -- el resultado es el mismo que si la hubiera hecho.
      // Se deduplica con runFallbackOnce porque React StrictMode (solo en
      // dev) monta cada Joyride dos veces, y ambas instancias llamarían a
      // `before` para el mismo step.
      if (config.fallbackAction && !resolveTarget(config.target)) {
        await runFallbackOnce(config.target, config.fallbackAction);
      }
      await waitForTarget(config.target);
    },
  }));
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (!user) return;
    const completed = window.localStorage.getItem(STORAGE_KEY);
    if (!completed) setPhase('welcome');
  }, [user]);

  const restart = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    router.push('/dashboard');
    setPhase('welcome');
  }, [router]);

  const finishOnboarding = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setPhase('idle');
  }, []);

  const welcomeSteps = useMemo(() => buildSteps(TOUR_STEPS, router), [router]);
  const categorySteps = useMemo(() => buildSteps(CATEGORY_TOUR_STEPS, router, true), [router]);
  const expensesSteps = useMemo(() => buildSteps(EXPENSES_TOUR_STEPS, router, true), [router]);

  const activeSteps =
    phase === 'welcome' ? welcomeSteps : phase === 'category-tour' ? categorySteps : phase === 'expenses-tour' ? expensesSteps : [];
  const isJoyrideRunning = phase === 'welcome' || phase === 'category-tour' || phase === 'expenses-tour';

  const handleEvent = useCallback(
    (data: EventData) => {
      if (data.status !== STATUS.FINISHED && data.status !== STATUS.SKIPPED) return;
      if (phase === 'welcome') setPhase('category-prompt');
      else if (phase === 'category-tour') setPhase('expenses-prompt');
      else if (phase === 'expenses-tour') finishOnboarding();
    },
    [phase, finishOnboarding],
  );

  const value = useMemo<OnboardingContextValue>(() => ({ restart }), [restart]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}

      {user && isJoyrideRunning && (
        <Joyride
          run={isJoyrideRunning}
          steps={activeSteps}
          continuous
          scrollToFirstStep
          onEvent={handleEvent}
          locale={ES_LOCALE}
          options={{
            arrowColor: 'var(--color-bg-elevated)',
            backgroundColor: 'var(--color-bg-elevated)',
            primaryColor: 'var(--color-accent)',
            textColor: 'var(--color-text)',
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
            showProgress: true,
            buttons: ['back', 'skip', 'primary'],
            targetWaitTimeout: 8000,
            // Por default un clic en el overlay (fuera del spotlight) cierra
            // todo el recorrido. En los tours interactivos el usuario hace
            // clic cerca de botones reales -- un pixel fuera del cutout no
            // debe terminar el onboarding completo, solo "Saltar"/"Siguiente".
            overlayClickAction: false,
          }}
          styles={{
            tooltip: { borderRadius: 12, fontSize: '0.9rem' },
            tooltipTitle: { fontSize: '1.05rem', fontWeight: 700 },
            buttonPrimary: { color: 'var(--color-accent-contrast)', borderRadius: 8 },
            buttonBack: { color: 'var(--color-text-secondary)' },
            buttonSkip: { color: 'var(--color-text-secondary)' },
          }}
        />
      )}

      {user && phase === 'category-prompt' && (
        <TourPromptModal
          title="Tutorial: primera categoría"
          description="¿Quieres que te guiemos para crear tu primera categoría y tu primera actividad? Toma menos de un minuto."
          acceptLabel="Sí, vamos"
          onAccept={() => setPhase('category-tour')}
          onSkip={() => setPhase('expenses-prompt')}
        />
      )}

      {user && phase === 'expenses-prompt' && (
        <TourPromptModal
          title="Tutorial: primeros gastos"
          description="¿Quieres que te guiemos para registrar tu primer sueldo y tu primer gasto? Así vas viendo cómo Finanzas y Gastos se conectan."
          acceptLabel="Sí, vamos"
          onAccept={() => setPhase('expenses-tour')}
          onSkip={finishOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  );
}
