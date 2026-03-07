import { combineSlices, createAction, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { calculateDistanceBySpeed } from '../lib/physics'
import { defaultState, defaultStateMode } from './state'

export const resetAll = createAction('RESET_ALL')

const modeSlice = createSlice({
  name: 'mode',
  initialState: defaultStateMode,
  reducers: {
    setMode(state, action) {
      state.mode = action.payload.mode
      state.modeReason = action.payload.modeReason
    },
    setPause(state, action: PayloadAction<boolean>) {
      state.paused = action.payload
    },
  },
  extraReducers(builder) {
    builder.addCase(resetAll, () => {
      return defaultStateMode
    })
  },
})

const heroSlice = createSlice({
  name: 'hero',
  initialState: defaultState,
  reducers: {
    setSpeed(state, action: PayloadAction<number>) {
      state.speed = action.payload
    },
    setGameOver(state) {
      state.speed = 0
      state.deltaSpeed = 0
      state.crash = state.health === 0
    },
    setScore(state, action: PayloadAction<number>) {
      state.score += action.payload
      state.claim = action.payload! >= 100
    },
    setHealthAndTime(state, action) {
      state.health = action.payload.health
      state.timeLeft = action.payload.timeLeft
    },
    setNextMove(state, action) {
      const deltaDistance = calculateDistanceBySpeed(action.payload.speed)
      state.speed = action.payload.speed
      state.deltaSpeed = action.payload.deltaSpeed
      state.deltaX = action.payload.deltaX
      state.deltaDistance = deltaDistance
      state.distance = state.distance + deltaDistance
      state.crash = action.payload.crash
    },
  },
  extraReducers(builder) {
    builder.addCase(resetAll, () => {
      return defaultState
    })
  },
})

export const { setMode, setPause } = modeSlice.actions
export const { setSpeed, setGameOver, setScore, setHealthAndTime, setNextMove } = heroSlice.actions
export const rootReducer = combineSlices(modeSlice, heroSlice)
