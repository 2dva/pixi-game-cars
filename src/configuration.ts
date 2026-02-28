import { isMobileBrowser } from './utils'

// export const APP_VERSION = import.meta.env.VITE_APP_VERSION
// export const APP_VERSION = window.__APP_VERSION__
const APP_VERSION = process.env.VITE_APP_VERSION_PUBLIC

const isDevPlatform = process.env.NODE_ENV === 'development'
const isLocalPlatform = window.location.hostname.indexOf('localhost') > -1
const isMobilePlatform = isMobileBrowser()

const desktopConfig = {
  appWidth: 740,
  appHeight: 600,
  stagePadding: 120,
  screenContentPadding: 125,

  roadLaneCount: 5,
  roadLaneWidth: 100,
  roadLeftGap: 60,
  roadSidewalkWidth: 80,

  heroPositionYFromBottom: 160,
}

const mobileConfig = {
  appWidth: 720,
  appHeight: 1600,
  stagePadding: 120,
  screenContentPadding: 63,

  roadLaneCount: 4,
  roadLaneWidth: 130,
  roadLeftGap: 30,
  roadSidewalkWidth: 50,

  heroPositionYFromBottom: 280,
}

const commonConfig = {
  appBackground: 0x545457,
  topSpeed: 150,
}

export const gameConfig = Object.assign({}, isMobilePlatform ? mobileConfig : desktopConfig, commonConfig, {
  appVersion: APP_VERSION,
  isDevPlatform,
  isLocalPlatform,
  isMobilePlatform,
})

export const zIndexFixed = {
  road: 1,
  groundObjects: 2,
  cars: 3,
  flyingObjects: 4,
  hud: 5,
  infoScreens: 6,
  interactives: 7,
}
