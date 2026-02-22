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

export type State = {
  mode: GameMode
  modeReason: GameModeReason
  score: number
  speed: number
  deltaSpeed: number
  distance: number
  deltaDistance: number
  timeLeft: number
  deltaX: number
  health: number
  crash: boolean
  claim: boolean
}

export const defaultState: State = {
  mode: GAME_MODE.DEMO,
  modeReason: GAME_MODE_REASON.NO_REASON,
  score: 0,
  speed: 0,
  deltaSpeed: 0,
  distance: 0,
  deltaDistance: 0,
  timeLeft: 60,
  deltaX: 0,
  health: 100,
  crash: false,
  claim: false,
}
