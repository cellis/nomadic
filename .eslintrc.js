module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    browser: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', 'd.ts'],
      },
      typescript: {},
    },
    'import/extensions': ['.js', '.ts', 'd.ts', '.jsx', '.tsx', '.json'],
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'object-shorthand': [2, 'always'],
    'comma-dangle': [2, 'always-multiline'],
    'object-curly-spacing': [2, 'always'],
    'prefer-template': 2,
    'consistent-return': 'off',
    'no-underscore-dangle': 'off',
    'import/no-cycle': 'off',
    'no-param-reassign': ['error', { props: false }],
    semi: 2,
    quotes: [2, 'single', 'avoid-escape'],
  },
  overrides: [
    {
      files: ['*.js', '*.ts', '*.jsx', '*.tsx'],
      rules: {
        // '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'max-len': [2, 80],
      },
    },
  ],
};
