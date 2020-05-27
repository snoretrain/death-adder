
module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-useless-constructor': 'off',
    'no-restricted-syntax': 'off',
    'no-unused-vars': 'off',
    'class-methods-use-this': 'off',
    'import/extensions': ['error', 'ignorePackages', {
      'ts': 'never'
    }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules']
      }
    }
  },
  overrides: [
    {
      'files': ['src/__tests__/resources/*.ts'],
      'rules': {
        'max-classes-per-file': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      'files': ['src/middleware/MiddlewareExecutor.ts'],
      'rules': {
        'no-await-in-loop': 'off'
      }
    },
    {
      'files': ['src/router/Router.ts'],
      'rules': {
        'new-cap': 'off'
      }
    }
  ]
};