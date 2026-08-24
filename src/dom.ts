export const DIV = 'div';
export const SVG = 'svg';
export const LINE = 'line';
export const CIRCLE = 'circle';
export const BR = '<br>';
export const TRANSFORM = 'transform';
export const INNER_HTML = 'innerHTML';
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const POINTER_EVENTS = 'pointer-events';

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

export const removeChild = (parent: HTMLElement, child: HTMLElement) => {
  parent.removeChild(child);
};

export const getElementById = (id: string) => {
  return document.getElementById(id);
};

export const domAddEventListener = (
  element: HTMLElement,
  event: string,
  listener: (event: Event) => void
) => {
  element.addEventListener(event, listener);
};

export const setAttribute = (
  element: HTMLElement,
  attribute: string,
  value: string
) => {
  element.setAttribute(attribute, value);
};

export const px = (n: number) => {
  return n + 'px';
};

export const stringify = (n: number) => {
  return n + '';
};
