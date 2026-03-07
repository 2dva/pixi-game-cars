import { combineReducers, createAction, createReducer } from '@reduxjs/toolkit'
import { calculateDistanceBySpeed } from '../lib/physics'
import type { GameMode, GameModeReason } from '../types'
import { defaultState, defaultStateMode } from './state'

/**
 * Экшены и редьюсеры на RTK, без слайсов
 * ЭТОТ ФАЙЛ БОЛЬШЕ НЕ ИСПОЛЬЗУЕТСЯ
 * ОСТАВЛЯЮ ДЛЯ ИНФОРМАЦИИ
 */

export const setPause = createAction<boolean>('SET_PAUSE')
export const resetState = createAction('RESET')
export const setMode = createAction('SET_MODE', (mode: GameMode, modeReason: GameModeReason) => {
  return {
    payload: {
      mode,
      modeReason,
    },
  }
})
export const resetSpeed = createAction<number>('RESET_SPEED')
export const setGameOver = createAction('SET_GAME_OVER')
export const setScore = createAction<number>('SET_SCORE')
export const setHealthAndTime = createAction('SET_HEALTH_AND_TIME', (health: number, timeLeft: number) => {
  return {
    payload: {
      health,
      timeLeft,
    },
  }
})
export const setNextMove = createAction(
  'SET_NEXT_MOVE',
  (speed: number, deltaSpeed: number, deltaX: number, crash: boolean) => {
    return {
      payload: {
        speed,
        deltaSpeed,
        deltaX,
        crash,
      },
    }
  }
)

const modeReducer = createReducer(defaultStateMode, (builder) => {
  builder
    .addCase(setMode, (state, action) => {
      state.mode = action.payload.mode
      state.modeReason = action.payload.modeReason
    })
    .addCase(setPause, (state, action) => {
      state.paused = action.payload
    })
    .addCase(resetState, (state) => {
      Object.assign(state, defaultStateMode)
    })
})

const heroReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(resetSpeed, (state, action) => {
      state.speed = action.payload
    })
    .addCase(setGameOver, (state) => {
      state.speed = 0
      state.deltaSpeed = 0
      state.crash = state.health === 0
    })
    .addCase(setScore, (state, action) => {
      state.score += action.payload
      state.claim = action.payload! >= 100
    })
    .addCase(setHealthAndTime, (state, action) => {
      state.health = action.payload.health
      state.timeLeft = action.payload.timeLeft
    })
    .addCase(setNextMove, (state, action) => {
      const deltaDistance = calculateDistanceBySpeed(action.payload.speed)
      state.speed = action.payload.speed
      state.deltaSpeed = action.payload.deltaSpeed
      state.deltaX = action.payload.deltaX
      state.deltaDistance = deltaDistance
      state.distance = state.distance + deltaDistance
      state.crash = action.payload.crash
    })
    .addCase(resetState, (state) => {
      Object.assign(state, defaultState)
    })
})

export const rootReducer = combineReducers({
  mode: modeReducer,
  hero: heroReducer,
})
