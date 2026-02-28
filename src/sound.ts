import { Howl } from 'howler'
import pickCoinMp3 from './assets/sound/coin_pick.mp3'
import carHitMp3 from './assets/sound/car_hit.mp3'

export const Sound = {
  pickCoin: new Howl({
    src: pickCoinMp3,
    volume: 0.1,
  }),
  carHit: new Howl({
    src: carHitMp3,
    volume: 0.08,
  }),
}
