import type { Section } from './Section';

export const CAM_SCALE_MIN = 0.25;
export const CAM_SCALE_MAX = 8;
export const CAM_SCALE_STEP = 1.1;
export const CAM_PAN_MS = 300;
/** Applied after fitting the section in the viewport. 1 = exact fit; lower = zoomed out. */
export const CAM_ZOOM_FACTOR = 0.85;
/** Sections smaller than this on both axes skip fit-zoom and use CAM_SMALL_SCALE. */
export const CAM_SMALL_SIZE = 250;
export const CAM_SMALL_SCALE = 3;
/** Menu camera tour: section ids, then milliseconds per pan. */
export const CAM_MENU_TOUR = [2, 12, 8];
export const CAM_MENU_TOUR_MS = 20000;

export const clampCamScale = (scale: number) => {
  if (scale < CAM_SCALE_MIN) {
    return CAM_SCALE_MIN;
  }
  if (scale > CAM_SCALE_MAX) {
    return CAM_SCALE_MAX;
  }
  return scale;
};

export const getCamLook = (section: Section) => {
  return {
    x: section.x + section.w / 2,
    y: section.y + section.h / 2,
  };
};

export const getCamFitScale = (
  section: Section,
  viewW: number,
  viewH: number
) => {
  if (section.w < CAM_SMALL_SIZE && section.h < CAM_SMALL_SIZE) {
    return CAM_SMALL_SCALE;
  }
  const fit = Math.min(viewW / section.w, viewH / section.h);
  return clampCamScale(fit * CAM_ZOOM_FACTOR);
};

export const getCamPan = (
  lookX: number,
  lookY: number,
  viewW: number,
  viewH: number,
  scale: number
) => {
  return {
    x: lookX - viewW / (2 * scale),
    y: lookY - viewH / (2 * scale),
  };
};

export const lerpCam = (cur: number, target: number, dt: number) => {
  const t = Math.min(1, dt / CAM_PAN_MS);
  return cur + (target - cur) * t;
};

export const getMenuTourCam = (
  ms: number,
  sections: Section[],
  viewW: number,
  viewH: number
) => {
  const n = CAM_MENU_TOUR.length;
  const period = CAM_MENU_TOUR_MS * n;
  const tms = ms % period;
  const leg = (tms / CAM_MENU_TOUR_MS) | 0;
  const t = (tms - leg * CAM_MENU_TOUR_MS) / CAM_MENU_TOUR_MS;
  const u = t * t * (3 - 2 * t);
  const a = sections[CAM_MENU_TOUR[leg]];
  const b = sections[CAM_MENU_TOUR[(leg + 1) % n]];
  const lookA = getCamLook(a);
  const lookB = getCamLook(b);
  const scaleA = getCamFitScale(a, viewW, viewH);
  const scaleB = getCamFitScale(b, viewW, viewH);
  return {
    x: lookA.x + (lookB.x - lookA.x) * u,
    y: lookA.y + (lookB.y - lookA.y) * u,
    scale: scaleA + (scaleB - scaleA) * u,
    section: a,
  };
};
