import crypto from 'crypto'
import { ESLint, Linter } from 'eslint'
import fs from 'fs'
import os from 'os'
import path from 'path'
import prettier from 'prettier'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

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
  extends: ['prettier'],
  // },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest' as const,
    // extraFileExtensions: ['.'],
    project: [`${__dirname}/tsconfig.lib.json`],
    sourceType: 'module' as const,
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'typescript-sort-keys',
    'sort-keys',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/array-type': [
      2,
      {
        default: 'generic',
      },
    ],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-definitions': [2, 'type'],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/lines-between-class-members': 'error',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/naming-convention': 0,
    '@typescript-eslint/no-array-constructor': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-throw-literal': 'error',
    '@typescript-eslint/no-unnecessary-condition': 0,
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/object-curly-spacing': [2, 'always'],
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        next: ['type'],
        prev: '*',
      },
    ],
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
        avoidEscape: true,
      },
    ],
    '@typescript-eslint/space-before-blocks': ['error', 'always'],
    '@typescript-eslint/type-annotation-spacing': [
      'error',
      { after: true },
    ],
    curly: 2,
    'default-case': 'error',
    'default-case-last': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'lines-between-class-members': 'off',
    'no-array-constructor': 'off',
    'no-throw-literal': 'off',
    'object-curly-spacing': 'off',
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', next: 'block', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'block' },
      { blankLine: 'always', next: 'block-like', prev: '*' },
      { blankLine: 'always', next: '*', prev: 'block-like' },
    ],
    'prettier/prettier': 2,
    'sort-keys': 0,
    'sort-keys/sort-keys-fix': 2,
    'space-before-blocks': 'off',
    'typescript-sort-keys/interface': 'error',
    'typescript-sort-keys/string-enum': 'error',
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

export default async function makeText(text: string, hold = './tmp/hold') {
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
