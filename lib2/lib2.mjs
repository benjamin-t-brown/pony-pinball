import { getLib } from './lib2/lib.mjs';
import { main } from './lib2/main.mjs';
export { LibInput } from './lib2/input.mjs';

/**
 * Initializes and starts the game library with the provided arguments.
 *
 * @param {any} args - Initialization options
 * @returns {import('./lib2/lib.mjs').Lib} An instance of Lib.
 */
export const startLib2 = (
  args = {
    init: (...args) => {},
    start: (...args) => {},
    end: (...args) => {},
    controls: {
      dpadLayout: 'normal',
      buttonsLayout: 'ab',
    },
  }
) => {
  main(args);
  return getLib();
};
