import { createStore } from 'redux'
import { stateReducer } from './reducer'

// create store
export const store = createStore(
  stateReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
