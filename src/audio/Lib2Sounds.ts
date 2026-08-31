import { SOUND_DIR } from '../PublicAssets';
import { SOUND_ASSETS, setFileSoundPlay } from './SoundFuncs';

type LibSounds = {
  soundPlayer: {
    loadSound: (name: string, url: string) => Promise<unknown>;
    playSoundName: (name: string) => void;
  };
};

/** Load mp3s into the file bank under SOUND_* names. Does not switch banks or use zzfx. */
export const loadLib2Mp3Sounds = async (lib: LibSounds) => {
  await Promise.all(
    SOUND_ASSETS.map(async asset => {
      await lib.soundPlayer.loadSound(asset.name, SOUND_DIR + asset.file);
      setFileSoundPlay(asset.id, () => {
        lib.soundPlayer.playSoundName(asset.name);
      });
    })
  );
};
