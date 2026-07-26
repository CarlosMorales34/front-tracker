// Helpers para los `fallbackAction` de los tours interactivos: simulan la
// acción real que un paso pide (clic en un botón, o llenar+enviar un
// formulario) cuando el usuario le da "Siguiente" sin haberla hecho.

function setNativeInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// Espera a que React procese el `onChange` disparado por setNativeInputValue
// y re-renderice antes de enviar el formulario -- si no, el handler de
// submit todavía tiene el closure con el valor viejo (vacío). Usa setTimeout
// en vez de requestAnimationFrame: rAF se pausa por completo en pestañas que
// no están en foco (background tabs), lo que dejaría este await colgado para
// siempre en ese caso; setTimeout no depende de que la pestaña esté visible.
function waitForReactFlush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50));
}

export function clickTarget(selector: string): void {
  document.querySelector<HTMLElement>(selector)?.click();
}

// Marca el <form> real en el DOM (no un flag en memoria de JS) para bloquear
// envíos duplicados. React StrictMode (dev) puede invocar el `before` hook
// de un mismo step dos veces, una después de que la primera ya arrancó su
// petición pero antes de que el modal se cierre -- un guard en memoria de
// módulo no alcanza a cubrir esa ventana porque cada antes-hook puede vivir
// en su propia instancia del módulo. El atributo en el DOM es único sin
// importar cuántas instancias de JS lo escriban.
const SUBMIT_LOCK_ATTR = 'data-tour-submitting';

export async function fillNameAndSubmit(
  formSelector: string,
  nameInputSelector: string,
  defaultName: string,
  // Los formularios de ingreso/gasto también tienen un campo de monto que el
  // backend valida como positivo (`amount: z.number().positive()`) -- dejarlo
  // en 0 (su valor por default) hace que el submit falle en silencio y el
  // recorrido se quede esperando un target que nunca llega. Si se pasan estos
  // dos parámetros, se rellena también con un default > 0 cuando esté vacío.
  amountInputSelector?: string,
  defaultAmount?: string,
): Promise<void> {
  const form = document.querySelector<HTMLFormElement>(formSelector);
  const nameInput = document.querySelector<HTMLInputElement>(nameInputSelector);
  if (!form || !nameInput) return;
  if (form.hasAttribute(SUBMIT_LOCK_ATTR)) return;
  form.setAttribute(SUBMIT_LOCK_ATTR, 'true');

  let changed = false;

  if (!nameInput.value.trim()) {
    setNativeInputValue(nameInput, defaultName);
    changed = true;
  }

  if (amountInputSelector && defaultAmount) {
    const amountInput = document.querySelector<HTMLInputElement>(amountInputSelector);
    if (amountInput && !(Number(amountInput.value) > 0)) {
      setNativeInputValue(amountInput, defaultAmount);
      changed = true;
    }
  }

  if (changed) {
    await waitForReactFlush();
  }

  form.requestSubmit();
}
