export type State = {
  mode: number,
  score: number
  speed: number
  deltaSpeed: number
  distance: number
  deltaDistance: number
  deltaX: number
  health: number
  crash: boolean
  claim: boolean
}

export const defaultState: State = {
  mode: 0,
  score: 0,
  speed: 0,
  deltaSpeed: 0,
  distance: 0,
  deltaDistance: 0,
  deltaX: 0,
  health: 100,
  crash: false,
  claim: false,
}
