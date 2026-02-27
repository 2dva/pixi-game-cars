import { Howl } from 'howler'
import pickCoinMp3 from '../public/assets/sound/coin_pick.mp3'
import carHitMp3 from '../public/assets/sound/car_hit.mp3'

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
