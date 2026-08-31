export abstract class UiElement {
  parent: UiElement | null = null;
  children: UiElement[] = [];
  el: HTMLElement | null = null;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  isHovered = false;
  isClicked = false;
  shouldPropagateEventsToChildren = true;

  constructor(parent?: UiElement) {
    if (parent) {
      parent.addChild(this);
    }
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getChildHostEl(): HTMLElement | null {
    return this.el;
  }

  removeChildAtIndex(index: number) {
    if (index < 0 || index >= this.children.length) {
      return;
    }
    this.children[index].parent = null;
    this.children.splice(index, 1);
  }

  addChild(child: UiElement) {
    if (child.parent) {
      child.parent.removeChildAtIndex(child.parent.children.indexOf(child));
    }
    child.parent = this;
    this.children.push(child);
  }

  hit(mouseX: number, mouseY: number) {
    return (
      mouseX >= this.x &&
      mouseY >= this.y &&
      mouseX <= this.x + this.width &&
      mouseY <= this.y + this.height
    );
  }

  checkMouseDownEvent(
    mouseX: number,
    mouseY: number,
    button: number,
    shift = false
  ) {
    if (this.shouldPropagateEventsToChildren) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (
          this.children[i].checkMouseDownEvent(mouseX, mouseY, button, shift)
        ) {
          return true;
        }
      }
    }
    if (!this.hit(mouseX, mouseY)) {
      return false;
    }
    this.isClicked = true;
    this.onMouseDown(mouseX, mouseY, button, shift);
    return true;
  }

  checkMouseUpEvent(mouseX: number, mouseY: number, button: number) {
    let handled = false;
    if (this.shouldPropagateEventsToChildren) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].checkMouseUpEvent(mouseX, mouseY, button)) {
          handled = true;
        }
      }
    }
    if (this.isClicked) {
      if (this.hit(mouseX, mouseY)) {
        this.onClick(mouseX, mouseY, button);
        handled = true;
      }
      this.onMouseUp(mouseX, mouseY, button);
      this.isClicked = false;
    }
    return handled;
  }

  checkHoverEvent(mouseX: number, mouseY: number) {
    let handled = false;
    if (this.shouldPropagateEventsToChildren) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].checkHoverEvent(mouseX, mouseY)) {
          handled = true;
        }
      }
    }
    this.isHovered = this.hit(mouseX, mouseY);
    if (this.isHovered) {
      handled = true;
    }
    return handled;
  }

  checkMouseWheelEvent(mouseX: number, mouseY: number, delta: number) {
    if (this.shouldPropagateEventsToChildren) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].checkMouseWheelEvent(mouseX, mouseY, delta)) {
          return true;
        }
      }
    }
    if (!this.hit(mouseX, mouseY)) {
      return false;
    }
    this.onMouseWheel(mouseX, mouseY, delta);
    return true;
  }

  checkResizeEvent(width: number, height: number) {
    for (const child of this.children) {
      child.checkResizeEvent(width, height);
    }
  }

  onMouseDown(_x: number, _y: number, _button: number, _shift = false) {}
  onMouseUp(_x: number, _y: number, _button: number) {}
  onClick(_x: number, _y: number, _button: number) {}
  onMouseWheel(_x: number, _y: number, _delta: number) {}

  build() {
    for (const child of this.children) {
      child.build();
    }
  }

  /** Sim tick. Do not write CSS here. */
  update(_dt: number) {
    for (const child of this.children) {
      child.update(_dt);
    }
  }

  /** Paint from model state. Once per frame. */
  render(dt: number) {
    for (const child of this.children) {
      child.render(dt);
    }
  }
}
