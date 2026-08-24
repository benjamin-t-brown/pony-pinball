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
// const ZZFX = {
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
//     const channelCount = sampleChannels.length;
//     const sampleLength = sampleChannels[0].length;
//     const buffer = this.audioContext.createBuffer(
//       channelCount,
//       sampleLength,
//       this.sampleRate
//     );
//     const source = this.audioContext.createBufferSource();

//     // copy samples to buffer and setup source
//     sampleChannels.forEach((c, i) => buffer.getChannelData(i).set(c));
//     source.buffer = buffer;
//     source.playbackRate.value = rate;
//     source.loop = loop;

//     // create and connect gain node
//     const gainNode = this.audioContext.createGain();
//     gainNode.gain.value = this.volume * volumeScale;
//     gainNode.connect(this.audioContext.destination);

//     // connect source to stereo panner and gain
//     const pannerNode = new StereoPannerNode(this.audioContext, { pan: pan });
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
//     const minAttack = 9; // prevent pop if attack is 0
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
//     const playbackRate =
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
// prettier-ignore
const SOUNDS = [
  [.5,,106,,,.004,3,3.2,1,,,,,,37,,,.97,.16,,-1153], // gate closed
  [.7,,10,.07,.01,.15,2,3.9,,,41,.01,.03,,11,,,.83,.03,.06,136], // hit special wall
  [1.6,.5,398,.07,.03,.16,,3.3,,-1,,,,,,,,.63,.1,,354], // hit small circle
  [1.8,,225,.01,.15,.17,1,1.3,,,,,,,22,,.16,.74,.03,,-1030], // Launch
  [1.6,,127,.2,.08,.2,4,2.7,,,,,,,,.1,,.55,.13,,-1202], // Launch Pull Back
  [.8,,463,.02,.15,.49,3,1.6,3,,-85,.39,,,15,.1,.27,.77,.34,,962], // Start game
  [.6,,323,.17,,.007,5,.5,,6,-123,,.05,,7.2,.2,.03,.83,.33,,105], // Ball Traveling
  [,,306,.11,.12,.02,,2.7,,,325,.07,.02,,,,,.7,.01,.07], // Get coin
  [,,845,.31,.13,,3,2.2,2,,,,.03,.1,276,,,.64,.1,.3], // Secret
  [.6,,14,.05,.42,,1,.9,-13,1,,,,.6,412,,,.77,.36,,391], // Gate Open
  [,,286,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04], // Paddle Flipper
  [,,527,,,.03,5,1.70,-63,,,,,,,.5,,.93,,,401], // Wall Reappear
  [,,186,.02,.01,.01,1,2.9,,-13,,,,1.5,25,.1,,.85,.04], // paddle flipper down
  [3.6,,175,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105], // portal in
  [3.6,,75,.06,.02,.33,1,2.7,,,227,.17,,.6,79,,.16,.56,,,105], // portal out
  [1.1,,70,.16,.32,.06,4,1.9,,38,-360,.01,.09,.1,.5,.3,,.77,.02,.08,-1487], // hit fan
];

export const SOUND_GATE_CLOSED = 0;
export const SOUND_HIT_SPECIAL_WALL = 1;
export const SOUND_HIT_SMALL_CIRCLE = 2;
export const SOUND_LAUNCH = 3;
export const SOUND_LAUNCH_PULL_BACK = 4;
export const SOUND_START_GAME = 5;
export const SOUND_BALL_TRAVELING = 6;
export const SOUND_GET_COIN = 7;
export const SOUND_SECRET = 8;
export const SOUND_GATE_OPEN = 9;
export const SOUND_PADDLE_FLIPPER = 10;
export const SOUND_WALL_REAPPEAR = 11;
export const SOUND_PADDLE_FLIPPER_DOWN = 12;
export const SOUND_PORTAL_IN = 13;
export const SOUND_PORTAL_OUT = 14;
export const SOUND_HIT_FAN = 15;

const soundsPlayedThisTick = {};

export const playSound = i => {
  if (soundsPlayedThisTick[i]) {
    return;
  }
  zzfx(...SOUNDS[i]);
  soundsPlayedThisTick[i] = true;
};

export const clearSoundsPlayedThisTick = () => {
  for (const i in soundsPlayedThisTick) {
    delete soundsPlayedThisTick[i];
  }
};
