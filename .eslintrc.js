module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  ignorePatterns: [
    'dist/**/**',
    'node_modules/**/**',
    'coverage/**/**'
  ]
}
