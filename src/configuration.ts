export const APP_BACKGROUND = 0x545457
export const APP_WIDTH = 740
export const APP_HEIGHT = 600

export const STAGE_PADDING = 120

export const ROAD_LEFT_GAP = 50
export const ROAD_LANE_COUNT = 5
export const ROAD_LANE_WIDTH = 100

export const SIDEWALK_WIDTH = 90

export const TOP_SPEED = 150

export const GAME_MODES = {
  DEMO: 0,
  FREE_RIDE: 1,
  COLLECT_IN_TIME: 2,
} as const

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES]

