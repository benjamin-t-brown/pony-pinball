let DIV = 'div';
let SVG = 'svg';
let LINE = 'line';
let CIRCLE = 'circle';
let BR = '<br>';
let TRANSFORM = 'transform';
let INNER_HTML = 'innerHTML';
let SVG_NS = 'http://www.w3.org/2000/svg';
let POINTER_EVENTS = 'pointer-events';
let getGameRoot = () => {
    return getElementById('game');
};
let setStyle = (element, styles) => {
    for (let k in styles) {
        element.style.setProperty(k, styles[k]);
    }
};
let createElement = (tag, attributes = {}, children = []) => {
    let element = document.createElement(tag);
    for (let k in attributes) {
        if (k === INNER_HTML) {
            element.innerHTML = attributes[k];
        }
        else {
            element.setAttribute(k, attributes[k]);
        }
    }
    for (let child of children) {
        element.appendChild(child);
    }
    return element;
};
let createSvgElement = (tag, attributes = {}, children = []) => {
    let element = document.createElementNS(SVG_NS, tag);
    for (let k in attributes) {
        element.setAttribute(k, attributes[k]);
    }
    for (let child of children) {
        element.appendChild(child);
    }
    return element;
};
let appendChild = (parent, child) => {
    parent.appendChild(child);
};
let removeChild = (parent, child) => {
    parent.removeChild(child);
};
let getElementById = (id) => {
    return document.getElementById(id);
};
let domAddEventListener = (element, event, listener) => {
    element.addEventListener(event, listener);
};
let setAttribute = (element, attribute, value) => {
    element.setAttribute(attribute, value);
};
let px = (n) => {
    return n + 'px';
};
let stringify = (n) => {
    return n + '';
};
let W = 400;
let H = 600;
let BALL_R = 10;
let PADDLE_LEN = 58;
let PADDLE_SPEED = 18;
let PADDLE_RETURN = 10;
// Matches the rendered stroke, so the ball rides on the paddle's face rather
// than sinking to its centre line.
let PADDLE_HALF_WIDTH = 3;
let PADDLE_REST = 0.35;
let PADDLE_FRICTION = 0.25;
// A tip hit adds PADDLE_SPEED * PADDLE_LEN of surface speed on top of whatever
// the ball arrived with, so the cap has to clear that or the kick gets shaved.
let MAX_BALL_SPEED = 1500;
let PORTAL_WARP_MS = 300;
let LAUNCHER_X = 384;
let LAUNCHER_Y = 582;
let LAUNCHER_FORCE = 1250;
let LAUNCHER_RANGE = 36;
let LAUNCHER_CHARGE_MS = 600;
let LAUNCHER_LEN = 24;
/** Section that ends the run. */
let COMPLETE_SECTION = 15;
/** Gate wall and decoration texture colors: red, orange, yellow, green, blue, indigo, violet. */
let GATE_COLORS = ['#f66', '#fa6', '#fd6', '#6c6', '#8cf', '#a6f', '#c8f'];
let SECTION_BG = '#123';
let SECTION_DOT = '#345';
/** Gold "active"/highlight accent used across the HUD and active parts. */
let ACCENT = '#fc8';
let LEFT_PIVOT = { x: 118, y: 450 };
let RIGHT_PIVOT = { x: 282, y: 450 };
let LEFT_REST_ANGLE = 0.45;
let LEFT_UP = -0.55;
let RIGHT_REST_ANGLE = Math.PI - 0.45;
let RIGHT_UP = Math.PI + 0.55;
// @ts-nocheck

/*

ZzFX - Zuper Zmall Zound Zynth v1.3.2 by Frank Force
https://github.com/KilledByAPixel/ZzFX

ZzFX Features

- Tiny synth engine with 20 controllable parameters.
- Play sounds via code, no need for sound assed files!
- Compatible with most modern web browsers.
- Small code footprint, the micro version is under 1 kilobyte.
- Can produce a huge variety of sound effect types.
- Sounds can be played with a short call. zzfx(...[,,,,.1,,,,9])
- A small bit of randomness appied to sounds when played.
- Use ZZFX.GetNote to get frequencies on a standard diatonic scale.
- Sounds can be saved out as wav files for offline playback.
- No additional libraries or dependencies are required.

*/
/*

  ZzFX MIT License
  
  Copyright (c) 2019 - Frank Force
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  
*/
let // ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.2 by Frank Force
  zzfxV = 0.3, // volume
  zzfxX, // audio context (lazy — Node/SSR has no AudioContext)
  zzfx = // play sound
    (
      p = 1,
      k = 0.05,
      b = 220,
      e = 0,
      r = 0,
      t = 0.1,
      q = 0,
      D = 1,
      u = 0,
      y = 0,
      v = 0,
      z = 0,
      l = 0,
      E = 0,
      A = 0,
      F = 0,
      c = 0,
      w = 1,
      m = 0,
      B = 0,
      N = 0
    ) => {
      let M = Math,
        d = 2 * M.PI,
        R = 44100,
        G = (u *= (500 * d) / R / R),
        C = (b *= ((1 - k + 2 * k * M.random((k = []))) * d) / R),
        g = 0,
        H = 0,
        a = 0,
        n = 1,
        I = 0,
        J = 0,
        f = 0,
        h = N < 0 ? -1 : 1,
        x = (d * h * N * 2) / R,
        L = M.cos(x),
        Z = M.sin,
        K = Z(x) / 4,
        O = 1 + K,
        X = (-2 * L) / O,
        Y = (1 - K) / O,
        P = (1 + h * L) / 2 / O,
        Q = -(h + L) / O,
        S = P,
        T = 0,
        U = 0,
        V = 0,
        W = 0;
      e = R * e + 9;
      m *= R;
      r *= R;
      t *= R;
      c *= R;
      y *= (500 * d) / R ** 3;
      A *= d / R;
      v *= d / R;
      z *= R;
      l = (R * l) | 0;
      p *= zzfxV;
      for (h = (e + m + r + t + c) | 0; a < h; k[a++] = f * p)
        (++J % ((100 * F) | 0) ||
          ((f = q
            ? 1 < q
              ? 2 < q
                ? 3 < q
                  ? 4 < q
                    ? ((g / d) % 1 < D / 2) * 2 - 1
                    : Z(g ** 3)
                  : M.max(M.min(M.tan(g), 1), -1)
                : 1 - (((((2 * g) / d) % 2) + 2) % 2)
              : 1 - 4 * M.abs(M.round(g / d) - g / d)
            : Z(g)),
          (f =
            (l ? 1 - B + B * Z((d * a) / l) : 1) *
            (4 < q ? f : (f < 0 ? -1 : 1) * M.abs(f) ** D) *
            (a < e
              ? a / e
              : a < e + m
                ? 1 - ((a - e) / m) * (1 - w)
                : a < e + m + r
                  ? w
                  : a < h - c
                    ? ((h - a - c) / t) * w
                    : 0)),
          (f = c
            ? f / 2 +
              (c > a
                ? 0
                : ((a < h - c ? 1 : (h - a) / c) * k[(a - c) | 0]) / 2 / p)
            : f),
          N
            ? (f = W = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = W))
            : 0),
          (x = (b += u += y) * M.cos(A * H++)),
          (g += x + x * E * Z(a ** 5)),
          n && ++n > z && ((b += v), (C += v), (n = 0)),
          !l || ++I % l || ((b = C), (u = G), (n = n || 1)));
      ((X = zzfxX || (zzfxX = new AudioContext())),
        (p = X.createBuffer(1, h, R)));
      p.getChannelData(0).set(k);
      b = X.createBufferSource();
      b.buffer = p;
      b.connect(X.destination);
      b.start();
    };
// 'use strict';

// // play a zzfx sound
// function zzfx(...parameters) {
//   return ZZFX.play(...parameters);
// }

// ///////////////////////////////////////////////////////////////////////////////
// // ZZFX API for playing sounds
// let ZZFX = {
//   // master volume scale
//   volume: 0.3,

//   // sample rate for audio
//   sampleRate: 44100,

//   // create shared audio context
//   audioContext: new AudioContext(),

//   // play a sound from zzfx paramerters
//   play: function (...parameters) {
//     // build samples and start sound
//     return this.playSamples([this.buildSamples(...parameters)]);
//   },

//   // play an array of samples
//   playSamples: function (
//     sampleChannels,
//     volumeScale = 1,
//     rate = 1,
//     pan = 0,
//     loop = false
//   ) {
//     // create buffer and source
//     let channelCount = sampleChannels.length;
//     let sampleLength = sampleChannels[0].length;
//     let buffer = this.audioContext.createBuffer(
//       channelCount,
//       sampleLength,
//       this.sampleRate
//     );
//     let source = this.audioContext.createBufferSource();

//     // copy samples to buffer and setup source
//     sampleChannels.forEach((c, i) => buffer.getChannelData(i).set(c));
//     source.buffer = buffer;
//     source.playbackRate.value = rate;
//     source.loop = loop;

//     // create and connect gain node
//     let gainNode = this.audioContext.createGain();
//     gainNode.gain.value = this.volume * volumeScale;
//     gainNode.connect(this.audioContext.destination);

//     // connect source to stereo panner and gain
//     let pannerNode = new StereoPannerNode(this.audioContext, { pan: pan });
//     source.connect(pannerNode).connect(gainNode);
//     source.start();

//     // return sound
//     return source;
//   },

//   // build an array of samples
//   buildSamples: function (
//     volume = 1,
//     randomness = 0.05,
//     frequency = 220,
//     attack = 0,
//     sustain = 0,
//     release = 0.1,
//     shape = 0,
//     shapeCurve = 1,
//     slide = 0,
//     deltaSlide = 0,
//     pitchJump = 0,
//     pitchJumpTime = 0,
//     repeatTime = 0,
//     noise = 0,
//     modulation = 0,
//     bitCrush = 0,
//     delay = 0,
//     sustainVolume = 1,
//     decay = 0,
//     tremolo = 0,
//     filter = 0
//   ) {
//     // init parameters
//     let sampleRate = this.sampleRate,
//       PI2 = Math.PI * 2,
//       abs = Math.abs,
//       sign = v => (v < 0 ? -1 : 1),
//       startSlide = (slide *= (500 * PI2) / sampleRate / sampleRate),
//       startFrequency = (frequency *=
//         ((1 + randomness * 2 * Math.random() - randomness) * PI2) / sampleRate),
//       modOffset = 0, // modulation offset
//       repeat = 0, // repeat offset
//       crush = 0, // bit crush offset
//       jump = 1, // pitch jump timer
//       length, // sample length
//       b = [], // sample buffer
//       t = 0, // sample time
//       i = 0, // sample index
//       s = 0, // sample value
//       f, // wave frequency
//       // biquad LP/HP filter
//       quality = 2,
//       w = (PI2 * abs(filter) * 2) / sampleRate,
//       cos = Math.cos(w),
//       alpha = Math.sin(w) / 2 / quality,
//       a0 = 1 + alpha,
//       a1 = (-2 * cos) / a0,
//       a2 = (1 - alpha) / a0,
//       b0 = (1 + sign(filter) * cos) / 2 / a0,
//       b1 = -(sign(filter) + cos) / a0,
//       b2 = b0,
//       x2 = 0,
//       x1 = 0,
//       y2 = 0,
//       y1 = 0;

//     // scale by sample rate
//     let minAttack = 9; // prevent pop if attack is 0
//     attack = attack * sampleRate || minAttack;
//     decay *= sampleRate;
//     sustain *= sampleRate;
//     release *= sampleRate;
//     delay *= sampleRate;
//     deltaSlide *= (500 * PI2) / sampleRate ** 3;
//     modulation *= PI2 / sampleRate;
//     pitchJump *= PI2 / sampleRate;
//     pitchJumpTime *= sampleRate;
//     repeatTime = (repeatTime * sampleRate) | 0;
//     volume *= this.volume;

//     // generate waveform
//     for (
//       length = (attack + decay + sustain + release + delay) | 0;
//       i < length;
//       b[i++] = s * volume // sample
//     ) {
//       if (!(++crush % ((bitCrush * 100) | 0))) // bit crush
//       {
//         s = shape
//           ? shape > 1
//             ? shape > 2
//               ? shape > 3
//                 ? shape > 4 // wave shape
//                   ? (t / PI2) % 1 < shapeCurve / 2
//                     ? 1
//                     : -1 // 5 square duty
//                   : Math.sin(t ** 3) // 4 noise
//                 : Math.max(Math.min(Math.tan(t), 1), -1) // 3 tan
//               : 1 - (((((2 * t) / PI2) % 2) + 2) % 2) // 2 saw
//             : 1 - 4 * abs(Math.round(t / PI2) - t / PI2) // 1 triangle
//           : Math.sin(t); // 0 sin

//         s =
//           (repeatTime
//             ? 1 - tremolo + tremolo * Math.sin((PI2 * i) / repeatTime) // tremolo
//             : 1) *
//           (shape > 4 ? s : sign(s) * abs(s) ** shapeCurve) * // shape curve
//           (i < attack
//             ? i / attack // attack
//             : i < attack + decay // decay
//               ? 1 - ((i - attack) / decay) * (1 - sustainVolume) // decay falloff
//               : i < attack + decay + sustain // sustain
//                 ? sustainVolume // sustain volume
//                 : i < length - delay // release
//                   ? ((length - i - delay) / release) * // release falloff
//                     sustainVolume // release volume
//                   : 0); // post release

//         s = delay
//           ? s / 2 +
//             (delay > i
//               ? 0 // delay
//               : ((i < length - delay ? 1 : (length - i) / delay) * // release delay
//                   b[(i - delay) | 0]) /
//                 2 /
//                 volume)
//           : s; // sample delay

//         if (filter)
//           // apply filter
//           s = y1 =
//             b2 * x2 + b1 * (x2 = x1) + b0 * (x1 = s) - a2 * y2 - a1 * (y2 = y1);
//       }

//       f =
//         (frequency += slide += deltaSlide) * // frequency
//         Math.cos(modulation * modOffset++); // modulation
//       t += f + f * noise * Math.sin(i ** 5); // noise

//       if (jump && ++jump > pitchJumpTime) // pitch jump
//       {
//         frequency += pitchJump; // apply pitch jump
//         startFrequency += pitchJump; // also apply to start
//         jump = 0; // stop pitch jump time
//       }

//       if (repeatTime && !(++repeat % repeatTime)) // repeat
//       {
//         frequency = startFrequency; // reset frequency
//         slide = startSlide; // reset slide
//         jump ||= 1; // reset pitch jump time
//       }
//     }

//     return b; // return sample buffer
//   },

//   // get frequency of a musical note on a diatonic scale
//   getNote: function (semitoneOffset = 0, rootNoteFrequency = 440) {
//     return rootNoteFrequency * 2 ** (semitoneOffset / 12);
//   },
// };

// ///////////////////////////////////////////////////////////////////////////////
// // Sound object that can precache and play ZZFX sounds
// class ZZFXSound {
//   constructor(zzfxSound = []) {
//     this.zzfxSound = zzfxSound;

//     // extract randomness parameter from zzfxSound
//     this.randomness = zzfxSound[1] != undefined ? zzfxSound[1] : 0.05;
//     zzfxSound[1] = 0; // generate without frequency randomness

//     // cache the sound samples
//     this.samples = ZZFX.buildSamples(...zzfxSound);
//   }

//   play(volume = 1, pitch = 1, randomnessScale = 1, pan = 0, loop = false) {
//     if (!this.samples) return;

//     // play the sound
//     let playbackRate =
//       pitch +
//       pitch * this.randomness * randomnessScale * (Math.random() * 2 - 1);
//     this.source = ZZFX.playSamples(
//       [this.samples],
//       volume,
//       playbackRate,
//       pan,
//       loop
//     );
//     return this.source;
//   }
// }

// zzfx(...[.5,,106,,,.004,3,3.2,1,,,,,,37,,,.97,.16,,-1153]); // gate closed
// zzfx(...[.7,,10,.07,.01,.15,2,3.9,,,41,.01,.03,,11,,,.83,.03,.06,136]); // hit special wall
// zzfx(...[1.2,,746,,.02,.24,3,1.3,,-3,,,,,,.1,,.79,,,107]); // hit small circle
// zzfx(...[1.8,,225,.01,.15,.17,1,1.3,,,,,,,22,,.16,.74,.03,,-1030]); // Launch
// zzfx(...[2.1,,964,,.05,.01,3,2.9,-38,-61,243,,,,197,,.05,.72]); // Launch Pull Back
// zzfx(...[.8,,463,.02,.15,.49,3,1.6,3,,-85,.39,,,15,.1,.27,.77,.34,,962]); // Start game
// zzfx(...[.6,,323,.17,,.007,5,.5,,6,-123,,.05,,7.2,.2,.03,.83,.33,,105]); // Ball Traveling
// zzfx(...[,,306,.11,.12,.02,,2.7,,,325,.07,.02,,,,,.7,.01,.07]); // Get coin
// zzfx(...[,,845,.31,.13,,3,2.2,2,,,,.03,.1,276,,,.64,.1,.3]); // Secret
// zzfx(...[.6,,14,.05,.42,,1,.9,-13,1,,,,.6,412,,,.77,.36,,391]); // Gate Open
// zzfx(...[,,286,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04]); //  Paddle Flipper
// zzfx(...[,,527,,,.03,5,1.7052253513389288,-63,,,,,,,.5,,.93,,,401]); // Wall Reappear
// zzfx(...[,,186,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04]); // paddle flipper down
// zzfx(...[3.6,,175,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105]); // portal in
// zzfx(...[3.6,,75,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105]); // portal out
// zzfx(...[1.1,,70,.16,.32,.06,4,1.9,,38,-360,.01,.09,.1,.5,.3,,.77,.02,.08,-1487]); // hit fan
// zzfx(...[1.2,,652,.37,.01,.02,2,1.8,-13,-11,14,.1,.08,,,,.48,.92,.06,.26,728]); // game win
// prettier-ignore
let SOUNDS = [
  [1.6,.5,398,.07,.03,.16,,3.3,,-1,,,,,,,,.63,.1,,354], // hit small circle
  [1.8,,225,.01,.15,.17,1,1.3,,,,,,,22,,.16,.74,.03,,-1030], // Launch
  [1.6,,127,.2,.08,.2,4,2.7,,,,,,,,.1,,.55,.13,,-1202], // Launch Pull Back
  [.8,,463,.02,.15,.49,3,1.6,3,,-85,.39,,,15,.1,.27,.77,.34,,962], // Start game
  [.6,,323,.17,,.007,5,.5,,6,-123,,.05,,7.2,.2,.03,.83,.33,,105], // Ball Traveling
  [,,306,.11,.12,.02,,2.7,,,325,.07,.02,,,,,.7,.01,.07], // Get coin
  [,,845,.31,.13,,3,2.2,2,,,,.03,.1,276,,,.64,.1,.3], // Secret
  [,,286,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04], // Paddle Flipper
  [,,186,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04], // paddle flipper down
  [3.6,,175,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105], // portal in
  [3.6,,75,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105], // portal out
  [1.1,,70,.16,.32,.06,4,1.9,,38,-360,.01,.09,.1,.5,.3,,.77,.02,.08,-1487], // hit fan
  [1.2,,652,.37,.01,.02,2,1.8,-13,-11,14,.1,.08,,,,.48,.92,.06,.26,728], // game win
];

let SOUND_HIT_SMALL_CIRCLE = 0;
let SOUND_LAUNCH = 1;
let SOUND_LAUNCH_PULL_BACK = 2;
let SOUND_START_GAME = 3;
let SOUND_BALL_TRAVELING = 4;
let SOUND_GET_COIN = 5;
let SOUND_SECRET = 6;
let SOUND_PADDLE_FLIPPER = 7;
let SOUND_PADDLE_FLIPPER_DOWN = 8;
let SOUND_PORTAL_IN = 9;
let SOUND_PORTAL_OUT = 10;
let SOUND_HIT_FAN = 11;
let SOUND_GAME_WIN = 12;

let soundsPlayedThisTick = {};

let playSound = i => {
  if (soundsPlayedThisTick[i]) {
    return;
  }
  zzfx(...SOUNDS[i]);
  soundsPlayedThisTick[i] = true;
};

let clearSoundsPlayedThisTick = () => {
  for (let i in soundsPlayedThisTick) {
    delete soundsPlayedThisTick[i];
  }
};
// Extra distance the solver pushes a body past the surface, so the next step
// starts outside instead of exactly on the boundary.
let CONTACT_SLOP = 0.01;
// A surface that is moving toward the body has to be outrun, or it overtakes
// the body again on the next substep and applies a second impulse. This is the
// minimum speed a body leaves such a surface with, relative to the surface.
let MIN_SEPARATION_SPEED = 30;
let vecCreate = (x = 0, y = 0) => ({ x, y });
let vecAdd = (a, b) => vecCreate(a.x + b.x, a.y + b.y);
let vecSub = (a, b) => vecCreate(a.x - b.x, a.y - b.y);
let vecMul = (v, s) => vecCreate(v.x * s, v.y * s);
let vecDot = (a, b) => a.x * b.x + a.y * b.y;
let vecLen = (v) => Math.hypot(v.x, v.y);
let vecNorm = (v) => vecMul(v, 1 / (vecLen(v) || 1));
let vecPerp = (v) => vecCreate(-v.y, v.x);
let circleCreate = (x, y, r, m = 1) => ({
    pos: vecCreate(x, y),
    vel: vecCreate(),
    r,
    m,
    invM: 1 / m,
});
let circleApplyImpulse = (c, j) => {
    c.vel = vecAdd(c.vel, vecMul(j, c.invM));
    return c;
};
let GRAVITY = 950;
let circleIntegrate = (c, dtSeconds, gravity = GRAVITY) => {
    c.vel = vecAdd(c.vel, vecMul(vecCreate(0, gravity), dtSeconds));
    c.pos = vecAdd(c.pos, vecMul(c.vel, dtSeconds));
    return c;
};
let lineCreate = (x1, y1, x2, y2, rest = 0.5, color = -1, sound = 0) => ({
    a: vecCreate(x1, y1),
    b: vecCreate(x2, y2),
    rest,
    color,
    sound,
});
let lineSet = (l, x1, y1, x2, y2) => {
    l.a.x = x1;
    l.a.y = y1;
    l.b.x = x2;
    l.b.y = y2;
    return l;
};
// The closest point on the segment, plus the clamped parameter that produced
// it. t of exactly 0 or 1 means the closest point is an endpoint cap, which
// needs a radial normal rather than the segment's perpendicular.
let lineClosestPointT = (l, p) => {
    let ab = vecSub(l.b, l.a);
    let abLen2 = vecDot(ab, ab) || 1;
    let t = vecDot(vecSub(p, l.a), ab) / abLen2;
    t = Math.max(0, Math.min(1, t));
    return { point: vecAdd(l.a, vecMul(ab, t)), t };
};
let lineClosestPoint = (l, p) => lineClosestPointT(l, p).point;
/**
 * Resolves one contact between a circle and a surface of infinite mass.
 *
 * `n` is a unit normal pointing from the surface toward the circle and `depth`
 * is how far the circle has to travel along it to be clear. `surfaceVel` is the
 * velocity of the surface at the contact point, or null for a static surface.
 *
 * All of the velocity work happens in the surface's frame of reference. That is
 * what makes a moving surface behave: the bounce is computed against the
 * relative velocity, then the surface velocity is added back once. Adding any
 * fraction of the surface velocity on top of an already-resolved bounce injects
 * energy on every substep of a sustained contact, which is what made the paddle
 * drag the ball around instead of striking it.
 */
let resolveCircleSurface = (c, n, depth, rest, friction, surfaceVel, sound = 0) => {
    if (depth <= 0) {
        return false;
    }
    c.pos = vecAdd(c.pos, vecMul(n, depth + CONTACT_SLOP));
    let rel = surfaceVel ? vecSub(c.vel, surfaceVel) : c.vel;
    let vn = vecDot(rel, n);
    if (vn >= 0) {
        // Already separating in the surface's frame: this is a resting or trailing
        // contact, so correcting the position is the whole job.
        return true;
    }
    if (sound) {
        playSound(sound);
    }
    let relT = vecSub(rel, vecMul(n, vn));
    let outN = -vn * rest;
    if (surfaceVel && vecDot(surfaceVel, n) > 0 && outN < MIN_SEPARATION_SPEED) {
        outN = MIN_SEPARATION_SPEED;
    }
    // Coulomb friction: the normal impulse can cancel at most `friction` times as
    // much tangential slip.
    let outT = relT;
    let vt = vecLen(relT);
    if (friction > 0 && vt > 1e-6) {
        let maxDrop = friction * (1 + rest) * -vn;
        outT = vecMul(relT, Math.max(0, vt - maxDrop) / vt);
    }
    let newRel = vecAdd(vecMul(n, outN), outT);
    c.vel = surfaceVel ? vecAdd(newRel, surfaceVel) : newRel;
    return true;
};
let resolveCircleLine = (c, l, friction = 0, surfaceVel = null) => {
    let cp = lineClosestPoint(l, c.pos);
    let diff = vecSub(c.pos, cp);
    let dist = vecLen(diff);
    if (l.rest < 0 || dist >= c.r) {
        return false;
    }
    // A centre sitting exactly on the segment has no direction to push along, so
    // fall back to the segment's own perpendicular instead of skipping the hit.
    let n = dist > 1e-6 ? vecMul(diff, 1 / dist) : vecNorm(vecPerp(vecSub(l.b, l.a)));
    return resolveCircleSurface(c, n, c.r - dist, l.rest, friction, surfaceVel, l.sound);
};
let resolveBallWalls = (ball, walls, surfaceVel = null) => {
    let hit = false;
    for (let i = 0; i < walls.length; i++) {
        if (resolveCircleLine(ball, walls[i], 0, surfaceVel)) {
            hit = true;
        }
    }
    return hit;
};
let resolveCircleCircle = (a, b, restitution = 0.8) => {
    let diff = vecSub(b.pos, a.pos);
    let d = vecLen(diff);
    if (d === 0 || d >= a.r + b.r) {
        return;
    }
    let n = vecMul(diff, 1 / d);
    let penetration = a.r + b.r - d;
    let totalInv = a.invM + b.invM;
    a.pos = vecAdd(a.pos, vecMul(n, -penetration * (a.invM / totalInv)));
    b.pos = vecAdd(b.pos, vecMul(n, penetration * (b.invM / totalInv)));
    let rel = vecSub(b.vel, a.vel);
    let vn = vecDot(rel, n);
    if (vn > 0) {
        return;
    }
    let j = (-(1 + restitution) * vn) / totalInv;
    let impulse = vecMul(n, j);
    circleApplyImpulse(a, vecMul(impulse, -1));
    circleApplyImpulse(b, impulse);
};
/** Perimeter edge bits, in the order applyPerimeter walks them. */
let EDGE_TOP = 1;
let EDGE_RIGHT = 2;
let EDGE_BOTTOM = 4;
let EDGE_LEFT = 8;
let EDGE_ALL = 15;
let sectionCreate = (id, x, y, w, h) => ({
    id,
    x,
    y,
    w,
    h,
    walls: [],
    parts: [],
    fills: [],
});
let sectionContains = (section, x, y) => {
    return (x >= section.x &&
        x <= section.x + section.w &&
        y >= section.y &&
        y <= section.y + section.h);
};
let findSectionAt = (sections, x, y, current) => {
    if (current && sectionContains(current, x, y)) {
        return current;
    }
    for (let i = 0; i < sections.length; i++) {
        if (sectionContains(sections[i], x, y)) {
            return sections[i];
        }
    }
    return current;
};
let isPointInAnySection = (sections, x, y, margin) => {
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        if (x >= s.x - margin &&
            x <= s.x + s.w + margin &&
            y >= s.y - margin &&
            y <= s.y + s.h + margin) {
            return true;
        }
    }
    return false;
};
let forEachPart = (sections, fn) => {
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        for (let j = 0; j < s.parts.length; j++) {
            fn(s.parts[j], s);
        }
    }
};
/**
 * Generates each section's perimeter walls from its rect, its `edges` mask and
 * the level's links, and appends them to section.walls.
 *
 * Two kinds of span are skipped, and they work the same way:
 *  - a link's opening, so the ball can pass between sections;
 *  - a boundary shared with a LOWER-index section, which owns that wall. Both
 *    sides emitting would leave coincident duplicates, doubling the work in
 *    resolveBallWalls for no behavioural difference.
 *
 * A link's `offset` is a world coordinate along the boundary's varying axis, so
 * neither section's origin is privileged.
 */
// let applyPerimeter = (sections: Section[], links: number[][]) => {
//   // skip[section * 4 + edgeIndex] = spans of [lo, hi] in local edge coords,
//   // edgeIndex being 0 top, 1 right, 2 bottom, 3 left.
//   let skip: number[][][] = [];
//   for (let i = 0; i < sections.length * 4; i++) {
//     skip.push([]);
//   }
//   let add = (si: number, edge: number, lo: number, len: number) => {
//     skip[si * 4 + edge].push([lo, lo + len]);
//   };
//   for (let i = 0; i < links.length; i++) {
//     let [ai, bi, off, wide] = links[i];
//     let a = sections[ai];
//     let b = sections[bi];
//     if (a.y + a.h === b.y) {
//       add(ai, 2, off - a.x, wide);
//       add(bi, 0, off - b.x, wide);
//     } else if (b.y + b.h === a.y) {
//       add(ai, 0, off - a.x, wide);
//       add(bi, 2, off - b.x, wide);
//     } else if (a.x + a.w === b.x) {
//       add(ai, 1, off - a.y, wide);
//       add(bi, 3, off - b.y, wide);
//     } else if (b.x + b.w === a.x) {
//       add(ai, 3, off - a.y, wide);
//       add(bi, 1, off - b.y, wide);
//     }
//   }
//   // Shared-boundary ownership. j < i, so j is the owner and i gives up the span.
//   for (let i = 0; i < sections.length; i++) {
//     for (let j = 0; j < i; j++) {
//       let a = sections[i];
//       let b = sections[j];
//       let vertical = a.x + a.w === b.x || b.x + b.w === a.x;
//       let lo = vertical
//         ? Math.max(a.y, b.y)
//         : Math.max(a.x, b.x);
//       let hi = vertical
//         ? Math.min(a.y + a.h, b.y + b.h)
//         : Math.min(a.x + a.w, b.x + b.w);
//       if (lo >= hi) {
//         continue;
//       }
//       if (a.y + a.h === b.y) {
//         add(i, 2, lo - a.x, hi - lo);
//       } else if (b.y + b.h === a.y) {
//         add(i, 0, lo - a.x, hi - lo);
//       } else if (a.x + a.w === b.x) {
//         add(i, 1, lo - a.y, hi - lo);
//       } else if (b.x + b.w === a.x) {
//         add(i, 3, lo - a.y, hi - lo);
//       }
//     }
//   }
//   for (let i = 0; i < sections.length; i++) {
//     let s = sections[i];
//     for (let edge = 0; edge < 4; edge++) {
//       if (!(s.edges & (1 << edge))) {
//         continue;
//       }
//       let spans = skip[i * 4 + edge];
//       spans.sort((p, q) => p[0] - q[0]);
//       let len = edge & 1 ? s.h : s.w;
//       let cursor = 0;
//       for (let k = 0; k <= spans.length; k++) {
//         let stop = k < spans.length ? spans[k][0] : len;
//         if (stop > cursor) {
//           // Walk the edge as a run from `cursor` to `stop` along its axis.
//           s.walls.push(
//             edge === 0
//               ? lineCreate(cursor, 0, stop, 0)
//               : edge === 1
//                 ? lineCreate(s.w, cursor, s.w, stop)
//                 : edge === 2
//                   ? lineCreate(cursor, s.h, stop, s.h)
//                   : lineCreate(0, cursor, 0, stop)
//           );
//         }
//         if (k < spans.length && spans[k][1] > cursor) {
//           cursor = spans[k][1];
//         }
//       }
//     }
//   }
// };
let flattenSectionWalls = (sections, into) => {
    let walls = into || [];
    let n = 0;
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        for (let j = 0; j < s.walls.length; j++) {
            let wall = s.walls[j];
            if (wall.rest < 0) {
                continue;
            }
            let x0 = wall.a.x + s.x;
            let y0 = wall.a.y + s.y;
            let x1 = wall.b.x + s.x;
            let y1 = wall.b.y + s.y;
            if (n < walls.length) {
                lineSet(walls[n], x0, y0, x1, y1);
                walls[n].rest = wall.rest;
                walls[n].color = wall.color;
                walls[n].sound = wall.sound;
            }
            else {
                walls.push(lineCreate(x0, y0, x1, y1, wall.rest, wall.color, wall.sound));
            }
            n++;
        }
    }
    walls.length = n;
    return walls;
};
let ballCreate = (x = 0, y = 0) => {
    let b = circleCreate(x, y, BALL_R, 1);
    return {
        ...b,
        color: 'red',
        warpMs: 0,
        warpX0: 0,
        warpY0: 0,
        warpX1: 0,
        warpY1: 0,
        warpVx: 0,
        warpVy: 0,
    };
};
let ballIsOutOfBounds = (ball, sections) => {
    return !isPointInAnySection(sections, ball.pos.x, ball.pos.y, 40);
};
let ballStartWarp = (ball, x0, y0, x1, y1) => {
    ball.warpMs = PORTAL_WARP_MS;
    ball.warpX0 = x0;
    ball.warpY0 = y0;
    ball.warpX1 = x1;
    ball.warpY1 = y1;
    ball.warpVx = ball.vel.x;
    ball.warpVy = ball.vel.y;
    ball.vel.x = 0;
    ball.vel.y = 0;
    ball.pos.x = x0;
    ball.pos.y = y0;
    ball.color = '#fff';
    ball.r = BALL_R * 0.5;
    playSound(SOUND_PORTAL_IN);
};
/** Advance portal travel. Returns true while the ball is still warping. */
let ballUpdateWarp = (ball, dt) => {
    if (ball.warpMs <= 0) {
        return false;
    }
    ball.warpMs -= dt;
    let u = 1 - Math.max(ball.warpMs, 0) / PORTAL_WARP_MS;
    ball.pos.x = ball.warpX0 + (ball.warpX1 - ball.warpX0) * u;
    ball.pos.y = ball.warpY0 + (ball.warpY1 - ball.warpY0) * u;
    if (ball.warpMs > 0) {
        return true;
    }
    ball.warpMs = 0;
    ball.pos.x = ball.warpX1;
    ball.pos.y = ball.warpY1;
    ball.vel.x = ball.warpVx;
    ball.vel.y = ball.warpVy;
    ball.color = 'red';
    ball.r = BALL_R;
    playSound(SOUND_PORTAL_OUT);
    return false;
};
let CONTROL_LEFT = 0;
let CONTROL_RIGHT = 1;
let CONTROL_START = 2;
/** Not player-driven. The input gate in updateParts skips these. */
let CONTROL_NONE = -1;
let PART_PADDLE = 0;
let PART_LAUNCHER = 1;
let PART_OBSTACLE = 2;
let PART_FIELD = 3;
let PART_COLLECTABLE = 4;
let PART_PORTAL = 5;
let PART_DECORATION = 6;
/**
 * Everything that lives in a Section and can touch the ball: paddles,
 * launchers, bumpers, fields. One list, one loop, one UI element — adding a
 * kind costs a `type` constant and the phases it actually cares about, not a
 * new array, foreach, update pass and element class.
 */
class Part {
    x = 0;
    y = 0;
    type = PART_PADDLE;
    control = CONTROL_NONE;
    active = false;
    constructor(x, y, type, control = CONTROL_NONE) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.control = control;
    }
    activate() {
        this.active = true;
    }
    unactivate() {
        this.active = false;
    }
    /** Pre-physics tick: move under your own power. */
    update(_dt, _section) { }
    /**
     * Pre-integration: apply forces to the ball and return the gravity it should
     * integrate with. Returning `g` untouched opts out of both.
     */
    preBall(_ball, _ox, _oy, _dtSeconds, g, _section, _state) {
        return g;
    }
    /** Post-integration: resolve contact. */
    affectBall(_ball, _ox, _oy) { }
}
class Collectable extends Part {
    r = 12;
    groupType = 0;
    taken = false;
    trigger = null;
    constructor(x, y, r, groupType) {
        super(x, y, PART_COLLECTABLE);
        this.active = true;
        this.r = r;
        this.groupType = groupType;
    }
    preBall(ball, ox, oy, _dtSeconds, g, section, state) {
        if (this.taken || !state) {
            return g;
        }
        let dx = ball.pos.x - (this.x + ox);
        let dy = ball.pos.y - (this.y + oy);
        let hitR = this.r + ball.r;
        if (dx * dx + dy * dy > hitR * hitR) {
            return g;
        }
        this.taken = true;
        this.active = false;
        playSound(SOUND_GET_COIN);
        let gt = this.groupType;
        while (state.collected.length <= gt) {
            state.collected.push(0);
        }
        state.collected[gt]++;
        if (this.trigger) {
            this.trigger.onCollect(section, state, gt);
        }
        return g;
    }
}
let DEC_BLINKING_LIGHT = 0;
let DEC_BLINKING_LIGHT_LINE = 1;
let DEC_ICON = 2;
let DEC_RAINBOW = 3;
let SHAPE_CHEVRON = 0;
let SHAPE_CIRCLE = 1;
let SHAPE_SQUARE = 2;
let CHEVRON_D = 'M-6-8L6 0L-6 8';
let TEX_PALETTE = GATE_COLORS.length;
let TEX_ARROWS = GATE_COLORS.length + 1;
let getTextureClass = (texture) => {
    let t = texture | 0;
    if (t === TEX_ARROWS) {
        return 'ta';
    }
    if (t === TEX_PALETTE) {
        return 't tc';
    }
    return 't t' + (t % GATE_COLORS.length);
};
let lightAnimation = (dec) => {
    if (!dec.active || !(dec.interval > 0)) {
        return 'none';
    }
    if ((dec.texture | 0) === TEX_PALETTE) {
        return ('c ' + dec.interval * GATE_COLORS.length + 'ms step-end infinite');
    }
    return 'k ' + dec.interval + 'ms step-end infinite';
};
let injectTextureCss = () => {
    let rain = GATE_COLORS.join(',') + ',' + GATE_COLORS[0];
    let arrow = 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 14 16\'><path fill=\'%23fff\' d=\'M1 1 10 8 1 15 3 15 12 8 3 1z\'/></svg>")';
    let n = GATE_COLORS.length;
    let css = '@keyframes k{50%{opacity:0}}' +
        '@keyframes p{to{background-position:var(--s) 0;mask-position:var(--s) 0}}';
    css += '@keyframes c{';
    for (let i = 0; i < n; i++) {
        css += ((i * 100) / n | 0) + '%{stroke:' + GATE_COLORS[i] + '}';
    }
    css += '}.t{fill:none}.tc{stroke:' + GATE_COLORS[0] + '}';
    for (let i = 0; i < n; i++) {
        css += '.t' + i + '{stroke:' + GATE_COLORS[i] + '}';
    }
    css +=
        '.ta{overflow:hidden;position:relative;--s:20px;--r:0deg;background:' +
            SECTION_BG +
            '}' +
            '.ta:before{content:"";position:absolute;left:50%;top:50%;width:100vmax;height:100vmax;' +
            'transform:translate(-50.4%,-50%) rotate(var(--r));' +
            'background:repeating-linear-gradient(90deg,' +
            rain +
            ');background-size:calc(6*var(--s)) 100%;' +
            '-webkit-mask:' +
            arrow +
            ' 0 0/var(--s) var(--s);mask:' +
            arrow +
            ' 0 0/var(--s) var(--s);animation:p .6s linear infinite}' +
            '.tr{overflow:hidden;background:repeating-linear-gradient(90deg,' +
            rain +
            ');background-size:120px 100%}' +
            '.sb{background:' +
            SECTION_BG +
            ';background-image:radial-gradient(' +
            SECTION_DOT +
            ' 1.5px,transparent 1.5px),radial-gradient(' +
            SECTION_DOT +
            ' 1.5px,' +
            SECTION_BG +
            ' 1.5px);background-size:20px 20px;background-position:0 0,10px 10px}';
    let el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
};
class Decoration extends Part {
    scale = 1;
    rot = 0;
    decorationType = 0;
    texture = 0;
    interval = 0;
    shape = 0;
    count = 1;
    delay = 0;
    x1 = 0;
    y1 = 0;
    opacity = 1;
    constructor(x, y, scale, rot, decorationType, texture, args) {
        super(x, y, PART_DECORATION);
        this.scale = scale;
        this.rot = rot;
        this.decorationType = decorationType;
        this.texture = texture;
        this.x1 = x;
        this.y1 = y;
        this.active = true;
        if (decorationType === DEC_BLINKING_LIGHT) {
            this.shape = args[0] | 0;
            if (args[1] === 0) {
                this.active = false;
            }
            this.interval = args[2] == null ? 1000 : args[2];
        }
        if (decorationType === DEC_BLINKING_LIGHT_LINE) {
            this.interval = args[0] == null ? 400 : args[0];
            this.shape = args[1] | 0;
            let n = args[2] | 0;
            this.count = n < 1 ? 1 : n;
            this.x1 = args[3];
            this.y1 = args[4];
            if (args[5] > 0) {
                this.delay = args[5];
            }
            if (args[6] === 0) {
                this.active = false;
            }
        }
        if (decorationType === DEC_ICON) {
            if (args[0] == null) {
                this.opacity = 1;
            }
            else if (args[0] < 0) {
                this.opacity = 0;
            }
            else if (args[0] > 1) {
                this.opacity = 1;
            }
            else {
                this.opacity = args[0];
            }
        }
        if (decorationType === DEC_RAINBOW) {
            this.x1 = args[0] > 0 ? args[0] : 80;
            this.y1 = args[1] > 0 ? args[1] : 40;
        }
    }
}
let decorationFill = (texture) => {
    return GATE_COLORS[(texture | 0) % GATE_COLORS.length];
};
let decorationLightCount = (dec) => {
    if (dec.decorationType === DEC_BLINKING_LIGHT_LINE) {
        return dec.count < 1 ? 1 : dec.count | 0;
    }
    return 1;
};
let decorationLightAt = (dec, i) => {
    let n = decorationLightCount(dec);
    if (dec.decorationType !== DEC_BLINKING_LIGHT_LINE) {
        return { x: dec.x, y: dec.y };
    }
    if (n <= 1) {
        return { x: (dec.x + dec.x1) * 0.5, y: (dec.y + dec.y1) * 0.5 };
    }
    let t = i / (n - 1);
    return {
        x: dec.x + (dec.x1 - dec.x) * t,
        y: dec.y + (dec.y1 - dec.y) * t,
    };
};
class Field extends Part {
    w = 0;
    h = 0;
    permanent = true;
    inside = false;
    grav = 1;
    ax = 0;
    ay = 0;
    drag = 0;
    maxSpeed = 0;
    trigger = null;
    constructor(x, y, w, h, grav = 1, ax = 0, ay = 0, maxSpeed = 0) {
        super(x, y, PART_FIELD);
        this.active = true;
        this.w = w;
        this.h = h;
        this.grav = grav;
        this.ax = ax;
        this.ay = ay;
        this.maxSpeed = maxSpeed;
    }
    unactivate() {
        if (!this.permanent) {
            this.active = false;
        }
    }
    contains(px, py, ox, oy) {
        let x = this.x + ox;
        let y = this.y + oy;
        return px >= x && px <= x + this.w && py >= y && py <= y + this.h;
    }
    onEnter() {
        if (!this.trigger && this.grav === 0 && (this.ax || this.ay)) {
            playSound(SOUND_BALL_TRAVELING);
        }
    }
    onExit() { }
    preBall(ball, ox, oy, dtSeconds, g, section, _state) {
        let inNow = this.active && this.contains(ball.pos.x, ball.pos.y, ox, oy);
        if (inNow && !this.inside) {
            this.onEnter();
            if (this.trigger) {
                this.trigger.onActivated(section, ball);
            }
        }
        else if (!inNow && this.inside) {
            this.onExit();
            if (this.trigger) {
                this.trigger.onDeactivated(section);
            }
        }
        this.inside = inNow;
        if (this.trigger) {
            this.trigger.onUpdate(dtSeconds * 1000, section);
        }
        if (!inNow) {
            return g;
        }
        if (this.trigger) {
            return g;
        }
        // Conveyer / beam: zero gravity, accelerate along a direction, damp sideways
        // motion so the ball settles into the stream instead of skating across it.
        let forceLen = Math.hypot(this.ax, this.ay);
        if (this.grav === 0 && forceLen > 0) {
            let nx = this.ax / forceLen;
            let ny = this.ay / forceLen;
            let along = ball.vel.x * nx + ball.vel.y * ny;
            let catchRate = this.drag > 0 ? this.drag : 4;
            let damp = Math.max(0, 1 - catchRate * dtSeconds);
            let newAlong = along + forceLen * dtSeconds;
            if (this.maxSpeed > 0) {
                if (newAlong > this.maxSpeed) {
                    newAlong = this.maxSpeed;
                }
                else if (newAlong < -this.maxSpeed) {
                    newAlong = -this.maxSpeed;
                }
            }
            ball.vel.x = nx * newAlong + (ball.vel.x - nx * along) * damp;
            ball.vel.y = ny * newAlong + (ball.vel.y - ny * along) * damp;
            return 0;
        }
        ball.vel.x += this.ax * dtSeconds;
        ball.vel.y += this.ay * dtSeconds;
        if (this.drag > 0) {
            ball.vel = vecMul(ball.vel, Math.max(0, 1 - this.drag * dtSeconds));
        }
        if (this.maxSpeed > 0) {
            let speed = vecLen(ball.vel);
            if (speed > this.maxSpeed) {
                ball.vel = vecMul(ball.vel, this.maxSpeed / speed);
            }
        }
        return g * this.grav;
    }
}
class Launcher extends Part {
    dir;
    force = 0;
    range = LAUNCHER_RANGE;
    chargeMs = LAUNCHER_CHARGE_MS;
    len = LAUNCHER_LEN;
    charge = 0;
    pendingFire = false;
    constructor(x, y, control, dx = 0, dy = -1, force = LAUNCHER_FORCE, range = LAUNCHER_RANGE, chargeMs = LAUNCHER_CHARGE_MS, len = LAUNCHER_LEN) {
        super(x, y, PART_LAUNCHER, control);
        this.dir = vecNorm(vecCreate(dx, dy));
        this.force = force;
        this.range = range;
        this.chargeMs = chargeMs > 0 ? chargeMs : 1;
        this.len = len > 0 ? len : LAUNCHER_LEN;
    }
    /** 0..1 fill for the charge indicator. */
    getChargeT() {
        return this.charge / this.chargeMs;
    }
    activate() {
        if (!this.active) {
            playSound(SOUND_LAUNCH_PULL_BACK);
        }
        this.active = true;
    }
    unactivate() {
        if (this.active) {
            this.pendingFire = this.charge > 0;
            if (this.pendingFire) {
                playSound(SOUND_LAUNCH);
            }
        }
        this.active = false;
    }
    update(dt, _section) {
        if (this.active) {
            this.charge += dt;
            if (this.charge > this.chargeMs) {
                this.charge = this.chargeMs;
            }
        }
    }
    affectBall(ball, ox, oy) {
        if (!this.pendingFire) {
            return;
        }
        this.pendingFire = false;
        let t = this.getChargeT();
        this.charge = 0;
        let dx = ball.pos.x - (this.x + ox);
        let dy = ball.pos.y - (this.y + oy);
        if (dx * dx + dy * dy > this.range * this.range) {
            return;
        }
        ball.vel = vecMul(this.dir, this.force * t);
    }
}
let FLASH_MS = 120;
class Obstacle extends Part {
    vx = 0;
    vy = 0;
    angle = 0;
    omega = 0;
    r = 0;
    walls = [];
    worldWalls = [];
    alwaysSolid = true;
    touching = false;
    flash = 0;
    /** Closed n-gon circle (not fan spokes). */
    isCircle = false;
    isFan = false;
    icon = 0;
    color = 0;
    constructor(x, y, type, walls, vx = 0, vy = 0, omega = 0) {
        super(x, y, type);
        this.vx = vx;
        this.vy = vy;
        this.omega = omega;
        this.walls = walls;
        for (let i = 0; i < walls.length; i++) {
            this.worldWalls.push(lineCreate(0, 0, 0, 0, walls[i].rest));
        }
    }
    onHit() {
        this.activate();
        this.flash = FLASH_MS;
        if (this.isCircle) {
            playSound(SOUND_HIT_SMALL_CIRCLE);
        }
        else if (this.isFan) {
            playSound(SOUND_HIT_FAN);
        }
    }
    update(dt, section) {
        let dtSeconds = dt / 1000;
        if (this.flash > 0) {
            this.flash -= dt;
            if (this.flash <= 0) {
                this.unactivate();
            }
        }
        this.x += this.vx * dtSeconds;
        this.y += this.vy * dtSeconds;
        this.angle += this.omega * dtSeconds;
        let r = this.r;
        if (this.x < r) {
            this.x = r;
            if (this.vx < 0) {
                this.vx = -this.vx;
            }
        }
        else if (this.x > section.w - r) {
            this.x = section.w - r;
            if (this.vx > 0) {
                this.vx = -this.vx;
            }
        }
        if (this.y < r) {
            this.y = r;
            if (this.vy < 0) {
                this.vy = -this.vy;
            }
        }
        else if (this.y > section.h - r) {
            this.y = section.h - r;
            if (this.vy > 0) {
                this.vy = -this.vy;
            }
        }
    }
    affectBall(ball, ox, oy) {
        if (!this.active && !this.alwaysSolid) {
            this.touching = false;
            return;
        }
        let wx = this.x + ox;
        let wy = this.y + oy;
        let ca = Math.cos(this.angle);
        let sa = Math.sin(this.angle);
        for (let i = 0; i < this.walls.length; i++) {
            let w = this.walls[i];
            lineSet(this.worldWalls[i], w.a.x * ca - w.a.y * sa + wx, w.a.x * sa + w.a.y * ca + wy, w.b.x * ca - w.b.y * sa + wx, w.b.x * sa + w.b.y * ca + wy);
        }
        let hit = resolveBallWalls(ball, this.worldWalls, vecCreate(this.vx - this.omega * (ball.pos.y - wy), this.vy + this.omega * (ball.pos.x - wx)));
        if (hit && !this.touching) {
            this.onHit();
        }
        this.touching = hit;
    }
}
let makeCircleWalls = (r, n, rest) => {
    let walls = [];
    for (let i = 0; i < n; i++) {
        let a0 = (i / n) * Math.PI * 2;
        let a1 = ((i + 1) / n) * Math.PI * 2;
        walls.push(lineCreate(r * Math.cos(a0), r * Math.sin(a0), r * Math.cos(a1), r * Math.sin(a1), rest));
    }
    return walls;
};
/** Radial paddles from the hub out to `r`, evenly spaced around the circle. */
let makeFanWalls = (r, paddles, rest) => {
    let n = paddles < 1 ? 1 : paddles | 0;
    let walls = [];
    for (let i = 0; i < n; i++) {
        let a = (i / n) * Math.PI * 2;
        walls.push(lineCreate(0, 0, r * Math.cos(a), r * Math.sin(a), rest));
    }
    return walls;
};
let CIRCLE_SMILE = 0;
let CIRCLE_DIAMOND = 1;
let STAR_D = 'M0-1L.24-.32.95-.31.38.12.59.81 0 .4-.59.81-.38.12-.95-.31-.24-.32Z';
let DIAMOND_D = 'M0-1L1 0 0 1-1 0Z';
let circleFill = (active, color = 0) => {
    if (active) {
        return ACCENT;
    }
    return GATE_COLORS[(color | 0) % GATE_COLORS.length];
};
let circleStroke = (active) => {
    return active ? ACCENT : '#fff';
};
let obstacleStroke = (o) => {
    if (o.isCircle) {
        return circleStroke(o.active);
    }
    if (o.isFan) {
        return o.active ? ACCENT : GATE_COLORS[1];
    }
    return o.active ? ACCENT : '#888';
};
let makeCircle = (x, y, resolution, restitution, radius, vx = 0, vy = 0, omega = 0, icon, color) => {
    let o = new Obstacle(x, y, PART_OBSTACLE, makeCircleWalls(radius, resolution, restitution), vx, vy, omega);
    o.r = radius;
    o.isCircle = true;
    o.icon = icon | 0;
    o.color = color | 0;
    return o;
};
let makeFan = (x, y, paddles, restitution, radius, vx = 0, vy = 0, omega = 0) => {
    let o = new Obstacle(x, y, PART_OBSTACLE, makeFanWalls(radius, paddles, restitution), vx, vy, omega);
    o.r = radius;
    o.isFan = true;
    return o;
};
class Paddle extends Part {
    angle = 0;
    prevAngle = 0;
    restAngle = 0;
    upAngle = 0;
    len = PADDLE_LEN;
    omega = 0;
    line;
    worldLine;
    constructor(x, y, control, restAngle, upAngle, len = PADDLE_LEN) {
        super(x, y, PART_PADDLE, control);
        this.restAngle = restAngle;
        this.upAngle = upAngle;
        this.len = len;
        this.angle = restAngle;
        this.prevAngle = restAngle;
        this.line = lineCreate(x, y, x, y);
        this.worldLine = lineCreate(x, y, x, y, PADDLE_REST);
        this.syncLine();
    }
    syncLine() {
        lineSet(this.line, this.x, this.y, this.x + this.len * Math.cos(this.angle), this.y + this.len * Math.sin(this.angle));
    }
    getLine() {
        return this.line;
    }
    /** Velocity of the paddle's surface at a world point: omega cross r. */
    getSurfaceVel(p, pivotX, pivotY) {
        return vecCreate(-this.omega * (p.y - pivotY), this.omega * (p.x - pivotX));
    }
    /**
     * Which face of the paddle a world point lies on, +1 or -1, measured against
     * the paddle at `angle`.
     */
    sideOf(p, pivotX, pivotY, angle) {
        let cross = Math.cos(angle) * (p.y - pivotY) - Math.sin(angle) * (p.x - pivotX);
        return cross < 0 ? -1 : 1;
    }
    affectBall(ball, ox, oy) {
        let pivotX = this.x + ox;
        let pivotY = this.y + oy;
        let dirX = Math.cos(this.angle);
        let dirY = Math.sin(this.angle);
        lineSet(this.worldLine, pivotX, pivotY, pivotX + this.len * dirX, pivotY + this.len * dirY);
        let reach = ball.r + PADDLE_HALF_WIDTH;
        let { point, t } = lineClosestPointT(this.worldLine, ball.pos);
        let diff = vecSub(ball.pos, point);
        let dist = vecLen(diff);
        if (dist >= reach) {
            return;
        }
        // Orient the normal by the face the ball was on *before* this step's sweep.
        // Deriving it from the current position flips it the moment the paddle
        // rotates past the ball's centre, and the correction then fires the ball
        // back into the swept path to be hit again — the stick-and-drag artifact.
        let side = this.sideOf(ball.pos, pivotX, pivotY, this.prevAngle);
        let faceN = vecCreate(-dirY * side, dirX * side);
        // Along the paddle's length the contact is against its flat face; past
        // either end it is against a round cap, so the normal is radial there.
        let n = t > 0 && t < 1
            ? faceN
            : dist > 1e-6
                ? vecMul(diff, 1 / dist)
                : faceN;
        // Signed depth: negative dot means the sweep has already carried the paddle
        // through the ball, so push it back out the side it entered from.
        let depth = reach - (diff.x * n.x + diff.y * n.y);
        resolveCircleSurface(ball, n, depth, PADDLE_REST, PADDLE_FRICTION, this.getSurfaceVel(point, pivotX, pivotY));
    }
    update(dt) {
        let dtSeconds = dt / 1000;
        this.prevAngle = this.angle;
        let target = this.active ? this.upAngle : this.restAngle;
        let speed = this.active ? PADDLE_SPEED : PADDLE_RETURN;
        let maxStep = speed * dtSeconds;
        let diff = target - this.angle;
        if (Math.abs(diff) <= maxStep) {
            this.omega = dtSeconds > 0 ? diff / dtSeconds : 0;
            this.angle = target;
        }
        else {
            let dir = diff < 0 ? -1 : 1;
            this.omega = dir * speed;
            this.angle += dir * maxStep;
        }
        this.syncLine();
    }
}
/** Pair of linked mouths: hit one, travel to the other, keep velocity. */
class Portal extends Part {
    x2 = 0;
    y2 = 0;
    r = 18;
    color = 0;
    angle = 0;
    /** Until the ball leaves both mouths after a hop. */
    lock = false;
    constructor(x, y, x2, y2, r, color) {
        super(x, y, PART_PORTAL);
        this.x2 = x2;
        this.y2 = y2;
        this.r = r;
        this.color = color;
        this.active = true;
    }
    update(dt, _section) {
        this.angle += dt * 0.004;
    }
    preBall(ball, ox, oy, _dtSeconds, g, _section) {
        let b = ball;
        if (b.warpMs > 0) {
            return g;
        }
        let ax = this.x + ox;
        let ay = this.y + oy;
        let bx = this.x2 + ox;
        let by = this.y2 + oy;
        let hitR = this.r + ball.r;
        let hitR2 = hitR * hitR;
        let dax = ball.pos.x - ax;
        let day = ball.pos.y - ay;
        let dbx = ball.pos.x - bx;
        let dby = ball.pos.y - by;
        let inA = dax * dax + day * day <= hitR2;
        let inB = dbx * dbx + dby * dby <= hitR2;
        if (this.lock) {
            if (!inA && !inB) {
                this.lock = false;
            }
            return g;
        }
        if (inA) {
            ballStartWarp(b, ax, ay, bx, by);
            this.lock = true;
        }
        else if (inB) {
            ballStartWarp(b, bx, by, ax, ay);
            this.lock = true;
        }
        return g;
    }
}
let TRIGGER_DEACTIVATE_WALL = 0;
/** Collectable: 5 coins of group 0 open all gates in section 4. */
let TRIGGER_GATE_SECTION_4 = 2;
/** Field: turn a decoration light on while occupied, off when left. */
let TRIGGER_ACTIVATE_LIGHT = 3;
/** Field: play a zzfx sound when the ball enters. */
let TRIGGER_PLAY_SOUND = 5;
/**
 * Script attached to a trigger field or collectable. Occupancy / pickup is
 * owned by the part; these hooks may mutate the section (walls, parts).
 * `args` is the rest of the builder call after the trigger id.
 */
class Trigger {
    args = [];
    constructor(args) {
        this.args = args;
    }
    onActivated(_section, _ball) { }
    onDeactivated(_section) { }
    onUpdate(_dt, _section) { }
    onCollect(_section, _state, _groupType) { }
}
class DeactivateWallTrigger extends Trigger {
    rest = 0.5;
    disableIn = -1;
    enableIn = -1;
    disableWall(section) {
        let wall = section.walls[this.args[0]];
        if (!wall || wall.rest < 0) {
            return;
        }
        this.rest = wall.rest;
        wall.rest = -1;
    }
    enableWall(section) {
        let wall = section.walls[this.args[0]];
        if (!wall) {
            return;
        }
        wall.rest = this.rest;
    }
    onActivated(section) {
        this.enableIn = -1;
        if (this.args[1] > 0) {
            this.disableIn = this.args[1];
            return;
        }
        this.disableWall(section);
    }
    onDeactivated(section) {
        this.disableIn = -1;
        if (this.args[2] > 0) {
            this.enableIn = this.args[2];
            return;
        }
        this.enableWall(section);
    }
    onUpdate(dt, section) {
        if (this.disableIn >= 0) {
            this.disableIn -= dt;
            if (this.disableIn <= 0) {
                this.disableIn = -1;
                this.disableWall(section);
            }
        }
        if (this.enableIn >= 0) {
            this.enableIn -= dt;
            if (this.enableIn <= 0) {
                this.enableIn = -1;
                this.enableWall(section);
            }
        }
    }
}
let GATE4_SECTION = 4;
let GATE4_WALL = 31;
let GATE4_LIGHT = 21;
let GATE4_NEEDED = 6;
/**
 * Hardcoded collectable goal: after 6 group-0 coins, disable a wall and
 * turn on a light in section 4.
 */
class GateSection4Trigger extends Trigger {
    onCollect(_section, state, groupType) {
        if (groupType !== 0) {
            return;
        }
        if ((state.collected[0] || 0) < GATE4_NEEDED) {
            return;
        }
        let target = state.sections[GATE4_SECTION];
        if (!target) {
            return;
        }
        if (target.walls[GATE4_WALL].rest !== -1) {
            target.walls[GATE4_WALL].rest = -1;
            playSound(SOUND_SECRET);
        }
        let light = target.parts[GATE4_LIGHT];
        if (light && light.type === PART_DECORATION) {
            light.activate();
        }
    }
}
let resetGateSection4 = (sections) => {
    let target = sections[GATE4_SECTION];
    if (!target) {
        return;
    }
    let wall = target.walls[GATE4_WALL];
    if (wall && wall.rest < 0) {
        wall.rest = 0.5;
    }
    let light = target.parts[GATE4_LIGHT];
    if (light && light.type === PART_DECORATION) {
        light.unactivate();
    }
};
class ActivateLightTrigger extends Trigger {
    disableIn = -1;
    enableIn = -1;
    lightPart(section) {
        let part = section.parts[this.args[0]];
        if (!part || part.type !== PART_DECORATION) {
            return null;
        }
        return part;
    }
    enableLight(section) {
        let part = this.lightPart(section);
        if (part) {
            part.activate();
        }
    }
    disableLight(section) {
        let part = this.lightPart(section);
        if (part) {
            part.unactivate();
        }
    }
    onActivated(section) {
        this.disableIn = -1;
        if (this.args[1] > 0) {
            this.enableIn = this.args[1];
            return;
        }
        this.enableLight(section);
    }
    onDeactivated(section) {
        this.enableIn = -1;
        if (this.args[2] > 0) {
            this.disableIn = this.args[2];
            return;
        }
        this.disableLight(section);
    }
    onUpdate(dt, section) {
        if (this.enableIn >= 0) {
            this.enableIn -= dt;
            if (this.enableIn <= 0) {
                this.enableIn = -1;
                this.enableLight(section);
            }
        }
        if (this.disableIn >= 0) {
            this.disableIn -= dt;
            if (this.disableIn <= 0) {
                this.disableIn = -1;
                this.disableLight(section);
            }
        }
    }
}
class PlaySoundTrigger extends Trigger {
    onActivated() {
        let id = this.args[0] | 0;
        if (id < 0 || id > SOUND_GAME_WIN) {
            return;
        }
        playSound(id);
    }
}
let TRIGGERS = [];
TRIGGERS[TRIGGER_DEACTIVATE_WALL] = DeactivateWallTrigger;
TRIGGERS[TRIGGER_GATE_SECTION_4] = GateSection4Trigger;
TRIGGERS[TRIGGER_ACTIVATE_LIGHT] = ActivateLightTrigger;
TRIGGERS[TRIGGER_PLAY_SOUND] = PlaySoundTrigger;
{ GATE_COLORS };
let B_WALLS = 0;
let B_WALL_RESTI = 1;
let B_LAUNCHER = 2;
let B_WALL_GATE = 3;
let B_FIELD = 4;
let B_FLIPPER_LEFT = 5;
let B_CIRCLE = 6;
let B_CONVEYER = 7;
let B_COLLECTABLE = 8;
let B_FAN = 9;
let B_PORTAL = 10;
let B_TRIANGLE = 11;
let B_DECORATION = 12;
let SECTION_SIDE_BOTTOM = 0;
let SECTION_SIDE_TOP = 1;
let SECTION_SIDE_LEFT = 2;
let SECTION_SIDE_RIGHT = 3;
/**
 * Builders turn a handful of numbers into geometry. Each may push walls, parts
 * or both — a flipper pair owns its inlane slopes as much as its paddles — and
 * they expand at runtime so the data stays small and stays retunable in one
 * place.
 */
let BUILDERS = [];
BUILDERS[B_WALLS] = (section, wallList) => {
    for (let i = 0; i < wallList.length; i += 4) {
        section.walls.push(lineCreate(wallList[i], wallList[i + 1], wallList[i + 2], wallList[i + 3]));
    }
};
BUILDERS[B_WALL_RESTI] = (section, [x0, y0, x1, y1, rest]) => {
    section.walls.push(lineCreate(x0, y0, x1, y1, rest));
};
BUILDERS[B_WALL_GATE] = (section, [x0, y0, x1, y1, color]) => {
    let c = color | 0;
    section.walls.push(lineCreate(x0, y0, x1, y1, 0.5, c < 0 ? 0 : c % GATE_COLORS.length));
};
BUILDERS[B_FLIPPER_LEFT] = (section, [x, y, restAngle, upAngle, isFlipped, flipperLength]) => {
    let rest = restAngle == null ? LEFT_REST_ANGLE : restAngle;
    let up = upAngle == null ? LEFT_UP : upAngle;
    section.parts.push(new Paddle(x, y, isFlipped ? CONTROL_RIGHT : CONTROL_LEFT, isFlipped ? Math.PI - rest : rest, isFlipped ? Math.PI - up : up, flipperLength > 0 ? flipperLength : PADDLE_LEN));
};
BUILDERS[B_LAUNCHER] = (s, [x, y, dx, dy, force, range, chargeMs, launcherLength]) => {
    s.parts.push(new Launcher(x, y, CONTROL_START, dx, dy, force, range, chargeMs, launcherLength));
};
BUILDERS[B_FIELD] = (s, data) => {
    let x = data[0];
    let y = data[1];
    let w = data[2];
    let h = data[3];
    let id = data[4];
    let Ctor = TRIGGERS[id] || Trigger;
    let field = new Field(x, y, w, h);
    field.trigger = new Ctor(data.slice(5));
    s.parts.push(field);
};
BUILDERS[B_CONVEYER] = (s, [x, y, w, h, angle, power, maxSpeed, drag]) => {
    let field = new Field(x, y, w, h, 0, Math.cos(angle) * power, Math.sin(angle) * power, maxSpeed);
    field.drag = drag;
    s.parts.push(field);
};
BUILDERS[B_CIRCLE] = (section, [x, y, resolution, restitution, radius, dx, dy, omega, icon, color]) => {
    section.parts.push(makeCircle(x, y, resolution, restitution, radius, dx, dy, omega, icon, color));
};
BUILDERS[B_FAN] = (section, [x, y, paddles, restitution, radius, omega]) => {
    section.parts.push(makeFan(x, y, paddles, restitution, radius, 0, 0, omega));
};
BUILDERS[B_COLLECTABLE] = (s, [x, y]) => {
    let coin = new Collectable(x, y, 10, 0);
    coin.trigger = new GateSection4Trigger([]);
    s.parts.push(coin);
};
BUILDERS[B_PORTAL] = (s, [x0, y0, x1, y1, color]) => {
    let c = color | 0;
    s.parts.push(new Portal(x0, y0, x1, y1, 18, c < 0 ? 0 : c % GATE_COLORS.length));
};
/**
 * Right triangle at (x, y): side1 along `rot`, side2 along rot+90°.
 * Walls are pushed as hypot (resti0), side1 (resti1), side2 (resti2).
 */
let triangleVerts = (x, y, len1, len2, rot) => {
    let c = Math.cos(rot);
    let s = Math.sin(rot);
    return {
        x0: x,
        y0: y,
        x1: x + len1 * c,
        y1: y + len1 * s,
        x2: x - len2 * s,
        y2: y + len2 * c,
    };
};
/** Fixed fill color index for triangle bumpers: orange. */
let TRIANGLE_COLOR = 1;
BUILDERS[B_TRIANGLE] = (s, [x, y, sideLen1, sideLen2, rot, resti0, resti1, resti2]) => {
    let v = triangleVerts(x, y, sideLen1, sideLen2, rot);
    s.fills.push([v.x0, v.y0, v.x1, v.y1, v.x2, v.y2, TRIANGLE_COLOR]);
    s.walls.push(lineCreate(v.x1, v.y1, v.x2, v.y2, resti0, -1, SOUND_HIT_FAN));
    s.walls.push(lineCreate(v.x0, v.y0, v.x1, v.y1, resti1));
    s.walls.push(lineCreate(v.x0, v.y0, v.x2, v.y2, resti2));
};
BUILDERS[B_DECORATION] = (s, data) => {
    s.parts.push(new Decoration(data[0], data[1], data[2], data[3], data[4], data[5], data.slice(6)));
};
// assumes an edge can only have one hole in it at max
let buildSectionEdges = (sections, links) => {
    let walls = BUILDERS[B_WALLS];
    for (let i = 0; i < sections.length; i++) {
        let s = sections[i];
        let { w, h } = s;
        // bottom, top, left, right — index matches SECTION_SIDE_*
        let edges = [
            [0, h, w, h],
            [0, 0, w, 0],
            [0, 0, 0, h],
            [w, 0, w, h],
        ];
        for (let e = 0; e < 4; e++) {
            let [x0, y0, x1, y1] = edges[e];
            let o = 0;
            let g = 0;
            for (let k = 0; k < links.length; k++) {
                let l = links[k];
                if (l[0] === i && l[1] === e) {
                    o = l[2];
                    g = o + l[3];
                    break;
                }
            }
            if (g) {
                walls(s, y0 === y1
                    ? [x0, y0, o, y0, g, y0, x1, y0]
                    : [x0, y0, x0, o, x0, g, x0, y1]);
            }
            else {
                walls(s, [x0, y0, x1, y1]);
            }
        }
    }
};
let buildLevel = (sectionData, links) => {
    let sections = sectionData.map((d, i) => sectionCreate(i, d[0], d[1], d[2], d[3]));
    buildSectionEdges(sections, links);
    for (let i = 0; i < sectionData.length; i++) {
        let calls = sectionData[i][4];
        for (let j = 0; j < calls.length; j++) {
            BUILDERS[calls[j][0]](sections[i], calls[j].slice(1));
        }
    }
    return sections;
};
/**
 * x, y, w, h, builder calls.
 * Generated by the editor.
 */
let SECTIONS = [
    [
        0,
        0,
        400,
        520,
        [
            [
                B_WALLS,
                2, 301, 115, 358,
                371, 297, 224, 337,
                0, 413, 373, 473,
                350, 200, 400, 280,
                350, 200, 400, 108,
                373, 474, 373, 520,
                372, 445, 372, 300,
                0, 103, 173, 147,
                307, 167, 400, 107
            ],
            [B_FLIPPER_LEFT, 114, 369],
            [B_FLIPPER_LEFT, 307, 177, 0.45, -0.55, 1],
            [B_LAUNCHER, 387, 495, 0, -1, 840, 36, 400, 16],
            [B_CIRCLE, 162, 67, 10, 1.2, 40, 0, 0, 1.2, CIRCLE_DIAMOND, 1],
            [B_CIRCLE, 82, 256, 10, 1.2, 40, 0, 0, 1.2],
            [B_DECORATION, 19, 394, 1, 0, DEC_BLINKING_LIGHT, 0],
            [B_DECORATION, 162, 274, 1, -1.0472, DEC_BLINKING_LIGHT, 1],
            [B_DECORATION, 279, 75, 1, -1.8846, DEC_BLINKING_LIGHT, 2],
            [B_DECORATION, 386, 416, 1, -1.5708, DEC_BLINKING_LIGHT_LINE, TEX_PALETTE, 400, SHAPE_CHEVRON, 5, 386, 330, 50],
            [B_DECORATION, 198, 402, 15, -0.0091, DEC_ICON, 1, 0.25],
        ],
    ],
    [
        0,
        -400,
        400,
        400,
        [
            [
                B_WALLS,
                0, 148, 35, 69,
                149, 400, 37, 288,
                354, 400, 354, 337,
                354, 337, 169, 337,
                174, 389, 149, 399,
                0, 223, 37, 287,
                37, 67, 115, 3,
                253, 72, 359, 72,
                240, 15, 185, 0,
                359, 72, 359, 128,
                389, 73, 389, 130,
                169, 336, 169, 158,
                207, 157, 207, 229,
                168, 247, 233, 264,
                354, 336, 169, 312
            ],
            [B_LAUNCHER, 135, 369, -0.7071, -0.7071, 1150, 36, 400],
            [B_CONVEYER, 176, 341, 173, 39, 3.1416, 320, 400, 35, 6],
            [B_CONVEYER, 254, 45, 104, 23, 0.1444, 400, 160, 6],
            [B_FLIPPER_LEFT, 250, 72, 0.45, -1.4, 1],
            [B_FLIPPER_LEFT, 235, 271, 0.7, -0.5, 0, 35],
            [B_CONVEYER, 173, 160, 30, 68, 1.5708, 400, 160, 6],
            [B_CIRCLE, 284, 178, 10, 1.2, 22, 0, 0, 1.2],
            [B_DECORATION, 110, 342, 1, -2.242, DEC_BLINKING_LIGHT_LINE, 2, 400, SHAPE_CHEVRON, 5, 49, 283, 50],
            [B_DECORATION, 186, 70, 1, 1.5708, DEC_BLINKING_LIGHT_LINE, 3, 400, SHAPE_CHEVRON, 5, 186, 127, 50],
            [B_DECORATION, 188, 232, 15, -0.0091, DEC_ICON, 5, 0.25],
            [B_DECORATION, 33, 362, 2.8, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
        ],
    ],
    [
        400,
        -400,
        588,
        400,
        [
            [
                B_WALLS,
                458, 312, 94, 368,
                504, 158, 579, 193,
                588, 174, 580, 192,
                93, 368, 61, 400,
                0, 339, 61, 400,
                82, 84, 82, 278
            ],
            [B_CONVEYER, 32, 87, 45, 198, 1.5708, 400, 160, 6],
            [B_LAUNCHER, 73, 367, 0.4957, -0.8685, 970],
            [B_CIRCLE, 160, 161, 15, 1.2, 22, 0, 160, 1.2, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 249, 283, 15, 1.2, 37, 0, 150, 1.2, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 398, 50, 15, 1.2, 36, 0, 150, 1.2, CIRCLE_DIAMOND, 4],
            [B_LAUNCHER, 575, 143, 0, -1, 2500, 50, 500, 38],
            [B_CIRCLE, 336, 370, 15, 1.2, 22, 0, 250, 1.2, CIRCLE_DIAMOND, 4],
            [B_FLIPPER_LEFT, 502, 155, 0.45, -0.55, 1],
            [B_DECORATION, 163, 250, 1, -0.7849, DEC_BLINKING_LIGHT, 2],
            [B_DECORATION, 325, 159, 1, -0.6751, DEC_BLINKING_LIGHT, 3],
            [B_DECORATION, 574, 32, 1, -1.5708, DEC_BLINKING_LIGHT, 4],
        ],
    ],
    [
        400,
        0,
        588,
        107,
        [
            [B_WALLS, 588, 56, 4, 105],
            [B_DECORATION, 312, 43, 2.8, -0.0889, DEC_BLINKING_LIGHT, 3, SHAPE_SQUARE],
        ],
    ],
    [
        478,
        -1076,
        510,
        676,
        [
            [
                B_WALLS,
                482, 676, 482, 49,
                471, 0, 509, 38,
                349, 676, 0, 640,
                334, 1, 271, 64,
                265, 8, 207, 0,
                271, 63, 253, 130,
                253, 219, 253, 129,
                180, 581, 80, 522,
                337, 581, 452, 522,
                452, 522, 452, 429,
                78, 522, 78, 437,
                36, 437, 36, 643,
                34, 199, 34, 334,
                119, 285, 34, 200,
                170, 248, 56, 161,
                55, 161, 33, 161,
                17, 641, 0, 591,
                36, 592, 19, 641,
                34, 334, 119, 285,
                197, 218, 214, 160,
                214, 159, 214, 61,
                270, 63, 264, 8
            ],
            [B_FLIPPER_LEFT, 332, 586, 0.45, -0.55, 1],
            [B_FLIPPER_LEFT, 185, 586],
            [B_CIRCLE, 382, 50, 5, 1, 20, 0, 0, 2, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 317, 104, 5, 1, 20, 0, 0, 2, CIRCLE_DIAMOND, 1],
            [B_CIRCLE, 423, 114, 5, 1, 20, 0, 0, -2, CIRCLE_DIAMOND, 3],
            [B_CIRCLE, 365, 171, 5, 1, 20, 0, 0, -2, CIRCLE_DIAMOND, 5],
            [B_FIELD, 487, 68, 19, 139, TRIGGER_DEACTIVATE_WALL, 30, 0, 400],
            [B_CONVEYER, 344, 643, 133, 25, 1.5708, 400, 160, 6],
            [B_CONVEYER, 29, 166, 29, 27, -3.1416, 400, 160, 6],
            [B_LAUNCHER, 18, 577, 0, -1, 1450, 50, 600, 50],
            [B_FIELD, 8, 509, 18, 107, TRIGGER_DEACTIVATE_WALL, 29, 0, 1000],
            [B_CIRCLE, 104, 377, 10, 1.15, 44, 0, 0, -1.6],
            [B_WALL_GATE, 30, 160, 0, 128, 4],
            [B_WALL_GATE, 483, 48, 495, 27, 2],
            [B_WALL_GATE, 95, 248, 129, 219, 5],
            [B_CONVEYER, 220, 36, 25, 192, -1.5708, 900, 900, 4],
            [B_COLLECTABLE, 103, 77],
            [B_COLLECTABLE, 41, 141],
            [B_COLLECTABLE, 367, 111],
            [B_COLLECTABLE, 284, 210],
            [B_COLLECTABLE, 181, 19],
            [B_COLLECTABLE, 249, 417],
            [B_FAN, 124, 98, 4, 1, 80, -1.1],
            [B_TRIANGLE, 126, 524, 79, 44, -1.5708, 1],
            [B_TRIANGLE, 397, 524, 79, -44, -1.5708, 1],
            [B_DECORATION, 16, 55, 1, -1.5708, DEC_BLINKING_LIGHT, 5],
            [B_DECORATION, 212, 347, 2, -2.3101, DEC_BLINKING_LIGHT_LINE, TEX_PALETTE, 100, SHAPE_CHEVRON, 5, 125, 250, 25, 0],
            [B_CONVEYER, 195, 5, 49, 27, -3.1416, 400, 160, 50],
            [B_TRIANGLE, 384, 221, 79, -44, 2.9792, 1],
            [B_TRIANGLE, 429, 221, 113, -60, 1.09, 1.15],
        ],
    ],
    [
        299,
        -1629,
        270,
        553,
        [
            [
                B_WALLS,
                234, 0, 270, 32,
                254, 553, 268, 539,
                251, 552, 237, 538,
                179, 406, 179, 553,
                213, 431, 213, 553,
                179, 405, 203, 381,
                237, 537, 213, 431,
                101, 0, 73, 38,
                234, 331, 234, 294,
                234, 253, 234, 165,
                234, 125, 234, 45,
                137, 223, 232, 168,
                73, 38, 73, 79,
                73, 131, 73, 402,
                234, 44, 126, 44,
                234, 125, 127, 125,
                233, 294, 128, 374,
                174, 495, 0, 533,
                233, 331, 188, 331,
                126, 124, 126, 44,
                3, 533, 0, 553
            ],
            [B_LAUNCHER, 253, 510, 0, -1, 1650, 36, 700, 33],
            [B_WALL_GATE, 235, 164, 269, 130, 1],
            [B_WALL_GATE, 234, 292, 268, 258, 1],
            [B_FIELD, 247, 363, 19, 180, TRIGGER_DEACTIVATE_WALL, 29, 200, 600],
            [B_FIELD, 238, 374, 20, 173, TRIGGER_DEACTIVATE_WALL, 28, 200, 600],
            [B_WALL_RESTI, 137, 223, 113, 182, 0.5],
            [B_LAUNCHER, 133, 198, -0.5141, -0.8577, 540, 36, 600, 15],
            [B_FLIPPER_LEFT, 96, 421, 0.45, -0.6, 0, 48],
            [B_WALL_RESTI, 73, 402, 96, 415, 0.5],
            [B_FLIPPER_LEFT, 71, 165, 0.45, -0.55, 1, 42],
            [B_CIRCLE, 36, 312, 10, 1.25, 11, 0, 0, 1, CIRCLE_SMILE, 3],
            [B_DECORATION, 98, 134, 1, -2.2845, DEC_BLINKING_LIGHT, 0],
            [B_DECORATION, 35, 57, 1, -1.5708, DEC_BLINKING_LIGHT, 1],
            [B_DECORATION, 181, 84, 4, 0.3807, DEC_ICON, 1, 0.5],
        ],
    ],
    [
        78,
        -1076,
        400,
        676,
        [
            [
                B_WALLS,
                0, 42, 287, 112,
                218, 349, 341, 382,
                397, 495, 341, 382,
                274, 675, 2, 603,
                320, 673, 398, 615
            ],
            [B_FLIPPER_LEFT, 212, 347, 0.45, -0.9, 1],
            [B_CIRCLE, 358, 215, 6, 1.25, 29, 0, 0, 2, CIRCLE_DIAMOND, 5],
            [B_DECORATION, 72, 495, 2.8, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
            [B_DECORATION, 284, 54, 2.8, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
            [B_DECORATION, 248, 249, 1.5, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
            [B_DECORATION, 50, 646, 1.6, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
            [B_DECORATION, 274, 602, 1.5, -2.242, DEC_BLINKING_LIGHT_LINE, 2, 400, SHAPE_SQUARE, 1, 274, 533, 75],
            [B_DECORATION, 78, 202, 1.5, -2.242, DEC_BLINKING_LIGHT_LINE, 2, 400, SHAPE_SQUARE, 1, 78, 133, 25],
            [B_DECORATION, 372, 399, 1.5, -2.242, DEC_BLINKING_LIGHT_LINE, 2, 400, SHAPE_SQUARE, 1, 372, 330, 100],
        ],
    ],
    [78, -1201, 221, 125, []],
    [
        169,
        -2305,
        400,
        676,
        [
            [
                B_WALLS,
                115, 524, 44, 483,
                271, 524, 351, 484,
                39, 615, 39, 107,
                19, 676, 2, 646,
                36, 646, 19, 676,
                45, 645, 52, 676,
                39, 615, 227, 615,
                39, 587, 228, 614,
                400, 614, 236, 662,
                237, 665, 237, 676,
                274, 88, 372, 117,
                224, 1, 274, 87,
                39, 211, 68, 284,
                85, 172, 40, 110,
                68, 285, 38, 324,
                38, 54, 104, 51,
                327, 284, 400, 357,
                328, 197, 327, 107,
                329, 200, 374, 250,
                36, 645, 43, 644,
                351, 485, 351, 376,
                330, 241, 329, 201,
                330, 241, 373, 250
            ],
            [B_CONVEYER, 92, 625, 143, 49, 3.1416, 500, 160, 8],
            [B_FLIPPER_LEFT, 116, 531],
            [B_FLIPPER_LEFT, 270, 531, 0.45, -0.55, 1],
            [B_WALL_RESTI, 0, 47, 47, 0, 1.5],
            [B_CONVEYER, 52, 625, 40, 48, -2.55, 400, 160, 6],
            [B_LAUNCHER, 19, 612, 0, -1, 1250, 50, 600, 50],
            [B_PORTAL, 60, 189, 276, 28, 0],
            [B_PORTAL, 59, 80, 342, 267, 1],
            [B_WALL_RESTI, 328, 283, 400, 294, 0.15],
            [B_LAUNCHER, 362, 275, -1, 0, 1050, 36, 100],
            [B_FAN, 219, 150, 4, 0.25, 40, 1],
            [B_TRIANGLE, 70, 466, 79, 44, -1.5708, 1.25],
            [B_TRIANGLE, 313, 466, 79, -44, -1.5708, 1.25],
            [B_CONVEYER, 332, 116, 26, 82, 1.5708, 400, 160, 6],
            [B_DECORATION, 89, 191, 1, -2.0554, DEC_BLINKING_LIGHT, 1],
            [B_DECORATION, 21, 84, 1, -3.1416, DEC_BLINKING_LIGHT, 2],
            [B_DECORATION, 196, 440, 18, 0, DEC_ICON, 4, 0.33],
            [B_DECORATION, 377, 431, 1.4, -0.6751, DEC_BLINKING_LIGHT, 3, SHAPE_CIRCLE],
            [B_TRIANGLE, 365, 177, 47, -44, 0.8292, 1],
        ],
    ],
    [
        -345,
        -2305,
        416,
        515,
        [
            [
                B_WALLS,
                136, 34, 158, 38,
                0, 299, 110, 336,
                5, 510, 104, 463,
                111, 335, 137, 404,
                166, 400, 196, 331,
                196, 331, 217, 417,
                246, 416, 277, 329,
                278, 328, 305, 413,
                338, 413, 393, 324,
                0, 360, 77, 389,
                103, 463, 136, 405,
                164, 447, 139, 450,
                308, 442, 329, 445,
                67, 488, 175, 513,
                317, 512, 397, 487,
                393, 324, 416, 310
            ],
            [B_TRIANGLE, 147, 192, 60, 60, 0.7854, 0.8, 0.8, 0.8],
            [B_TRIANGLE, 221, 127, 60, 60, 0.7854, 0.8, 0.8, 0.8],
            [B_TRIANGLE, 296, 192, 60, 60, 0.7854, 0.8, 0.8, 0.8],
            [B_CONVEYER, 99, 27, 31, 107, -1.5708, 1100, 900, 60],
            [B_FLIPPER_LEFT, 163, 43, 0.45, -0.6, 0, 22],
            [B_CIRCLE, 39, 193, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND, 2],
            [B_CIRCLE, 369, 170, 3, 1, 8, 0, 0, -4, CIRCLE_DIAMOND, 5],
            [B_CIRCLE, 304, 139, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND, 5],
            [B_CIRCLE, 110, 165, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND, 1],
            [B_CIRCLE, 382, 262, 3, 1, 8, 0, 0, -4, CIRCLE_DIAMOND],
            [B_CIRCLE, 170, 280, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND],
            [B_CIRCLE, 89, 277, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND],
            [B_CIRCLE, 311, 282, 3, 1, 8, 0, 0, 4, CIRCLE_DIAMOND, 5],
            [B_CONVEYER, 90, 6, 44, 20, 0, 400, 200, 10],
            [B_CONVEYER, 4, 54, 83, 27, 0.0047, 400, 400, 40],
            [B_PORTAL, 14, 21, 129, 475, 0],
            [B_PORTAL, 20, 335, 234, 491, 1],
            [B_PORTAL, 57, 21, 340, 468, 2],
            [B_CONVEYER, 138, 370, 27, 72, 1.5708, 400, 160, 6],
            [B_CONVEYER, 217, 371, 27, 72, 1.5708, 400, 160, 6],
            [B_CONVEYER, 307, 367, 27, 72, 1.5708, 400, 160, 6],
            [B_CIRCLE, 220, 104, 3, 0.5, 8, 0, 0, -4, CIRCLE_DIAMOND, 3],
            [B_DECORATION, 381, 84, 1, -3.1416, DEC_BLINKING_LIGHT, 2],
            [B_DECORATION, 232, 317, 1, 1.5708, DEC_BLINKING_LIGHT, 3],
        ],
    ],
    [
        0,
        -2802,
        245,
        497,
        [
            [B_CONVEYER, 71, 353, 97, 136, -1.5708, 1400, 1400, 60],
            [B_CONVEYER, 71, 204, 34, 136, 0, 3000, 1400, 60],
            [B_CONVEYER, 135, 205, 32, 136, 3.1416, 3000, 1400, 60],
            [B_CONVEYER, 111, 45, 18, 308, -1.5708, 1400, 1400, 60],
            [B_PORTAL, 119, 22, 18, 475, 0],
            [B_PORTAL, 20, 23, 229, 474, 1],
            [B_CONVEYER, 9, 54, 17, 395, -1.5708, 1400, 1400, 60],
            [B_CONVEYER, 221, 53, 17, 394, -1.5708, 1400, 1400, 60],
            [B_DECORATION, 191, 464, 1, -1.5708, DEC_BLINKING_LIGHT_LINE, TEX_PALETTE, 400, SHAPE_CIRCLE, 20, 191, 28, 50],
            [B_DECORATION, 49, 467, 1, 1.5708, DEC_BLINKING_LIGHT_LINE, TEX_PALETTE, 400, SHAPE_SQUARE, 20, 49, 28, 50],
        ],
    ],
    [
        -345,
        -1667,
        339,
        528,
        [
            [
                B_WALLS,
                27, 42, 139, 42,
                0, 374, 26, 389,
                0, 440, 233, 484,
                177, 528, 337, 495,
                273, 257, 295, 289,
                337, 255, 317, 289,
                295, 313, 241, 328,
                94, 45, 71, 101,
                31, 108, 71, 101,
                296, 313, 339, 310,
                318, 290, 339, 289,
                26, 162, 45, 195,
                89, 161, 69, 194,
                46, 220, 46, 195,
                47, 221, 82, 230,
                303, 77, 335, 88
            ],
            [B_FLIPPER_LEFT, 28, 395, 0.45, -0.5, 0, 35],
            [B_CONVEYER, 34, 6, 104, 31, -3.1416, 400, 160, 6],
            [B_CONVEYER, 4, 46, 21, 76, 1.6344, 400, 160, 20],
            [B_CONVEYER, 3, 291, 23, 80, 1.5708, 400, 160, 6],
            [B_PORTAL, 166, 503, 51, 70, 0],
            [B_FLIPPER_LEFT, 238, 333, 0.45, -0.6, 1, 35],
            [B_FLIPPER_LEFT, 83, 236, 0.45, -0.5, 0, 35],
            [B_CIRCLE, 242, 98, 10, 1, 20, 0, 0, 2, CIRCLE_DIAMOND, 4],
            [B_FAN, 140, 397, 3, 1, 22, 1],
            [B_DECORATION, 108, 314, 1, -0.7854, DEC_BLINKING_LIGHT, 3],
            [B_DECORATION, 233, 196, 1, -2.3562, DEC_BLINKING_LIGHT, 4],
            [B_DECORATION, 176, 90, 1, -0.8215, DEC_BLINKING_LIGHT, 5],
            [B_DECORATION, 162, 267, 10, -0.7854, DEC_ICON, 1, 0.5],
        ],
    ],
    [
        -6,
        -1790,
        175,
        209,
        [
            [B_WALLS, 173, 202, 76, 209],
            [B_CONVEYER, 5, 39, 29, 169, -1.1812, 300, 300, 20],
            [B_LAUNCHER, 155, 170],
            [B_LAUNCHER, 106, 170],
            [B_CONVEYER, 44, 36, 28, 151, 1.5708, 100, 100, 50],
            [B_CONVEYER, 44, 186, 32, 21, 0, 800, 800, 1],
            [B_DECORATION, 131, 183, 1, -1.5708, DEC_BLINKING_LIGHT_LINE, 1, 400, SHAPE_CHEVRON, 9, 131, 17, 50, 0],
            [B_FIELD, 41, 166, 132, 42, TRIGGER_ACTIVATE_LIGHT, 5, 800, 500],
        ],
    ],
    [-424, -1879, 79, 169, []],
    [
        71,
        -2305,
        98,
        515,
        [
            [B_CIRCLE, 15, 475, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 30, 455, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 5],
            [B_CIRCLE, 44, 434, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 59, 413, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 14, 275, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 1],
            [B_CIRCLE, 29, 255, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 2],
            [B_CIRCLE, 44, 235, 10, 1, 10, 75, 0, 0, CIRCLE_SMILE, 3],
            [B_CIRCLE, 59, 215, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 4],
            [B_CIRCLE, 74, 195, 10, 1, 10, 75, 0, 0, CIRCLE_DIAMOND, 5],
            [B_CIRCLE, 75, 393, 10, 1, 10, 75],
            [B_DECORATION, 49, 84, 1, -3.1416, DEC_BLINKING_LIGHT, 2],
        ],
    ],
    [
        129,
        -2902,
        116,
        100,
        [
            [B_WALLS, 101, 5, 115, 16, 80, 96, 80, 65],
            [B_DECORATION, 1, 1, 1, 0, DEC_RAINBOW, 0, 113, 96],
            [B_FIELD, 85, 65, 29, 32, TRIGGER_PLAY_SOUND, SOUND_GAME_WIN],
        ],
    ],
    [
        -424,
        -1710,
        112,
        43,
        [
            [B_WALLS, 79, 43, 0, 26],
        ],
    ],
];
/** section, side, localOffset, width */
let LINKS = [
    [0, SECTION_SIDE_TOP, 172, 227],
    [1, SECTION_SIDE_BOTTOM, 172, 227],
    [1, SECTION_SIDE_RIGHT, 129, 138],
    [2, SECTION_SIDE_LEFT, 129, 138],
    [2, SECTION_SIDE_BOTTOM, 0, 588],
    [3, SECTION_SIDE_TOP, 0, 588],
    [0, SECTION_SIDE_RIGHT, 0, 107],
    [3, SECTION_SIDE_LEFT, 0, 107],
    [2, SECTION_SIDE_TOP, 381, 207],
    [4, SECTION_SIDE_BOTTOM, 303, 207],
    [4, SECTION_SIDE_TOP, 0, 33],
    [5, SECTION_SIDE_BOTTOM, 179, 33],
    [5, SECTION_SIDE_LEFT, 428, 107],
    [7, SECTION_SIDE_RIGHT, 0, 107],
    [6, SECTION_SIDE_TOP, 0, 221],
    [7, SECTION_SIDE_BOTTOM, 0, 221],
    [1, SECTION_SIDE_TOP, 356, 35],
    [6, SECTION_SIDE_BOTTOM, 278, 35],
    [4, SECTION_SIDE_LEFT, 437, 51],
    [6, SECTION_SIDE_RIGHT, 437, 51],
    [5, SECTION_SIDE_TOP, 0, 100],
    [8, SECTION_SIDE_BOTTOM, 130, 100],
    [11, SECTION_SIDE_RIGHT, 0, 86],
    [12, SECTION_SIDE_LEFT, 123, 86],
    [10, SECTION_SIDE_BOTTOM, 71, 98],
    [14, SECTION_SIDE_TOP, 0, 98],
    [12, SECTION_SIDE_TOP, 77, 98],
    [14, SECTION_SIDE_BOTTOM, 0, 98],
    [8, SECTION_SIDE_LEFT, 54, 35],
    [14, SECTION_SIDE_RIGHT, 54, 35],
    [9, SECTION_SIDE_RIGHT, 55, 32],
    [14, SECTION_SIDE_LEFT, 55, 32],
    [10, SECTION_SIDE_TOP, 213, 32],
    [15, SECTION_SIDE_BOTTOM, 84, 32],
    [13, SECTION_SIDE_BOTTOM, 0, 79],
    [16, SECTION_SIDE_TOP, 0, 79],
    [11, SECTION_SIDE_TOP, 0, 33],
    [16, SECTION_SIDE_BOTTOM, 79, 33],
    [9, SECTION_SIDE_LEFT, 426, 89],
    [13, SECTION_SIDE_RIGHT, 0, 89],
];
/** world x, y */
let START = [-34, -1611];
let state;
let getState = () => {
    return state;
};
let setState = (s) => {
    state = s;
};
let storedMs = (k) => {
    return Number(localStorage.getItem(k)) || 0;
};
let formatTime = (ms) => {
    return (ms / 1000).toFixed(1);
};
let sectionCenter = (sections, id) => {
    let room = sections[id];
    if (!room) {
        return { x: START[0], y: START[1] };
    }
    return {
        x: room.x + room.w * 0.5,
        y: room.y + room.h * 0.5,
    };
};
let idleBallPos = (sections) => {
    return sectionCenter(sections, COMPLETE_SECTION);
};
let startPlay = () => {
    let s = getState();
    s.playing = true;
    s.complete = false;
    s.newBest = false;
    s.playMs = 0;
    s.input[0] = false;
    s.input[1] = false;
    s.input[2] = false;
    s.collected.length = 0;
    forEachPart(s.sections, part => {
        if (part.type !== PART_COLLECTABLE) {
            return;
        }
        let coin = part;
        coin.taken = false;
        coin.active = true;
    });
    resetGateSection4(s.sections);
    s.balls[0] = ballCreate(s.startX, s.startY);
};
let finishPlay = () => {
    let s = getState();
    if (!s.playing || s.complete) {
        return;
    }
    s.playing = false;
    s.complete = true;
    s.lastMs = s.playMs;
    s.prevBestMs = s.bestMs;
    s.newBest = s.bestMs <= 0 || s.playMs < s.bestMs;
    if (s.newBest) {
        s.bestMs = s.playMs;
    }
    localStorage.setItem('lt', '' + s.lastMs);
    localStorage.setItem('bt', '' + s.bestMs);
};
let createState = () => {
    let sections = buildLevel(SECTIONS, LINKS);
    return {
        balls: [],
        sections,
        walls: flattenSectionWalls(sections),
        input: [false, false, false],
        startX: START[0],
        startY: START[1],
        collected: [],
        playing: false,
        complete: false,
        playMs: 0,
        lastMs: storedMs('lt'),
        bestMs: storedMs('bt'),
        prevBestMs: 0,
        newBest: false,
    };
};
class UiElement {
    parent = null;
    children = [];
    el = null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    isHovered = false;
    isClicked = false;
    shouldPropagateEventsToChildren = true;
    constructor(parent) {
        if (parent) {
            parent.addChild(this);
        }
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
    getChildHostEl() {
        return this.el;
    }
    removeChildAtIndex(index) {
        if (index < 0 || index >= this.children.length) {
            return;
        }
        this.children[index].parent = null;
        this.children.splice(index, 1);
    }
    addChild(child) {
        if (child.parent) {
            child.parent.removeChildAtIndex(child.parent.children.indexOf(child));
        }
        child.parent = this;
        this.children.push(child);
    }
    hit(mouseX, mouseY) {
        return (mouseX >= this.x &&
            mouseY >= this.y &&
            mouseX <= this.x + this.width &&
            mouseY <= this.y + this.height);
    }
    checkMouseDownEvent(mouseX, mouseY, button, shift = false) {
        if (this.shouldPropagateEventsToChildren) {
            for (let i = this.children.length - 1; i >= 0; i--) {
                if (this.children[i].checkMouseDownEvent(mouseX, mouseY, button, shift)) {
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
    checkMouseUpEvent(mouseX, mouseY, button) {
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
    checkHoverEvent(mouseX, mouseY) {
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
    checkMouseWheelEvent(mouseX, mouseY, delta) {
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
    checkResizeEvent(width, height) {
        for (let child of this.children) {
            child.checkResizeEvent(width, height);
        }
    }
    onMouseDown(_x, _y, _button, _shift = false) { }
    onMouseUp(_x, _y, _button) { }
    onClick(_x, _y, _button) { }
    onMouseWheel(_x, _y, _delta) { }
    build() {
        for (let child of this.children) {
            child.build();
        }
    }
    update(_dt) {
        for (let child of this.children) {
            child.update(_dt);
        }
    }
    render(dt) {
        for (let child of this.children) {
            child.render(dt);
        }
    }
}
let hudOverlay = {
    position: 'absolute',
    inset: '0',
    'z-index': '8',
    background: 'rgba(0,0,0,0.2)',
    [POINTER_EVENTS]: 'none',
};
let hudBtn = {
    position: 'absolute',
    [POINTER_EVENTS]: 'auto',
    cursor: 'pointer',
    color: SECTION_BG,
    background: ACCENT,
    border: '0',
    padding: '0',
    'font-size': '18px',
    'font-weight': 'bold',
};
let hudLabel = {
    position: 'absolute',
    left: '0',
    right: '0',
    'text-align': 'center',
    'font-size': '16px',
    [POINTER_EVENTS]: 'none',
};
let LAYER_ON = 0;
let LAYER_OFF = 1;
class Layer {
    window;
    layerState = LAYER_ON;
    uiElements = [];
    constructor(window = null) {
        this.window = window;
        if (this.window) {
            let host = this.window;
            let pos = (e) => {
                let r = host.getBoundingClientRect();
                let p = e;
                return {
                    x: p.clientX - r.left,
                    y: p.clientY - r.top,
                    b: p.button || 0,
                    d: p.deltaY || 0,
                    s: p.shiftKey,
                };
            };
            domAddEventListener(host, 'pointerdown', e => {
                let p = pos(e);
                this.onMouseDown(p.x, p.y, p.b, p.s);
            });
            domAddEventListener(host, 'pointerup', e => {
                let p = pos(e);
                this.onMouseUp(p.x, p.y, p.b);
            });
            domAddEventListener(host, 'pointermove', e => {
                let p = pos(e);
                this.onMouseHover(p.x, p.y);
            });
            addEventListener('keydown', e => {
                this.onKeyDown(e.code, e.keyCode);
            });
            addEventListener('keyup', e => {
                this.onKeyUp(e.code, e.keyCode);
            });
            addEventListener('resize', () => {
                this.onResize(host.clientWidth || innerWidth, host.clientHeight || innerHeight);
            });
            host.addEventListener('wheel', e => {
                e.preventDefault();
                let p = pos(e);
                this.onMouseWheel(p.x, p.y, p.d);
            }, { passive: false });
        }
    }
    onMouseDown(x, y, button, shift = false) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseDownEvent(x, y, button, shift)) {
                return;
            }
        }
    }
    onMouseUp(x, y, button) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseUpEvent(x, y, button)) {
                return;
            }
        }
    }
    onMouseHover(x, y) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkHoverEvent(x, y)) {
                return;
            }
        }
    }
    onMouseWheel(x, y, dir) {
        if (this.layerState !== LAYER_ON) {
            return;
        }
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            if (this.uiElements[i].checkMouseWheelEvent(x, y, dir)) {
                return;
            }
        }
    }
    onResize(width, height) {
        if (this.layerState === LAYER_OFF) {
            return;
        }
        for (let elem of this.uiElements) {
            elem.checkResizeEvent(width, height);
        }
    }
    onKeyDown(_key, _keyCode) { }
    onKeyUp(_key, _keyCode) { }
    addUiElement(element) {
        this.uiElements.push(element);
        element.build();
    }
    update(dt) {
        for (let elem of this.uiElements) {
            elem.update(dt);
        }
    }
    render(dt) {
        for (let elem of this.uiElements) {
            elem.render(dt);
        }
    }
}
class CompleteHud extends UiElement {
    timeEl = null;
    bestEl = null;
    newEl = null;
    btnEl = null;
    onRestart;
    constructor(onRestart) {
        super();
        this.onRestart = onRestart;
    }
    hide() {
        if (this.el) {
            setStyle(this.el, { display: 'none' });
        }
    }
    show() {
        this.readTimes();
        if (this.el) {
            setStyle(this.el, { display: 'block' });
        }
    }
    layout(width, height) {
        let bw = 180;
        let bh = 44;
        this.width = bw;
        this.height = bh;
        this.x = (width - bw) * 0.5;
        this.y = height * 0.5 + 28;
        if (this.btnEl) {
            setStyle(this.btnEl, {
                left: px(this.x),
                top: px(this.y),
                width: px(bw),
                height: px(bh),
            });
        }
        if (this.timeEl) {
            setStyle(this.timeEl, { top: px(this.y - 88) });
        }
        if (this.bestEl) {
            setStyle(this.bestEl, { top: px(this.y - 64) });
        }
        if (this.newEl) {
            setStyle(this.newEl, { top: px(this.y - 36) });
        }
    }
    checkResizeEvent(width, height) {
        this.layout(width, height);
        super.checkResizeEvent(width, height);
    }
    build() {
        let root = getGameRoot();
        if (!root) {
            return;
        }
        let overlay = createElement(DIV);
        setStyle(overlay, { ...hudOverlay, display: 'none' });
        let timeEl = createElement(DIV);
        setStyle(timeEl, { ...hudLabel, color: ACCENT });
        appendChild(overlay, timeEl);
        let bestEl = createElement(DIV);
        setStyle(bestEl, { ...hudLabel, color: '#8cf' });
        appendChild(overlay, bestEl);
        let newEl = createElement(DIV);
        setStyle(newEl, {
            ...hudLabel,
            color: '#6c6',
            'font-weight': 'bold',
        });
        appendChild(overlay, newEl);
        let btn = createElement('button');
        btn[INNER_HTML] = 'Restart';
        setStyle(btn, hudBtn);
        domAddEventListener(btn, 'click', () => {
            this.onRestart();
        });
        appendChild(overlay, btn);
        appendChild(root, overlay);
        this.el = overlay;
        this.timeEl = timeEl;
        this.bestEl = bestEl;
        this.newEl = newEl;
        this.btnEl = btn;
        this.layout(root.clientWidth || innerWidth, root.clientHeight || innerHeight);
    }
    readTimes() {
        let state = getState();
        if (this.timeEl) {
            this.timeEl[INNER_HTML] = 'time: ' + formatTime(state.lastMs);
        }
        if (this.bestEl) {
            this.bestEl[INNER_HTML] =
                'best time: ' +
                    (state.prevBestMs > 0 ? formatTime(state.prevBestMs) : '--');
        }
        if (this.newEl) {
            this.newEl[INNER_HTML] = state.newBest ? 'New best time!' : '';
        }
    }
}
class GameCompleteUiLayer extends Layer {
    hud;
    constructor(host) {
        super(host);
        this.hud = new CompleteHud(() => {
            this.onRestart();
        });
        this.addUiElement(this.hud);
        this.onResize(host.clientWidth || innerWidth, host.clientHeight || innerHeight);
    }
    onRestart() {
        startPlay();
        playSound(SOUND_START_GAME);
        this.hud.hide();
    }
    update(dt) {
        super.update(dt);
        let state = getState();
        if (!state.playing || state.complete) {
            return;
        }
        let ball = state.balls[0];
        if (!ball) {
            return;
        }
        let section = findSectionAt(state.sections, ball.pos.x, ball.pos.y, null);
        if (!section || section.id !== COMPLETE_SECTION) {
            return;
        }
        finishPlay();
        this.hud.show();
        this.onResize(this.window ? this.window.clientWidth || innerWidth : innerWidth, this.window ? this.window.clientHeight || innerHeight : innerHeight);
    }
}
// the smaller this is, the smaller the physics step and
// less chance the ball phases through walls, but more cpu power used
let PHYSICS_DT_MS = 4;
class LayerManager {
    last = performance.now();
    acc = 0;
    layers;
    constructor(layers) {
        this.layers = layers;
    }
    start() {
        this.updateRender(0);
        requestAnimationFrame(this.loop);
    }
    integrate(dt) {
        for (let layer of this.layers) {
            if (layer.layerState === LAYER_ON) {
                layer.update(dt);
            }
        }
    }
    updateRender(dt) {
        for (let layer of this.layers) {
            if (layer.layerState === LAYER_OFF) {
                continue;
            }
            layer.render(dt);
        }
    }
    loop = (t) => {
        let dt = Math.min(33, t - this.last);
        this.last = t;
        this.acc += dt;
        while (this.acc >= PHYSICS_DT_MS) {
            this.integrate(PHYSICS_DT_MS);
            this.acc -= PHYSICS_DT_MS;
        }
        this.updateRender(dt);
        requestAnimationFrame(this.loop);
    };
}
class MenuHud extends UiElement {
    lastEl = null;
    bestEl = null;
    btnEl = null;
    onStart;
    constructor(onStart) {
        super();
        this.onStart = onStart;
    }
    hide() {
        if (this.el) {
            setStyle(this.el, { display: 'none' });
        }
    }
    layout(width, height) {
        let bw = 180;
        let bh = 44;
        this.width = bw;
        this.height = bh;
        this.x = (width - bw) * 0.5;
        this.y = height * 0.5 - 36;
        if (this.btnEl) {
            setStyle(this.btnEl, {
                left: px(this.x),
                top: px(this.y),
                width: px(bw),
                height: px(bh),
            });
        }
        if (this.lastEl) {
            setStyle(this.lastEl, { top: px(this.y + this.height + 16) });
        }
        if (this.bestEl) {
            setStyle(this.bestEl, { top: px(this.y + this.height + 40) });
        }
    }
    checkResizeEvent(width, height) {
        this.layout(width, height);
        super.checkResizeEvent(width, height);
    }
    build() {
        let root = getGameRoot();
        if (!root) {
            return;
        }
        let overlay = createElement(DIV);
        setStyle(overlay, hudOverlay);
        let btn = createElement('button');
        btn[INNER_HTML] = 'Start Game';
        setStyle(btn, hudBtn);
        domAddEventListener(btn, 'click', () => {
            this.onStart();
        });
        appendChild(overlay, btn);
        let lastEl = createElement(DIV);
        setStyle(lastEl, { ...hudLabel, color: ACCENT });
        appendChild(overlay, lastEl);
        let bestEl = createElement(DIV);
        setStyle(bestEl, { ...hudLabel, color: '#8cf' });
        appendChild(overlay, bestEl);
        appendChild(root, overlay);
        this.el = overlay;
        this.btnEl = btn;
        this.lastEl = lastEl;
        this.bestEl = bestEl;
        this.readTimes();
        this.layout(root.clientWidth || innerWidth, root.clientHeight || innerHeight);
    }
    readTimes() {
        let state = getState();
        if (this.lastEl) {
            this.lastEl[INNER_HTML] = 'last time: ' + formatTime(state.lastMs);
        }
        if (this.bestEl) {
            this.bestEl[INNER_HTML] = 'best time: ' + formatTime(state.bestMs);
        }
    }
}
class MenuUiLayer extends Layer {
    hud;
    constructor(host) {
        super(host);
        this.hud = new MenuHud(() => {
            this.onStart();
        });
        this.addUiElement(this.hud);
        this.onResize(host.clientWidth || innerWidth, host.clientHeight || innerHeight);
    }
    onStart() {
        startPlay();
        playSound(SOUND_START_GAME);
        this.hud.hide();
        this.layerState = LAYER_OFF;
    }
}
let updateBallMotion = (ball, dtSeconds, gravity = GRAVITY) => {
    circleIntegrate(ball, dtSeconds, gravity);
};
let clampBallSpeed = (ball, maxSpeed = MAX_BALL_SPEED) => {
    let speed = vecLen(ball.vel);
    if (speed > maxSpeed) {
        ball.vel = vecMul(ball.vel, maxSpeed / speed);
    }
};
let updateParts = (state, dt) => {
    forEachPart(state.sections, (part, section) => {
        // Only player-driven parts follow the input; everything else owns its own
        // active flag (bumper flash timers, permanent fields).
        if (part.control >= 0) {
            let inSection = false;
            for (let i = 0; i < state.balls.length; i++) {
                let p = state.balls[i].pos;
                if (sectionContains(section, p.x, p.y)) {
                    inSection = true;
                    break;
                }
            }
            if (state.input[part.control] && inSection) {
                if (!part.active && part.type === PART_PADDLE) {
                    playSound(SOUND_PADDLE_FLIPPER);
                }
                part.activate();
            }
            else {
                if (part.active && part.type === PART_PADDLE) {
                    playSound(SOUND_PADDLE_FLIPPER_DOWN);
                }
                part.unactivate();
            }
        }
        part.update(dt, section);
    });
};
/** Applies pre-integration forces and returns the gravity to integrate with. */
let preBallParts = (ball, state, dtSeconds) => {
    let g = GRAVITY;
    forEachPart(state.sections, (part, section) => {
        g = part.preBall(ball, section.x, section.y, dtSeconds, g, section, state);
    });
    return g;
};
let resolveBallParts = (ball, state) => {
    forEachPart(state.sections, (part, section) => {
        part.affectBall(ball, section.x, section.y);
    });
};
let updateSimulation = (state, dt) => {
    let dtSeconds = dt / 1000;
    updateParts(state, dt);
    for (let i = 0; i < state.balls.length; i++) {
        let ball = state.balls[i];
        if (ball.warpMs > 0) {
            ballUpdateWarp(ball, dt);
            continue;
        }
        let g = preBallParts(ball, state, dtSeconds);
        if (ball.warpMs > 0) {
            continue;
        }
        updateBallMotion(ball, dtSeconds, g);
        flattenSectionWalls(state.sections, state.walls);
        resolveBallWalls(ball, state.walls);
        resolveBallParts(ball, state);
        // A paddle sweeping into a ball can push it through a wall, so give the
        // walls the last word on position.
        resolveBallWalls(ball, state.walls);
        clampBallSpeed(ball);
        if (ballIsOutOfBounds(ball, state.sections)) {
            if (state.playing) {
                state.balls[i] = ballCreate(state.startX, state.startY);
            }
            else {
                let spawn = idleBallPos(state.sections);
                state.balls[i] = ballCreate(spawn.x, spawn.y);
            }
        }
    }
    clearSoundsPlayedThisTick();
};
class SimLayer extends Layer {
    update(dt) {
        let state = getState();
        if (state.playing) {
            state.playMs += dt;
        }
        updateSimulation(state, dt);
    }
    render(dt) {
        // drawBall(this.views.ball, this.game.ball);
        // drawPaddle(this.views.leftPaddle, this.game.leftPaddle);
        // drawPaddle(this.views.rightPaddle, this.game.rightPaddle);
        // super.render(deltaTime);
    }
}
class BallElement extends UiElement {
    ball;
    circleEl = null;
    constructor(ball, parent) {
        super(parent);
        this.ball = ball;
    }
    build() {
        let ball = this.ball;
        let size = ball.r * 2;
        this.width = size;
        this.height = size;
        let svg = createSvgElement(SVG, {
            width: stringify(size),
            height: stringify(size),
            viewBox: '0 0 ' + size + ' ' + size,
        });
        let circle = createSvgElement(CIRCLE, {
            cx: stringify(ball.r),
            cy: stringify(ball.r),
            r: stringify(ball.r),
            fill: ball.color,
            'fill-opacity': '0.75',
        });
        svg.appendChild(circle);
        this.circleEl = circle;
        setStyle(svg, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            [POINTER_EVENTS]: 'none',
        });
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, svg);
        }
        this.el = svg;
        this.syncPos();
    }
    update(_dt) {
        this.syncPos();
    }
    render(_dt) { }
    syncPos() {
        let ball = this.ball;
        let size = ball.r * 2;
        this.width = size;
        this.height = size;
        this.x = ball.pos.x - ball.r;
        this.y = ball.pos.y - ball.r;
        if (this.el) {
            let sizeStr = stringify(size);
            setAttribute(this.el, 'width', sizeStr);
            setAttribute(this.el, 'height', sizeStr);
            setAttribute(this.el, 'viewBox', '0 0 ' + sizeStr + ' ' + sizeStr);
            setStyle(this.el, {
                left: px(this.x),
                top: px(this.y),
            });
        }
        if (this.circleEl) {
            let r = stringify(ball.r);
            let el = this.circleEl;
            setAttribute(el, 'cx', r);
            setAttribute(el, 'cy', r);
            setAttribute(el, 'r', r);
            setAttribute(el, 'fill', ball.color);
        }
    }
}
let addPortalMouth = (host, cx, cy, r, fill) => {
    let rx = r * 0.55;
    let ry = r;
    let g = createSvgElement('g', {
        transform: 'translate(' + stringify(cx) + ' ' + stringify(cy) + ')',
    });
    g.appendChild(createSvgElement('ellipse', {
        cx: '0',
        cy: '0',
        rx: stringify(rx),
        ry: stringify(ry),
        fill,
        stroke: '#fff',
        'stroke-width': '2',
    }));
    let spin = createSvgElement('g');
    spin.appendChild(createSvgElement('ellipse', {
        cx: '0',
        cy: '0',
        rx: stringify(rx * 0.35),
        ry: stringify(ry * 0.7),
        fill: 'none',
        stroke: '#000',
        'stroke-width': '1.5',
    }));
    g.appendChild(spin);
    host.appendChild(g);
    return spin;
};
let addDecorationShape = (g, shape) => {
    if (shape === SHAPE_CIRCLE) {
        g.appendChild(createSvgElement(CIRCLE, {
            r: '8',
            'stroke-width': '3',
        }));
        return;
    }
    if (shape === SHAPE_SQUARE) {
        g.appendChild(createSvgElement('rect', {
            x: '-8',
            y: '-8',
            width: '16',
            height: '16',
            'stroke-width': '3',
        }));
        return;
    }
    g.appendChild(createSvgElement('path', {
        d: CHEVRON_D,
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    }));
};
let addDecorationIcon = (g, dec) => {
    g.appendChild(createSvgElement('path', {
        d: STAR_D,
        fill: decorationFill(dec.texture),
        transform: 'scale(9)',
    }));
};
let syncDecorationLight = (wrap, dec) => {
    setAttribute(wrap, 'opacity', dec.active ? '1' : '0.2');
    let anim = lightAnimation(dec);
    let kids = wrap.children;
    for (let i = 0; i < kids.length; i++) {
        let g = kids[i];
        let style = {
            animation: anim,
        };
        style['animation-delay'] =
            dec.delay && anim !== 'none' ? stringify(i * dec.delay) + 'ms' : '0ms';
        setStyle(g, style);
    }
};
let addCircleGlyph = (svg, o) => {
    let disc = createSvgElement(CIRCLE, {
        r: stringify(o.r),
        fill: circleFill(o.active, o.color),
    });
    svg.appendChild(disc);
    let g = createSvgElement('g', {
        transform: 'scale(' + stringify(o.r * 0.7) + ')',
    });
    if (o.icon === CIRCLE_DIAMOND) {
        g.appendChild(createSvgElement('path', {
            d: DIAMOND_D,
            fill: SECTION_BG,
        }));
    }
    else {
        g.appendChild(createSvgElement(CIRCLE, {
            cx: '-.32',
            cy: '-.22',
            r: '.13',
            fill: SECTION_BG,
        }));
        g.appendChild(createSvgElement(CIRCLE, {
            cx: '.32',
            cy: '-.22',
            r: '.13',
            fill: SECTION_BG,
        }));
        g.appendChild(createSvgElement('path', {
            d: 'M-.4.22A.48.48 0 0 0 .4.22',
            fill: 'none',
            stroke: SECTION_BG,
            'stroke-width': '.12',
            'stroke-linecap': 'round',
        }));
    }
    svg.appendChild(g);
    return disc;
};
class PartElement extends UiElement {
    part;
    lineEls = [];
    spiralEls = [];
    lightWrap = null;
    lightOn = true;
    discEl = null;
    constructor(part, parent) {
        super(parent);
        this.part = part;
    }
    attach(el) {
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, el);
        }
        this.el = el;
    }
    addLine(host, x1, y1, x2, y2, stroke, width) {
        let el = createSvgElement(LINE, {
            x1: stringify(x1),
            y1: stringify(y1),
            x2: stringify(x2),
            y2: stringify(y2),
            stroke,
            'stroke-width': width,
            'stroke-linecap': 'round',
        });
        host.appendChild(el);
        this.lineEls.push(el);
    }
    build() {
        let part = this.part;
        this.setPos(part.x, part.y);
        if (part.type === PART_PORTAL) {
            let portal = part;
            let fill = GATE_COLORS[portal.color] || GATE_COLORS[0];
            let svg = createSvgElement(SVG, {
                width: '1',
                height: '1',
            });
            setStyle(svg, {
                position: 'absolute',
                left: '0',
                top: '0',
                overflow: 'visible',
                [POINTER_EVENTS]: 'none',
            });
            this.spiralEls.push(addPortalMouth(svg, portal.x, portal.y, portal.r, fill));
            this.spiralEls.push(addPortalMouth(svg, portal.x2, portal.y2, portal.r, fill));
            this.attach(svg);
            this.render(0);
            return;
        }
        if (part.type === PART_COLLECTABLE) {
            let coin = part;
            let d = coin.r * 2;
            let el = createElement(DIV);
            setStyle(el, {
                position: 'absolute',
                left: px(coin.x - coin.r),
                top: px(coin.y - coin.r),
                width: px(d),
                height: px(d),
                'border-radius': '50%',
                background: ACCENT,
                [POINTER_EVENTS]: 'none',
            });
            this.attach(el);
            this.render(0);
            return;
        }
        if (part.type === PART_DECORATION) {
            let dec = part;
            if (dec.decorationType === DEC_RAINBOW) {
                let el = createElement(DIV);
                el.className = 'tr';
                setStyle(el, {
                    position: 'absolute',
                    left: px(dec.x),
                    top: px(dec.y),
                    width: px(dec.x1),
                    height: px(dec.y1),
                    [TRANSFORM]: 'rotate(' + stringify((dec.rot * 180) / Math.PI) + 'deg)',
                    'transform-origin': '0 0',
                    [POINTER_EVENTS]: 'none',
                });
                this.attach(el);
                return;
            }
            let svg = createSvgElement(SVG, {
                width: '1',
                height: '1',
            });
            setStyle(svg, {
                position: 'absolute',
                left: '0',
                top: '0',
                overflow: 'visible',
                [POINTER_EVENTS]: 'none',
            });
            let wrap = createSvgElement('g', {});
            if (dec.decorationType === DEC_ICON) {
                let g = createSvgElement('g', {
                    transform: 'translate(' +
                        stringify(dec.x) +
                        ' ' +
                        stringify(dec.y) +
                        ') rotate(' +
                        stringify((dec.rot * 180) / Math.PI) +
                        ') scale(' +
                        stringify(dec.scale) +
                        ')',
                    opacity: stringify(dec.opacity),
                });
                addDecorationIcon(g, dec);
                wrap.appendChild(g);
                svg.appendChild(wrap);
                this.attach(svg);
                return;
            }
            let n = decorationLightCount(dec);
            let rot = stringify((dec.rot * 180) / Math.PI);
            let sc = stringify(dec.scale);
            for (let i = 0; i < n; i++) {
                let p = decorationLightAt(dec, i);
                let g = createSvgElement('g', {
                    transform: 'translate(' +
                        stringify(p.x) +
                        ' ' +
                        stringify(p.y) +
                        ') rotate(' +
                        rot +
                        ') scale(' +
                        sc +
                        ')',
                    class: getTextureClass(dec.texture),
                });
                addDecorationShape(g, dec.shape);
                wrap.appendChild(g);
            }
            svg.appendChild(wrap);
            this.lightWrap = wrap;
            this.lightOn = dec.active;
            syncDecorationLight(wrap, dec);
            this.attach(svg);
            return;
        }
        if (part.type === PART_FIELD) {
            let field = part;
            if (field.trigger) {
                return;
            }
            this.width = field.w;
            this.height = field.h;
            let el = createElement(DIV);
            setStyle(el, {
                position: 'absolute',
                left: px(field.x),
                top: px(field.y),
                width: px(field.w),
                height: px(field.h),
                [POINTER_EVENTS]: 'none',
            });
            let forceLen = Math.hypot(field.ax, field.ay);
            if (field.grav === 0 && forceLen > 0) {
                el.className = getTextureClass(TEX_ARROWS);
                setStyle(el, {
                    '--r': stringify((Math.atan2(field.ay, field.ax) * 180) / Math.PI) + 'deg',
                });
            }
            this.attach(el);
            this.render(0);
            return;
        }
        let svg = createSvgElement(SVG, {
            width: '1',
            height: '1',
        });
        setStyle(svg, {
            position: 'absolute',
            left: px(part.x),
            top: px(part.y),
            overflow: 'visible',
            [POINTER_EVENTS]: 'none',
        });
        if (part.type === PART_PADDLE) {
            let line = part.getLine();
            this.addLine(svg, 0, 0, line.b.x - line.a.x, line.b.y - line.a.y, '#ccc', '6');
        }
        else if (part.type === PART_LAUNCHER) {
            let launcher = part;
            let dir = launcher.dir;
            let drawLen = launcher.len;
            this.addLine(svg, 0, 0, -dir.x * drawLen, -dir.y * drawLen, '#c84', '8');
            this.addLine(svg, 0, 0, 0, 0, ACCENT, '8');
        }
        else {
            let obstacle = part;
            if (obstacle.isCircle) {
                this.discEl = addCircleGlyph(svg, obstacle);
            }
            let walls = obstacle.walls;
            for (let i = 0; i < walls.length; i++) {
                let w = walls[i];
                this.addLine(svg, w.a.x, w.a.y, w.b.x, w.b.y, obstacleStroke(obstacle), '4');
            }
        }
        this.attach(svg);
    }
    update(_dt) {
        let part = this.part;
        let first = this.lineEls[0];
        if (part.type === PART_PORTAL) {
            let portal = part;
            let deg = (portal.angle * 180) / Math.PI;
            for (let i = 0; i < this.spiralEls.length; i++) {
                setAttribute(this.spiralEls[i], 'transform', 'rotate(' + stringify(deg) + ')');
            }
            return;
        }
        if (part.type === PART_COLLECTABLE) {
            let coin = part;
            if (this.el) {
                setStyle(this.el, {
                    display: coin.taken ? 'none' : 'block',
                    left: px(coin.x - coin.r),
                    top: px(coin.y - coin.r),
                });
            }
            return;
        }
        if (part.type === PART_DECORATION) {
            let wrap = this.lightWrap;
            if (!wrap) {
                return;
            }
            let dec = part;
            if (this.lightOn === dec.active) {
                return;
            }
            this.lightOn = dec.active;
            syncDecorationLight(wrap, dec);
            return;
        }
        if (part.type === PART_PADDLE) {
            if (first) {
                let line = part.getLine();
                setAttribute(first, 'x2', stringify(line.b.x - line.a.x));
                setAttribute(first, 'y2', stringify(line.b.y - line.a.y));
            }
            return;
        }
        if (part.type === PART_LAUNCHER) {
            let launcher = part;
            let fill = this.lineEls[1];
            if (first) {
                setAttribute(first, 'stroke', '#c84');
                setAttribute(first, 'x2', stringify(-launcher.dir.x * launcher.len));
                setAttribute(first, 'y2', stringify(-launcher.dir.y * launcher.len));
            }
            if (fill) {
                let t = launcher.getChargeT();
                let len = launcher.len * t;
                setAttribute(fill, 'x2', stringify(-launcher.dir.x * len));
                setAttribute(fill, 'y2', stringify(-launcher.dir.y * len));
                setAttribute(fill, 'stroke', t >= 1 ? '#fc8' : '#fa6');
            }
            return;
        }
        if (part.type === PART_FIELD) {
            return;
        }
        let obstacle = part;
        if (this.el) {
            setStyle(this.el, {
                left: px(obstacle.x),
                top: px(obstacle.y),
                'transform-origin': '0 0',
                [TRANSFORM]: 'rotate(' + obstacle.angle + 'rad)',
            });
        }
        let stroke = obstacleStroke(obstacle);
        if (this.discEl) {
            setAttribute(this.discEl, 'fill', circleFill(obstacle.active, obstacle.color));
        }
        for (let i = 0; i < this.lineEls.length; i++) {
            setAttribute(this.lineEls[i], 'stroke', stroke);
        }
    }
}
class BoardSection extends UiElement {
    section;
    wallEls = [];
    constructor(section, parent) {
        super(parent);
        this.section = section;
        this.setPos(section.x, section.y);
        this.width = section.w;
        this.height = section.h;
    }
    build() {
        let section = this.section;
        let el = createElement(DIV);
        el.className = 'sb';
        setStyle(el, {
            position: 'absolute',
            left: px(section.x),
            top: px(section.y),
            width: px(section.w),
            height: px(section.h),
        });
        let svg = createSvgElement(SVG, {
            width: stringify(section.w),
            height: stringify(section.h),
            viewBox: '0 0 ' + section.w + ' ' + section.h,
        });
        setStyle(svg, {
            position: 'absolute',
            inset: '0',
        });
        for (let i = 0; i < section.fills.length; i++) {
            let f = section.fills[i];
            svg.appendChild(createSvgElement('path', {
                'd': 'M' +
                    stringify(f[0]) +
                    ' ' +
                    stringify(f[1]) +
                    'L' +
                    stringify(f[2]) +
                    ' ' +
                    stringify(f[3]) +
                    'L' +
                    stringify(f[4]) +
                    ' ' +
                    stringify(f[5]) +
                    'Z',
                fill: GATE_COLORS[(f[6] | 0) % GATE_COLORS.length],
            }));
        }
        for (let wall of section.walls) {
            let gate = wall.color >= 0;
            let stroke = gate
                ? GATE_COLORS[wall.color % GATE_COLORS.length] || ACCENT
                : '#888';
            let attrs = {
                x1: stringify(wall.a.x),
                y1: stringify(wall.a.y),
                x2: stringify(wall.b.x),
                y2: stringify(wall.b.y),
                stroke,
                'stroke-width': gate ? '6' : '4',
                'stroke-linecap': 'round',
            };
            if (gate) {
                attrs['stroke-dasharray'] = '10 6';
            }
            let line = createSvgElement(LINE, attrs);
            svg.appendChild(line);
            this.wallEls.push(line);
        }
        appendChild(el, svg);
        let host = this.parent && this.parent.getChildHostEl();
        if (host) {
            appendChild(host, el);
        }
        this.el = el;
        for (let i = 0; i < section.parts.length; i++) {
            let child = new PartElement(section.parts[i]);
            this.addChild(child);
            child.build();
        }
    }
    render(dt) {
        let walls = this.section.walls;
        for (let i = 0; i < this.wallEls.length; i++) {
            let wall = walls[i];
            let gate = wall.color >= 0;
            let stroke = wall.rest < 0
                ? 'rgba(136,136,136,0.2)'
                : gate
                    ? GATE_COLORS[wall.color % GATE_COLORS.length] || ACCENT
                    : '#888';
            setAttribute(this.wallEls[i], 'stroke', stroke);
        }
        super.render(dt);
    }
}
let CAM_SCALE_MIN = 0.25;
let CAM_SCALE_MAX = 8;
let CAM_SCALE_STEP = 1.1;
let CAM_PAN_MS = 300;
/** Applied after fitting the section in the viewport. 1 = exact fit; lower = zoomed out. */
let CAM_ZOOM_FACTOR = 0.85;
/** Sections smaller than this on both axes skip fit-zoom and use CAM_SMALL_SCALE. */
let CAM_SMALL_SIZE = 250;
let CAM_SMALL_SCALE = 3;
/** Menu camera tour: section ids, then milliseconds per pan. */
let CAM_MENU_TOUR = [2, 12, 8];
let CAM_MENU_TOUR_MS = 20000;
let clampCamScale = (scale) => {
    if (scale < CAM_SCALE_MIN) {
        return CAM_SCALE_MIN;
    }
    if (scale > CAM_SCALE_MAX) {
        return CAM_SCALE_MAX;
    }
    return scale;
};
let getCamLook = (section) => {
    return {
        x: section.x + section.w / 2,
        y: section.y + section.h / 2,
    };
};
let getCamFitScale = (section, viewW, viewH) => {
    if (section.w < CAM_SMALL_SIZE && section.h < CAM_SMALL_SIZE) {
        return CAM_SMALL_SCALE;
    }
    let fit = Math.min(viewW / section.w, viewH / section.h);
    return clampCamScale(fit * CAM_ZOOM_FACTOR);
};
let getCamPan = (lookX, lookY, viewW, viewH, scale) => {
    return {
        x: lookX - viewW / (2 * scale),
        y: lookY - viewH / (2 * scale),
    };
};
let lerpCam = (cur, target, dt) => {
    let t = Math.min(1, dt / CAM_PAN_MS);
    return cur + (target - cur) * t;
};
let getMenuTourCam = (ms, sections, viewW, viewH) => {
    let n = CAM_MENU_TOUR.length;
    let period = CAM_MENU_TOUR_MS * n;
    let tms = ms % period;
    let leg = (tms / CAM_MENU_TOUR_MS) | 0;
    let t = (tms - leg * CAM_MENU_TOUR_MS) / CAM_MENU_TOUR_MS;
    let u = t * t * (3 - 2 * t);
    let a = sections[CAM_MENU_TOUR[leg]];
    let b = sections[CAM_MENU_TOUR[(leg + 1) % n]];
    let lookA = getCamLook(a);
    let lookB = getCamLook(b);
    let scaleA = getCamFitScale(a, viewW, viewH);
    let scaleB = getCamFitScale(b, viewW, viewH);
    return {
        x: lookA.x + (lookB.x - lookA.x) * u,
        y: lookA.y + (lookB.y - lookA.y) * u,
        scale: scaleA + (scaleB - scaleA) * u,
        section: a,
    };
};
class Board extends UiElement {
    worldEl = null;
    balls = [];
    section = null;
    camX = 0;
    camY = 0;
    camScale = 1;
    lookX = 0;
    lookY = 0;
    targetLookX = 0;
    targetLookY = 0;
    targetScale = 1;
    wasPlaying = false;
    menuTourMs = 0;
    constructor() {
        super();
        this.shouldPropagateEventsToChildren = false;
    }
    getChildHostEl() {
        return this.worldEl;
    }
    addBall(ball) {
        let el = new BallElement(ball);
        this.addChild(el);
        if (this.worldEl) {
            el.build();
        }
        return el;
    }
    removeBall(ball) {
        let i = this.balls.indexOf(ball);
        if (i < 0) {
            return;
        }
        this.removeChildAtIndex(this.children.indexOf(ball));
    }
    syncBalls() {
        let state = getState();
        for (let ball of state.balls) {
            if (!this.balls.some(el => {
                return el.ball === ball;
            })) {
                this.addBall(ball);
            }
        }
        for (let el of this.balls.slice()) {
            if (state.balls.indexOf(el.ball) < 0) {
                this.removeBall(el);
            }
        }
    }
    addChild(child) {
        super.addChild(child);
        if (child instanceof BallElement && this.balls.indexOf(child) < 0) {
            this.balls.push(child);
        }
    }
    removeChildAtIndex(index) {
        let child = this.children[index];
        if (child instanceof BallElement) {
            let i = this.balls.indexOf(child);
            if (i >= 0) {
                this.balls.splice(i, 1);
            }
        }
        let host = this.getChildHostEl();
        if (child && child.el && host) {
            removeChild(host, child.el);
        }
        super.removeChildAtIndex(index);
    }
    readViewSize() {
        let root = getGameRoot();
        let w = (root && root.clientWidth) || innerWidth;
        let h = (root && root.clientHeight) || innerHeight;
        this.width = w;
        this.height = h;
    }
    applyLook() {
        let pan = getCamPan(this.lookX, this.lookY, this.width, this.height, this.camScale);
        this.camX = pan.x;
        this.camY = pan.y;
    }
    applyMenuTour(dt) {
        this.menuTourMs += dt;
        let look = getMenuTourCam(this.menuTourMs, getState().sections, this.width, this.height);
        this.section = look.section;
        this.lookX = look.x;
        this.lookY = look.y;
        this.camScale = look.scale;
        this.targetLookX = look.x;
        this.targetLookY = look.y;
        this.targetScale = look.scale;
        this.applyLook();
    }
    setCamTarget(section, snap) {
        let look = getCamLook(section);
        this.targetLookX = look.x;
        this.targetLookY = look.y;
        this.targetScale = getCamFitScale(section, this.width, this.height);
        if (snap) {
            this.lookX = look.x;
            this.lookY = look.y;
            this.camScale = this.targetScale;
        }
        this.applyLook();
    }
    applyCamera() {
        if (!this.worldEl) {
            return;
        }
        setStyle(this.worldEl, {
            'transform-origin': '0 0',
            [TRANSFORM]: 'scale(' +
                this.camScale +
                ') translate(' +
                -this.camX +
                'px,' +
                -this.camY +
                'px)',
        });
    }
    build() {
        let state = getState();
        let root = getGameRoot();
        if (!root) {
            return;
        }
        this.readViewSize();
        let el = createElement(DIV);
        setStyle(el, {
            position: 'absolute',
            inset: '0',
            overflow: 'hidden',
        });
        appendChild(root, el);
        let worldEl = createElement(DIV);
        setStyle(worldEl, {
            position: 'absolute',
            left: '0px',
            top: '0px',
        });
        appendChild(el, worldEl);
        this.el = el;
        this.worldEl = worldEl;
        for (let section of state.sections) {
            let room = new BoardSection(section);
            this.addChild(room);
            room.build();
        }
        this.syncBalls();
        if (!state.playing && !state.complete) {
            this.applyMenuTour(0);
        }
        else {
            let ball = state.balls[0];
            this.section = ball
                ? findSectionAt(state.sections, ball.pos.x, ball.pos.y, null)
                : state.sections[0];
            if (this.section) {
                this.setCamTarget(this.section, true);
            }
        }
        this.applyCamera();
    }
    checkResizeEvent(width, height) {
        this.width = width;
        this.height = height;
        let state = getState();
        if (!state.playing && !state.complete) {
            this.applyMenuTour(0);
            this.applyCamera();
        }
        else if (this.section) {
            this.setCamTarget(this.section, true);
            this.applyCamera();
        }
        super.checkResizeEvent(width, height);
    }
    onMouseWheel(_x, _y, delta) {
        if (!getState().playing) {
            return;
        }
        if (delta > 0) {
            this.camScale = clampCamScale(this.camScale / CAM_SCALE_STEP);
        }
        else {
            this.camScale = clampCamScale(this.camScale * CAM_SCALE_STEP);
        }
        this.targetScale = this.camScale;
        this.applyLook();
        this.applyCamera();
    }
    onMouseDown(x, y, _button, shift = false) {
        if (!shift || !getState().playing) {
            return;
        }
        let wx = this.camX + x / this.camScale;
        let wy = this.camY + y / this.camScale;
        let state = getState();
        let section = findSectionAt(state.sections, wx, wy, null);
        if (!section) {
            return;
        }
        let ball = state.balls[0];
        if (!ball) {
            return;
        }
        ball.pos.x = wx;
        ball.pos.y = wy;
        ball.vel.x = 0;
        ball.vel.y = 0;
    }
    update(dt) {
        this.syncBalls();
        let state = getState();
        let ball = state.balls[0];
        if (!state.playing && !state.complete) {
            this.applyMenuTour(dt);
        }
        else if (!state.playing) {
            let room = state.sections[COMPLETE_SECTION];
            if (room && this.section !== room) {
                this.section = room;
                this.setCamTarget(room, true);
            }
        }
        else if (ball) {
            let next = findSectionAt(state.sections, ball.pos.x, ball.pos.y, this.section);
            if (next &&
                (next !== this.section || state.playing !== this.wasPlaying)) {
                this.section = next;
                this.setCamTarget(next, false);
            }
        }
        this.wasPlaying = state.playing;
        this.lookX = lerpCam(this.lookX, this.targetLookX, dt);
        this.lookY = lerpCam(this.lookY, this.targetLookY, dt);
        this.camScale = lerpCam(this.camScale, this.targetScale, dt);
        this.applyLook();
        this.applyCamera();
        super.update(dt);
    }
    render(dt) {
        super.render(dt);
    }
}
let mobileWrap = {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '16px',
    display: 'none',
    'justify-content': 'space-between',
    padding: '0 16px',
    [POINTER_EVENTS]: 'none',
};
let addMobileBtn = (wrap, label, control) => {
    let btn = createElement('button');
    btn.className = 'mb';
    btn[INNER_HTML] = label;
    domAddEventListener(btn, 'touchstart', e => {
        e.preventDefault();
        btn.className = 'mb a';
        getState().input[control] = true;
    });
    let up = () => {
        btn.className = 'mb';
        getState().input[control] = false;
    };
    domAddEventListener(btn, 'touchend', up);
    domAddEventListener(btn, 'touchcancel', up);
    appendChild(wrap, btn);
};
class PlayHud extends UiElement {
    timeEl = null;
    btnEl = null;
    mobileEl = null;
    visible = false;
    hide() {
        this.visible = false;
        if (this.el) {
            setStyle(this.el, { display: 'none' });
        }
    }
    show() {
        this.visible = true;
        if (this.el) {
            setStyle(this.el, { display: 'block' });
        }
    }
    layout(width = 0, height = 0) {
        let bw = 120;
        let bh = 36;
        this.width = bw;
        this.height = bh;
        this.x = 12;
        this.y = 12;
        if (this.btnEl) {
            setStyle(this.btnEl, {
                left: px(this.x),
                top: px(this.y),
                width: px(bw),
                height: px(bh),
            });
        }
        if (this.timeEl) {
            setStyle(this.timeEl, { top: px(12) });
        }
        if (this.mobileEl) {
            setStyle(this.mobileEl, {
                display: height > width ? 'flex' : 'none',
            });
        }
    }
    checkResizeEvent(width, height) {
        this.layout(width, height);
        super.checkResizeEvent(width, height);
    }
    build() {
        let root = getGameRoot();
        if (!root) {
            return;
        }
        let overlay = createElement(DIV);
        setStyle(overlay, { ...hudOverlay, background: 'none', display: 'none' });
        let timeEl = createElement(DIV);
        setStyle(timeEl, {
            ...hudLabel,
            color: ACCENT,
            'font-size': '22px',
            'font-weight': 'bold',
        });
        appendChild(overlay, timeEl);
        let btn = createElement('button');
        btn[INNER_HTML] = 'Restart';
        setStyle(btn, hudBtn);
        domAddEventListener(btn, 'click', () => {
            startPlay();
            playSound(SOUND_START_GAME);
        });
        appendChild(overlay, btn);
        let mobile = createElement(DIV);
        setStyle(mobile, mobileWrap);
        addMobileBtn(mobile, '&lt;', CONTROL_LEFT);
        addMobileBtn(mobile, '^', CONTROL_START);
        addMobileBtn(mobile, '&gt;', CONTROL_RIGHT);
        appendChild(overlay, mobile);
        appendChild(root, overlay);
        this.el = overlay;
        this.timeEl = timeEl;
        this.btnEl = btn;
        this.mobileEl = mobile;
        this.layout();
    }
    render(_dt) {
        let state = getState();
        if (state.playing) {
            if (!this.visible) {
                this.show();
            }
            if (this.timeEl) {
                this.timeEl[INNER_HTML] = formatTime(state.playMs);
            }
        }
        else if (this.visible) {
            this.hide();
        }
    }
}
class SimUiLayer extends Layer {
    constructor(parent) {
        super(parent);
        this.addUiElement(new Board());
        this.addUiElement(new PlayHud());
        this.onResize(parent.clientWidth || innerWidth, parent.clientHeight || innerHeight);
    }
    setControl(key, down) {
        let state = getState();
        if (!state.playing) {
            return;
        }
        if (key === 'KeyZ' || key === 'ArrowLeft') {
            state.input[CONTROL_LEFT] = down;
        }
        else if (key === 'Slash' || key === 'ArrowRight') {
            state.input[CONTROL_RIGHT] = down;
        }
        else if (key === 'Space' || key === 'Enter') {
            state.input[CONTROL_START] = down;
        }
    }
    onKeyDown(key, _keyCode) {
        this.setControl(key, true);
    }
    onKeyUp(key, _keyCode) {
        this.setControl(key, false);
    }
}
let startGame = () => {
    let root = getGameRoot();
    if (!root) {
        console.error('Game root not found');
        return;
    }
    console.log('Start Game.');
    injectTextureCss();
    setState(createState());
    new LayerManager([
        new SimLayer(),
        new SimUiLayer(root),
        new MenuUiLayer(root),
        new GameCompleteUiLayer(root),
    ]).start();
};
addEventListener('load', startGame);
