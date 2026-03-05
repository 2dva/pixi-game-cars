import type { Bounds, Container, Ticker } from 'pixi.js'


export interface IMajorGameContainer extends Container {
  setup(container: Container): void
  preloadAssets(): void
  reset(): void
  draw(time: Ticker): void
}

export type BoundsLike = Partial<Bounds> & Pick<Bounds, 'left' | 'right' | 'top' | 'bottom'>

export type DirectionKey = 'up' | 'left' | 'down' | 'right'

export const GAME_MODE = {
  DEMO: 0,
  FREE_RIDE: 1,
  COLLECT_IN_TIME: 2,
  GAME_OVER: 9,
} as const

export type GameMode = (typeof GAME_MODE)[keyof typeof GAME_MODE]

export const GAME_MODE_REASON = {
  NO_REASON: 0,
  END_MANUAL: 1,
  END_CRASHED: 2,
  END_TIME_IS_UP: 3,
  END_FUEL_IS_UP: 4,
} as const

export type GameModeReason = (typeof GAME_MODE_REASON)[keyof typeof GAME_MODE_REASON]

