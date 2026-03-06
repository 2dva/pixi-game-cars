import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './reducer'

export const store = configureStore({
  reducer: rootReducer,
})

export const getStateMode = () => store.getState().mode

export const getStateHero = () => store.getState().hero
