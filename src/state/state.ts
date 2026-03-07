import { GAME_MODE, GAME_MODE_REASON, type GameMode, type GameModeReason } from "../types"

export type StateMode = {
  mode: GameMode
  modeReason: GameModeReason
  paused: boolean
}

export const defaultStateMode: StateMode = {
  mode: GAME_MODE.DEMO,
  modeReason: GAME_MODE_REASON.NO_REASON,
  paused: false,
}

export type StateHero = {
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

export const defaultState: StateHero = {
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
