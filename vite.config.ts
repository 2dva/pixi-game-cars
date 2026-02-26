import { defineConfig, loadEnv } from 'vite'

const version = process.env.npm_package_version

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnv = { VITE_APP_VERSION_PUBLIC: version, NODE_ENV: env.NODE_ENV }

  return {
    define: {
      // Expose the version to your application code
      __APP_VERSION__: JSON.stringify(version),
      'process.env': publicEnv,
    },
  }
})
