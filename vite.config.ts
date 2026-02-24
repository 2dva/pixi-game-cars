import { defineConfig } from 'vite'

const version = process.env.npm_package_version

export default defineConfig(() => {
  const publicEnv = { VITE_APP_VERSION_PUBLIC: version }

  return {
    define: {
      // Expose the version to your application code
      __APP_VERSION__: JSON.stringify(version),
      'process.env': publicEnv,
    },
  }
})
