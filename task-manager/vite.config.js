import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import istanbul from 'vite-plugin-istanbul'

const isCypress = Boolean(process.env.CYPRESS)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    isCypress &&
      istanbul({
        include: ['src/**/*'],
        extension: ['.js', '.ts', '.jsx', '.tsx'],
        cypress: true,
        forceBuildInstrument: true, 
      }),
  ].filter(Boolean),
})
