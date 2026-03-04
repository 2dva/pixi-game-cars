import { checkDeviceIsMobile, checkDeviceIsTouch } from './utils'

// export const APP_VERSION = import.meta.env.VITE_APP_VERSION
// export const APP_VERSION = window.__APP_VERSION__
const APP_VERSION = process.env.VITE_APP_VERSION_PUBLIC

const isDevPlatform = process.env.NODE_ENV === 'development'
const isLocalPlatform = window.location.hostname.indexOf('localhost') > -1
const isMobileDevice = checkDeviceIsMobile()
const isTouchDevice = checkDeviceIsTouch()

const desktopConfig = {
  appWidth: 740,
  appHeight: 600,
  stagePadding: 120,

  screenContentPadding: 125,
  screenContentHeight: 350,

  roadLaneCount: 5,
  roadLaneWidth: 100,
  roadLeftGap: 60,
  roadSidewalkWidth: 80,

  heroPositionYFromBottom: 160,
  heroTopSpeed: 150,
  heroAcceleration: 0.8,
}

const mobileConfig = {
  appWidth: 720,
  appHeight: 1280,
  stagePadding: 120,

  screenContentPadding: 63,
  screenContentHeight: 350,

  roadLaneCount: 4,
  roadLaneWidth: 130,
  roadLeftGap: 30,
  roadSidewalkWidth: 50,

  heroPositionYFromBottom: 320,
  heroTopSpeed: 130,
  heroAcceleration: 0.7,
}

const commonConfig = {
  appBackground: 0x545457,
  soundMutedByDefault: false,
}

export const gameConfig = Object.assign({}, isMobileDevice ? mobileConfig : desktopConfig, commonConfig, {
  appVersion: APP_VERSION,
  isDevPlatform,
  isLocalPlatform,
  isMobileDevice,
  isTouchDevice,
})

export const zIndexFixed = {
  road: 1,
  groundObjects: 2,
  cars: 3,
  flyingObjects: 4,
  hud: 5,
  splashScreens: 6,
  interactives: 7,
}
