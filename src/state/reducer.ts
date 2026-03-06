import { combineReducers, type Reducer } from 'redux'
import { calculateDistanceBySpeed } from '../lib/physics'
import { ACTION, type Action } from './actions'
import { defaultState, defaultStateMode, type StateHero, type StateMode } from './state'

const modeReducer: Reducer = (state = defaultStateMode, action: Action): StateMode => {
  switch (action.type) {
    case ACTION.SET_PAUSE:
      return {
        ...state,
        paused: action.paused,
      }
    case ACTION.SET_MODE:
      return {
        ...state,
        mode: action.mode,
        modeReason: action.modeReason,
      }
    case ACTION.RESET:
      return { ...defaultStateMode }
    default:
      return { ...state }
  }
}

export const heroReducer: Reducer = (state = defaultState, action: Action): StateHero => {
  switch (action.type) {
    // case ACTION.SET_PAUSE:
    //   return {
    //     ...state,
    //     paused: action.paused,
    //   }
    // case ACTION.SET_MODE:
    //   return {
    //     ...state,
    //     mode: action.mode,
    //     modeReason: action.modeReason,
    //   }
    case ACTION.SET_NEXT_MOVE: {
      const deltaDistance = calculateDistanceBySpeed(action.speed!)
      return {
        ...state,
        speed: action.speed,
        deltaSpeed: action.deltaSpeed,
        deltaX: action.deltaX,
        crash: action.crash,
        deltaDistance,
        distance: state.distance + deltaDistance,
      }
    }
    case ACTION.RESET_SPEED:
      return {
        ...state,
        speed: action.speed,
      }
    case ACTION.SET_GAME_OVER:
      return {
        ...state,
        speed: 0,
        deltaSpeed: 0,
        crash: state.health === 0,
      }
    case ACTION.SET_SCORE:
      return {
        ...state,
        score: state.score + action.claimed,
        claim: action.claimed! >= 100,
      }
    case ACTION.SET_HEALTH_AND_TIME:
      return {
        ...state,
        health: action.health,
        timeLeft: action.timeLeft,
      }
    case ACTION.RESET:
      return { ...defaultState }
    default:
      return { ...state }
  }
}

export const rootReducer = combineReducers({
  mode: modeReducer,
  hero: heroReducer,
})

