import { Collectable } from '../model/parts/Collectable';
import { Decoration } from '../model/parts/Decoration';
import { Field } from '../model/parts/Field';
import { Launcher } from '../model/parts/Launcher';
import { Obstacle } from '../model/parts/Obstacle';
import { Paddle } from '../model/parts/Paddle';
import { Portal } from '../model/parts/Portal';
import type { Part } from '../model/Part';
import { PartElement } from './PartElement';
import type { UiElement } from './UiElement';
import { CollectableElement } from './parts/CollectableElement';
import { DecorationElement } from './parts/DecorationElement';
import { FieldElement } from './parts/FieldElement';
import { LauncherElement } from './parts/LauncherElement';
import { ObstacleElement } from './parts/ObstacleElement';
import { PaddleElement } from './parts/PaddleElement';
import { PortalElement } from './parts/PortalElement';

/** Pick the view class for a part. Add a branch here when you add a kind. */
export const createPartElement = (
  part: Part,
  parent?: UiElement
): PartElement => {
  if (part instanceof Portal) {
    return new PortalElement(part, parent);
  }
  if (part instanceof Collectable) {
    return new CollectableElement(part, parent);
  }
  if (part instanceof Decoration) {
    return new DecorationElement(part, parent);
  }
  if (part instanceof Field) {
    return new FieldElement(part, parent);
  }
  if (part instanceof Paddle) {
    return new PaddleElement(part, parent);
  }
  if (part instanceof Launcher) {
    return new LauncherElement(part, parent);
  }
  if (part instanceof Obstacle) {
    return new ObstacleElement(part, parent);
  }
  return new PartElement(part, parent);
};
