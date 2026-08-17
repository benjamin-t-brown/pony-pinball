export abstract class UiElement {
  parent: UiElement | null = null;
  children: UiElement[] = [];
  el: HTMLElement | null = null;
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  scale = 1;
  id = '';
  isHovered = false;
  isClicked = false;
  shouldPropagateEventsToChildren = true;

  constructor(parent?: UiElement) {
    if (parent) {
      parent.addChild(this);
    }
  }

  getChildById(id: string): UiElement | null {
    if (this.id === id) {
      return this;
    }
    for (const child of this.children) {
      const found = child.getChildById(id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  removeChildById(id: string) {
    const child = this.getChildById(id);
    if (!child || !child.parent) {
      return;
    }
    child.parent.removeChildAtIndex(child.parent.children.indexOf(child));
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  getPos(): [number, number] {
    return [this.x, this.y];
  }

  getDims(): [number, number] {
    return [this.width * this.scale, this.height * this.scale];
  }

  setId(id: string) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
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
    const [width, height] = this.getDims();
    return (
      mouseX >= this.x &&
      mouseY >= this.y &&
      mouseX <= this.x + width &&
      mouseY <= this.y + height
    );
  }

  checkMouseDownEvent(mouseX: number, mouseY: number, button: number) {
    if (this.shouldPropagateEventsToChildren) {
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (this.children[i].checkMouseDownEvent(mouseX, mouseY, button)) {
          return true;
        }
      }
    }
    if (!this.hit(mouseX, mouseY)) {
      return false;
    }
    this.isClicked = true;
    this.onMouseDown(mouseX, mouseY, button);
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

  onMouseDown(_x: number, _y: number, _button: number) {}
  onMouseUp(_x: number, _y: number, _button: number) {}
  onClick(_x: number, _y: number, _button: number) {}
  onMouseWheel(_x: number, _y: number, _delta: number) {}

  build() {
    for (const child of this.children) {
      child.build();
    }
  }

  update(_dt: number) {
    for (const child of this.children) {
      child.update(_dt);
    }
  }

  render(dt: number) {
    for (const child of this.children) {
      child.render(dt);
    }
  }
}
