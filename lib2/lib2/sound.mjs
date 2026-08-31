import { getLib } from './lib.mjs';

const SOUND_PATH = '';

class CtxAudio {
  audioBuffer;
  source;
  audioCtx;
  gainNode;
  startTime = 0;

  paused = true;

  constructor(buffer, audioCtx) {
    this.audioCtx = audioCtx;
    this.audioBuffer = buffer;
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.gainNode = audioCtx.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
  }

  copy() {
    return new CtxAudio(this.audioBuffer, new AudioContext());
  }

  copyWithCtx(audioCtx) {
    return new CtxAudio(this.audioBuffer, audioCtx);
  }

  static async createCtxAudio(arrayBuffer, ctx) {
    const audioCtx = ctx ?? new AudioContext();
    return new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(
        arrayBuffer,
        buffer => {
          resolve(new CtxAudio(buffer, audioCtx));
        },
        err => {
          console.error(`Error with decoding audio data: ${err}`);
          reject(err);
        }
      );
    });
  }

  static async loadCtxAudio(url, ctx) {
    const blob = await fetch(url).then(res => res.blob());
    const arrayBuffer = await blob.arrayBuffer();
    return await CtxAudio.createCtxAudio(arrayBuffer, ctx);
  }

  play(args) {
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.loop = false;
    this.gainNode = this.audioCtx.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    this.setVolume(args.volume);
    this.source.loop = args.loop;
    this.source.start(0, args.startTime, args.duration);
    this.unpause();
    this.startTime = this.audioCtx.currentTime;
  }

  stop() {
    this.pause();
  }
  pause() {
    if (!this.paused) {
      this.source.stop();
      this.paused = true;
    }
  }
  unpause() {
    this.paused = false;
  }

  isPaused() {
    return this.paused;
  }

  setVolume(volume) {
    this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
  }

  getVolume() {
    return this.gainNode.gain.value;
  }

  getDuration() {
    return this.audioBuffer.duration;
  }

  getCurrentTime() {
    return this.audioCtx.currentTime - this.startTime;
  }
}

export class SoundPlayer {
  audioCtx = new AudioContext();

  constructor() {
    this.sounds = {};
  }

  /** @param {string} name */
  /** @param {string} url */
  /** @param {number} volume */
  async loadSound(name, url, volume = 0.5) {
    url = `${SOUND_PATH}${url}`;
    return new Promise((resolve, reject) => {
      CtxAudio.loadCtxAudio(url, this.audioCtx)
        .then(sound => {
          this.sounds[name] = {
            sound,
            audio: sound,
            soundDuration: 5000,
            volume: volume,
          };
          console.log('[lib2] sound loaded', name, url);
          resolve(sound);
        })
        .catch(err => {
          console.log('[lib2] failed to load sound:', name, url);
          reject(err);
        });
    });
  }

  /** @param {string} soundName */
  getSound(soundName) {
    const soundObj = this.sounds[soundName];
    if (soundObj) {
      const s = {
        duration: 0,
        ...soundObj,
        //soundDuration merged in from soundObj
        // audio: soundObj.audio.cloneNode(),
        audio: soundObj.audio,
        soundName,
        lastStartTimestamp: window.performance.now(),
        isPlaying: false,
        isPaused: false,
      };

      return s;
    } else {
      console.error('[lib2] could not find sound with name: ', soundName);
      return null;
    }
  }

  /**
   * @typedef {Object} SoundObj
   * @property {any} sound
   * @property {number} volume
   * @property {number} lastStartTimestamp
   * @property {boolean} isPlaying
   */

  /**
   * @param {SoundObj} soundObj
   */
  playSound(soundObj) {
    if (!getLib().getConfig().soundEnabled) {
      return;
    }
    const { sound, volume } = soundObj;
    sound.play({
      startTime: 0,
      duration: 5000,
      loop: false,
      volume: volume || 0.5,
    });

    soundObj.lastStartTimestamp = window.performance.now();
    soundObj.isPlaying = true;
  }

  /** @param {string} soundName */
  playSoundName(soundName) {
    const soundObj = this.getSound(soundName);
    if (soundObj) {
      this.playSound(soundObj);
    }
  }

  /**
   * @param {SoundObj} soundObj
   */
  stopSound(soundObj) {
    const { sound } = soundObj;
    sound.pause();
    soundObj.isPlaying = false;
  }

  /** @param {number} v */
  setVolume(v) {
    for (const i in this.sounds) {
      const { audio } = this.sounds[i];
      audio.volume = v;
    }
  }
}
