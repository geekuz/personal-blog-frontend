import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Each plugin teaches Vite a new trick:
  //  - react(): understands JSX and enables Fast Refresh (instant updates on save)
  //  - tailwindcss(): scans our files for class names and generates only the CSS we use
  plugins: [react(), tailwindcss()],
})
