import { MapData } from './tiles';
import { TileType, getTileColor } from './tiles';

class CssAssembly {
  element: HTMLElement;
  children: CssAssembly[];

  constructor() {
    this.element = document.createElement('div');
    this.children = [];
  }

  addChild(child: CssAssembly) {
    this.children.push(child);
    this.element.appendChild(child.element);
  }

  assemble() {
    for (const child of this.children) {
      child.assemble();
    }
    return this.element;
  }
}

export class Scene extends CssAssembly {
  // outerContainer: HTMLElement;

  rotationDegOuter: number = 45;
  xOffset: number = 0;
  yOffset: number = 0;
  scale: number = 1;
  width: number;
  height: number;

  constructor() {
    super();
    this.element = document.createElement('div');
    this.element.id = 'scene-outer';
    Object.assign(this.element.style, {
      position: 'relative',
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center',
      perspective: '600px',
    });
    this.assemble();
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.assemble();
  }

  pan(deltaX: number, deltaY: number): void {
    this.xOffset -= deltaX;
    this.yOffset -= deltaY;
    console.log('pan', this.xOffset, this.yOffset);
    this.updateTransform();
  }

  zoom(delta: number): void {
    this.scale = Math.max(0.1, Math.min(5, this.scale + delta));
    this.updateTransform();
  }

  setZoom(zoom: number): void {
    this.scale = Math.max(0.1, Math.min(5, zoom));
    this.updateTransform();
  }

  updateTransform() {
    const str = `rotateX(${this.rotationDegOuter}deg) translate(${this.xOffset}px, ${this.yOffset}px) scale(${this.scale})`;
    console.log('transform', str, this, this.scale);
    Object.assign(this.element.style, {
      transform: str,
    });
  }

  assemble() {
    super.assemble();
    this.updateTransform();
    return this.element;
  }
}

class IsoMap extends CssAssembly {
  w: number;
  h: number;
  rotationDeg = 45;

  constructor(w: number, h: number) {
    super();
    this.element = document.createElement('div');
    this.element.id = 'map';
    Object.assign(this.element.style, {
      position: 'relative',
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center',
    });
    this.w = w;
    this.h = h;
    this.assemble();
  }

  assemble() {
    super.assemble();
    Object.assign(this.element.style, {
      width: `${this.w}px`,
      height: `${this.h}px`,
      transform: `rotate(${this.rotationDeg}deg)`,
    });
    return this.element;
  }
}

class Plane extends CssAssembly {
  x: number;
  y: number;
  w: number;
  h: number;
  xDeg: number;
  yDeg: number;
  zDeg: number;
  color: string;

  constructor(x: number, y: number, w: number, h: number) {
    super();
    this.element = document.createElement('div');
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xDeg = 0;
    this.yDeg = 0;
    this.zDeg = 0;
    this.color = 'orange';
    this.assemble();
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.assemble();
  }

  setSize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.assemble();
  }

  setColor(color: string) {
    this.color = color;
    this.assemble();
  }

  setRotation(xDeg: number, yDeg: number, zDeg: number) {
    this.xDeg = xDeg;
    this.yDeg = yDeg;
    this.zDeg = zDeg;
    this.assemble();
  }

  assemble() {
    super.assemble();
    Object.assign(this.element.style, {
      position: 'absolute',
      backgroundColor: this.color,
      left: `${this.x}px`,
      top: `${this.y}px`,
      width: `${this.w}px`,
      height: `${this.h}px`,
      transform: `rotateX(${this.xDeg}deg) rotateY(${this.yDeg}deg) rotateZ(${this.zDeg}deg)`,
    });
    return this.element;
  }
}

export function renderMap(container: HTMLElement, map: MapData): Scene {
  // Clear container
  container.innerHTML = '';

  const scene = new Scene();
  scene.setSize(map.width * 32, map.height * 32);
  const isoMap = new IsoMap(map.width * 33, map.height * 33);

  // const sceneContainer = document.createElement('div');
  // sceneContainer.className = 'scene-container';
  // sceneContainer.style.transform = 'rotateX(45deg)';
  // // sceneContainer.style.width = `${map.width * 32}px`;
  // // sceneContainer.style.height = `${map.height * 32}px`;
  // // sceneContainer.style.transform = 'rotate(45deg)';

  // // Create the map container
  // const mapContainer = document.createElement('div');
  // mapContainer.className = 'isometric-map';
  // mapContainer.style.width = `${map.width * 33}px`;
  // mapContainer.style.height = `${map.height * 33}px`;
  // mapContainer.style.transform = 'rotate(45deg)';

  // Create tiles
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const tileIndex = y * map.width + x;
      const tile = map.tiles[tileIndex];

      // Skip NONE tiles
      if (tile === TileType.NONE) {
        continue;
      }

      const plane = new Plane(x * 32, y * 32, 33, 33);
      plane.setColor(getTileColor(tile));
      isoMap.addChild(plane);

      // const tileElement = document.createElement('div');
      // tileElement.className = 'tile';
      // tileElement.style.backgroundColor = getTileColor(tile);
      // tileElement.dataset.x = x.toString();
      // tileElement.dataset.y = y.toString();
      // tileElement.style.left = `${x * 32}px`;
      // tileElement.style.top = `${y * 32}px`;
      // // tileElement.innerHTML = `${x},${y}`;

      // mapContainer.appendChild(tileElement);
    }
  }

  scene.addChild(isoMap);
  scene.element.style.backgroundColor = 'blue';

  const planeTest = new Plane(0, 0, 100, 100);
  planeTest.setColor('red');
  scene.addChild(planeTest);
  
  container.appendChild(scene.assemble());

  return scene;
}
