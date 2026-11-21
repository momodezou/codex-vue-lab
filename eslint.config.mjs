
import eslintPluginVue from 'eslint-plugin-vue'
import {
  withVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'

export default withVueTs(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '*.config.js',
      '*.config.ts',
    ],
  },
  eslintPluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    rules: {
      // 由 Vue Official 负责属性格式化
      'vue/max-attributes-per-line': 'off',
    },
  },
)
