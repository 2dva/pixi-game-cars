import { Howl } from 'howler'
import pickCoinMp3 from './assets/sound/coin_pick.mp3'
import failedMp3 from './assets/sound/failed.mp3'
import finishMp3 from './assets/sound/finish.mp3'
import hitHardMp3 from './assets/sound/hit_hard.mp3'
import hitSoftMp3 from './assets/sound/hit_soft.mp3'
import tapMp3 from './assets/sound/tap.mp3'

export const Sound = {
  tap: new Howl({
    src: tapMp3,
    volume: 0.1,
  }),
  pickCoin: new Howl({
    src: pickCoinMp3,
    volume: 0.1,
  }),
  carHit: new Howl({
    src: hitSoftMp3,
    volume: 0.08,
  }),
  hitHard: new Howl({
    src: hitHardMp3,
    volume: 0.07,
  }),
  finish: new Howl({
    src: finishMp3,
    volume: 0.2,
  }),
  failed: new Howl({
    src: failedMp3,
    volume: 0.2,
  }),
  mute: (off: boolean) => {
    Howler.mute(off)
  },
}
