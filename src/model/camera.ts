import type { Section } from './Section';

export const CAM_SCALE_MIN = 0.25;
export const CAM_SCALE_MAX = 4;
export const CAM_SCALE_STEP = 1.1;
export const CAM_PAN_MS = 300;

export const getCamPan = (
  section: Section,
  viewW: number,
  viewH: number,
  scale: number
) => {
  return {
    x: section.x + section.w / 2 - viewW / (2 * scale),
    y: section.y + section.h / 2 - viewH / (2 * scale),
  };
};

export const clampCamScale = (scale: number) => {
  if (scale < CAM_SCALE_MIN) {
    return CAM_SCALE_MIN;
  }
  if (scale > CAM_SCALE_MAX) {
    return CAM_SCALE_MAX;
  }
  return scale;
};

export const lerpCam = (cur: number, target: number, dt: number) => {
  const t = Math.min(1, dt / CAM_PAN_MS);
  return cur + (target - cur) * t;
};
