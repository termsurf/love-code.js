import crypto from 'crypto'
import { ESLint, Linter } from 'eslint'
import fs from 'fs'
import os from 'os'
import path from 'path'
import prettier from 'prettier'

const PRETTIER = {
  arrowParens: 'avoid' as const,
  bracketSpacing: true,
  endOfLine: 'lf' as const,
  importOrder: [
    '^\\w(.*)$',
    '^@(.*)$',
    '~(.*)$',
    '\\..(.*)$',
    '\\.(.*)$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  parser: 'typescript',
  printWidth: 72,
  proseWrap: 'always' as const,
  quoteProps: 'as-needed' as const,
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all' as const,
  useTabs: false,
}

const ESLINT: Linter.Config = {
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  overrides: [
    {
      files: ['*.yaml', '*.yml'],
      parser: 'yaml-eslint-parser',
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'sort-exports',
    'typescript-sort-keys',
    'sort-keys',
    'prettier',
  ],
  extends: ['prettier'],
  rules: {
    curly: 2,
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    '@typescript-eslint/no-unnecessary-condition': 0,
    '@typescript-eslint/array-type': [
      2,
      {
        default: 'generic',
      },
    ],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-definitions': 0,
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-namespace': 0,
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/prefer-function-type': 'error',
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'error',
    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'error',
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': 'error',
    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': [2, 'always'],
    'padding-line-between-statements': 'off',
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['type'],
      },
    ],
    'space-before-blocks': 'off',
    '@typescript-eslint/space-before-blocks': ['error', 'always'],
    '@typescript-eslint/type-annotation-spacing': [
      'error',
      { after: true },
    ],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'sort-exports/sort-exports': 'off',
    'typescript-sort-keys/interface': 'off',
    'typescript-sort-keys/string-enum': 'off',
    'sort-keys': 'off',
    'sort-keys/sort-keys-fix': 'off',
    'prettier/prettier': 2,
    '@typescript-eslint/no-unused-vars': 'off',
    'default-case': 'off',
    'default-case-last': 'off',
  },
}

export function makeFile({
  prefix,
  suffix,
  tmpdir,
}: {
  prefix?: string
  suffix?: string
  tmpdir?: string
} = {}) {
  prefix = typeof prefix !== 'undefined' ? prefix : 'tmp.'
  suffix = typeof suffix !== 'undefined' ? suffix : ''
  tmpdir = tmpdir ? tmpdir : os.tmpdir()
  return path.join(
    tmpdir,
    prefix + crypto.randomBytes(16).toString('hex') + suffix,
  )
}

export default async function loveCode(
  text: string,
  hold = './tmp/hold',
) {
  const link = path.join(process.cwd(), hold)
  const tmp = makeFile({
    suffix: '.ts',
    tmpdir: link,
  })
  fs.mkdirSync(link, { recursive: true })
  const eslint = new ESLint({
    fix: true,
    overrideConfig: {
      ...ESLINT,
    },
    useEslintrc: false,
  })

  fs.writeFileSync(tmp, text)

  const results = await eslint.lintFiles([tmp])
  await ESLint.outputFixes(results)
  // const formatter = await eslint.loadFormatter('stylish')
  // await formatter.format(results)
  const result = fs.readFileSync(tmp, 'utf-8')

  fs.unlinkSync(tmp)

  return prettier.format(result, {
    ...PRETTIER,
    parser: 'typescript',
  })
}
