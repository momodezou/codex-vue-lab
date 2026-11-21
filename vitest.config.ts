import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/*.{unit,component}.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx,vue}'],
      exclude: ['src/**/__tests__/**', 'src/**/*.{test,spec}.{ts,tsx,vue}', 'src/**/*.d.ts'],
      reporter: ['text', 'html', 'json-summary'],
    },
  },
}))
