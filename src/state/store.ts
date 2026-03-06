import { createStore } from 'redux'
import { rootReducer } from './reducer'

// create store
export const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export const getStateMode = () => store.getState().mode

export const getStateHero = () => store.getState().hero
