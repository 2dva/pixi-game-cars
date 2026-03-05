import type { GameMode, GameModeReason } from '../types'
import type { State } from './state'

export const ACTION = {
  RESET: 'RESET',
  RESET_SPEED: 'RESET_SPEED',
  SET_PAUSE: 'SET_PAUSE',
  SET_MODE: 'SET_MODE',
  SET_NEXT_MOVE: 'SET_NEXT_MOVE',
  SET_SCORE: 'SET_SCORE',
  SET_HEALTH_AND_TIME: 'SET_HEALTH_AND_TIME',
  SET_GAME_OVER: 'SET_GAME_OVER',
}

type ActionType = (typeof ACTION)[keyof typeof ACTION]

export type Action = {
  type: ActionType
  claimed?: number
} & Partial<State>

export const resetState = (): Action => {
  return {
    type: ACTION.RESET,
  }
}

export const setPause = (paused: boolean): Action => {
  return {
    type: ACTION.SET_PAUSE,
    paused,
  }
}

export const setMode = (mode: GameMode, modeReason: GameModeReason): Action => {
  return {
    type: ACTION.SET_MODE,
    mode,
    modeReason,
  }
}

export const setNextMove = (speed: number, deltaSpeed: number, deltaX: number, crash: boolean): Action => {
  return {
    type: ACTION.SET_NEXT_MOVE,
    speed,
    deltaSpeed,
    deltaX,
    crash,
  }
}

export const resetSpeed = (): Action => {
  return {
    type: ACTION.RESET_SPEED,
  }
}

export const setScore = (claimed: number): Action => {
  return {
    type: ACTION.SET_SCORE,
    claimed,
  }
}

export const setHealthAndTime = (health: number, timeLeft: number): Action => {
  return {
    type: ACTION.SET_HEALTH_AND_TIME,
    health,
    timeLeft,
  }
}

export const setGameOver = (): Action => {
  return {
    type: ACTION.SET_GAME_OVER,
  }
}
