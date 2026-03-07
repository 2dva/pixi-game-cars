import type { GameMode, GameModeReason } from '../types'
import type { StateHero, StateMode } from './state'

/**
 * Экшены для Redux без Redux Toolkit
 * ЭТОТ ФАЙЛ БОЛЬШЕ НЕ ИСПОЛЬЗУЕТСЯ
 * ОСТАВЛЯЮ ДЛЯ ИНФОРМАЦИИ
 */

const ACTION = {
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

type Action = {
  type: ActionType
  claimed?: number
} & Partial<StateHero> &
  Partial<StateMode>

export const resetState1 = (): Action => {
  return {
    type: ACTION.RESET,
  }
}

export const setPause1 = (paused: boolean): Action => {
  return {
    type: ACTION.SET_PAUSE,
    paused,
  }
}

export const setMode1 = (mode: GameMode, modeReason: GameModeReason): Action => {
  return {
    type: ACTION.SET_MODE,
    mode,
    modeReason,
  }
}

export const setNextMove1 = (speed: number, deltaSpeed: number, deltaX: number, crash: boolean): Action => {
  return {
    type: ACTION.SET_NEXT_MOVE,
    speed,
    deltaSpeed,
    deltaX,
    crash,
  }
}

export const resetSpeed1 = (speed :number): Action => {
  return {
    type: ACTION.RESET_SPEED,
    speed,
  }
}

export const setScore1 = (claimed: number): Action => {
  return {
    type: ACTION.SET_SCORE,
    claimed,
  }
}

export const setHealthAndTime1 = (health: number, timeLeft: number): Action => {
  return {
    type: ACTION.SET_HEALTH_AND_TIME,
    health,
    timeLeft,
  }
}

export const setGameOver1 = (): Action => {
  return {
    type: ACTION.SET_GAME_OVER,
  }
}
