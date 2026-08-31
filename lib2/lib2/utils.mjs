export const getElementById = id => {
  return /** @type {HTMLElement} */ (document.getElementById(id));
};

export const getCanvas = () => {
  return /** @type {HTMLCanvasElement} */ (getElementById('canvas'));
};

/** Same gated methods as `src/view/console.ts` `disableConsole`. */
const GATED_METHODS = new Set(['log', 'error', 'warn', 'debug']);

let lib2ConsoleLoggingEnabled = false;
const nativeConsole = console;

/** When enabled, `console.log` / `error` / `warn` / `debug` behave like the native methods. */
export const enableConsole = () => {
  lib2ConsoleLoggingEnabled = true;
};

/** No-ops for gated methods until `enableConsole()` is called again. */
export const disableConsole = () => {
  lib2ConsoleLoggingEnabled = false;
};
