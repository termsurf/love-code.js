# `@tunebond/love-code`

Pretty print TS/JS code in a standard way programmatically.

```
pnpm add @tunebond/love-code
yarn add @tunebond/love-code
npm i @tunebond/love-code
```

## Usage

```ts
import loveText from '@tunebond/love-text'

loveText('const x = 10, y = 20').then(code => {
  console.log(code)
})
```
