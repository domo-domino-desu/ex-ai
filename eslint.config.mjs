import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  react: true,
}, {
  files: ['**/*.gen.ts'],
  rules: {
    'eslint-comments/no-unlimited-disable': 'off',
  },
}, {
  rules: {
    'style/brace-style': ['error', '1tbs'],
  },
})
