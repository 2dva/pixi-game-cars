import { store } from './store'

// State mode
const stateMode = () => store.getState().mode
export const getMode = () => stateMode().mode
export const isPaused = () => stateMode().paused

// State hero
const stateHero = () => store.getState().hero
export const getSpeed = () => stateHero().speed
export const getScore = () => stateHero().score
export const getDistance = () => stateHero().distance
export const getDeltaDistance = () => stateHero().deltaDistance
export const getHero = () => stateHero()
