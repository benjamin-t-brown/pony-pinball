import type {
  ILib2,
  ILib2StartArgs,
} from './lib2.types';
import type { LibInput as ILibInput } from './lib2/lib';

/** Instance returned by `startLib2`. Adds methods that live on `Lib` but not `ILib2`. */
export type Lib2 = ILib2 & {
  modulePostRunFromJs(): void;
  setupKeyboardEvents(): void;
};

/** `input.mjs` documents `none`; `lib2.types.ts` has not caught up. */
export type Lib2StartArgs = Omit<ILib2StartArgs, 'controls'> & {
  controls: {
    dpadLayout: ILib2StartArgs['controls']['dpadLayout'] | 'none';
    buttonsLayout: ILib2StartArgs['controls']['buttonsLayout'];
  };
};

export function startLib2(args: Lib2StartArgs): Lib2;
export const LibInput: ILibInput;
