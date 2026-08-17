export const DIV = 'div';
export const BUTTON = 'button';
export const P = 'p';
export const SPAN = 'span';
export const SVG = 'svg';
export const LINE = 'line';
export const CIRCLE = 'circle';
export const BR = '<br>';
export const TRANSITION = 'transition';
export const TRANSFORM = 'transform';
export const INNER_HTML = 'innerHTML';
export const EVENT_CLICK = 'click';
export const EVENT_MOUSE_OVER = 'mouseover';
export const EVENT_DRAG_START = 'dragstart';
export const EVENT_DRAG_END = 'dragend';
export const EVENT_DRAG_OVER = 'dragover';
export const EVENT_DRAG_LEAVE = 'dragleave';
export const EVENT_DROP = 'drop';
export const DRAGGABLE = 'draggable';
export const SVG_NS = 'http://www.w3.org/2000/svg';

export const getDocumentBody = () => {
  return document.body;
};

export const getGameRoot = () => {
  return getElementById('game');
};

export const setStyle = (
  element: HTMLElement,
  styles: Record<string, string>
) => {
  for (const k in styles) {
    element.style.setProperty(k, styles[k]);
  }
};

export const createElement = (
  tag: string,
  attributes: Record<string, string> = {},
  children: HTMLElement[] = []
) => {
  const element = document.createElement(tag);
  for (const k in attributes) {
    if (k === INNER_HTML) {
      element.innerHTML = attributes[k];
    } else {
      element.setAttribute(k, attributes[k]);
    }
  }
  for (const child of children) {
    element.appendChild(child);
  }
  return element;
};

export const createSvgElement = (
  tag: string,
  attributes: Record<string, string> = {},
  children: SVGElement[] = []
) => {
  const element = document.createElementNS(SVG_NS, tag);
  for (const k in attributes) {
    element.setAttribute(k, attributes[k]);
  }
  for (const child of children) {
    element.appendChild(child);
  }
  return element;
};

export const appendChild = (parent: HTMLElement, child: HTMLElement) => {
  parent.appendChild(child);
};

export const prependChild = (parent: HTMLElement, child: HTMLElement) => {
  parent.prepend(child);
};

export const removeChild = (parent: HTMLElement, child: HTMLElement) => {
  parent.removeChild(child);
};

export const clearChildren = (parent: HTMLElement) => {
  parent[INNER_HTML] = '';
};

export const getElementById = (id: string) => {
  return document.getElementById(id);
};

export const getElementsByClassName = (className: string) => {
  return document.getElementsByClassName(className);
};

export const domAddEventListener = (
  element: HTMLElement,
  event: string,
  listener: (event: Event) => void
) => {
  element.addEventListener(event, listener);
};

export const domRemoveEventListener = (
  element: HTMLElement,
  event: string,
  listener: (event: Event) => void
) => {
  element.removeEventListener(event, listener);
};

export const setAttribute = (
  element: HTMLElement,
  attribute: string,
  value: string
) => {
  element.setAttribute(attribute, value);
};

export const removeAttribute = (element: HTMLElement, attribute: string) => {
  element.removeAttribute(attribute);
};

export const hasAttribute = (element: HTMLElement, attribute: string) => {
  return element.hasAttribute(attribute);
};

export const preventDefault = (event: Event) => {
  event.preventDefault();
};
export const nextTick = (callback: () => void) => {
  timeoutPromise(1).then(callback);
};

export const timeoutPromise = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export function copyObject<T>(obj: T): T {
  return structuredClone(obj);
}
