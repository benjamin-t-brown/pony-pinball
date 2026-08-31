import type { Section } from './SectionFuncs';

export const CAM_SCALE_MIN = 0.25;
export const CAM_SCALE_MAX = 8;
export const CAM_SCALE_STEP = 1.1;
export const CAM_PAN_MS = 300;
/** Applied after fitting the section in the viewport. 1 = exact fit; lower = zoomed out. */
export const CAM_ZOOM_FACTOR = 0.85;
/** Sections smaller than this on both axes skip fit-zoom and use CAM_SMALL_SCALE. */
export const CAM_SMALL_SIZE = 250;
export const CAM_SMALL_SCALE = 3;
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
  viewH: number,
  tour: number[],
  tourMs = CAM_MENU_TOUR_MS
) => {
  const ids = tour.filter(i => sections[i]);
  if (ids.length === 0) {
    const a = sections[0];
    if (!a) {
      return { x: 0, y: 0, scale: 1, section: a };
    }
    const look = getCamLook(a);
    return {
      x: look.x,
      y: look.y,
      scale: getCamFitScale(a, viewW, viewH),
      section: a,
    };
  }
  const n = ids.length;
  const period = tourMs * n;
  const tms = ms % period;
  const leg = (tms / tourMs) | 0;
  const t = (tms - leg * tourMs) / tourMs;
  const u = t * t * (3 - 2 * t);
  const a = sections[ids[leg]];
  const b = sections[ids[(leg + 1) % n]];
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
