import { Scene } from './renderer';

export class MapControls {
  // private sceneContainer: HTMLElement;
  // private translateX: number = 0;
  // private translateY: number = 0;
  // private scale: number = 1;
  // private baseTransform: string = 'rotateX(45deg)';

  isPanning = false;
  lastClientX = 0;
  lastClientY = 0;
  boundOnPointerDown: (e: PointerEvent) => void;
  boundOnPointerMove: (e: PointerEvent) => void;
  boundOnPointerUp: (e: PointerEvent) => void;
  boundOnWheel: (e: WheelEvent) => void;
  wheelZoomCooldownUntil = 0;
  static readonly WHEEL_ZOOM_COOLDOWN_MS = 100;
  scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
    this.boundOnPointerDown = this.onPointerDown.bind(this);
    this.boundOnPointerMove = this.onPointerMove.bind(this);
    this.boundOnPointerUp = this.onPointerUp.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.attachPointerListeners();
    this.attachWheelListener();
  }

  private attachPointerListeners(): void {
    document.addEventListener('pointerdown', this.boundOnPointerDown);
    document.addEventListener('pointermove', this.boundOnPointerMove);
    document.addEventListener('pointerup', this.boundOnPointerUp);
    document.addEventListener('pointercancel', this.boundOnPointerUp);
  }

  private attachWheelListener(): void {
    document.addEventListener('wheel', this.boundOnWheel, { passive: false });
  }

  private onWheel(e: WheelEvent): void {
    const now = Date.now();
    if (now < this.wheelZoomCooldownUntil) {
      e.preventDefault();
      return;
    }
    this.wheelZoomCooldownUntil = now + MapControls.WHEEL_ZOOM_COOLDOWN_MS;
    const zoomDelta = -Math.sign(e.deltaY) * 0.5;
    this.zoom(zoomDelta);
    e.preventDefault();
  }

  private onPointerDown(e: PointerEvent): void {
    if (e.button !== 1) return; // middle button
    this.isPanning = true;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  private onPointerMove(e: PointerEvent): void {
    if (!this.isPanning) return;
    const dx = e.clientX - this.lastClientX;
    const dy = e.clientY - this.lastClientY;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    this.pan(-dx, -dy);
    e.preventDefault();
  }

  private onPointerUp(e: PointerEvent): void {
    if (e.button !== 1) return;
    this.isPanning = false;
    e.preventDefault();
  }

  pan(deltaX: number, deltaY: number): void {
    this.scene.pan(deltaX, deltaY);
  }

  zoom(delta: number): void {
    this.scene.zoom(delta);
  }

  setZoom(zoom: number): void {
    this.scene.setZoom(zoom);
  }
}
