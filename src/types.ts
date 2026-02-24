import type { Bounds, Container, Ticker } from 'pixi.js'
import type { State } from './state'

export interface IMajorGameContainer extends Container {
  setup(container: Container): void
  preloadAssets(): void
  reset(): void
  draw(state: State, time: Ticker): void
}

export type BoundsLike = Partial<Bounds> & Pick<Bounds, 'left' | 'right' | 'top' | 'bottom'>
