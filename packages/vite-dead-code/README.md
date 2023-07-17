<div align="center">
<img src="https://avatars.githubusercontent.com/u/79983560" width="200">

# vite-dead-code 
Strips dead code from Javascript

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
</div>

## Install

```bash
pnpm add vite-dead-code
```

## Usage

```js
import { defineConfig } from 'vite'
import { deadCode } from 'vite-dead-code'

export default defineConfig({
  plugins: [deadCode({
    replaceValues: {
        yourKey: true
    },
    stripConsole: false, // strip `console` entirely
    stripConsoleLevel: 'off' // strip up to `console.LEVEL`
  })]
})
```

## How it works

Understanding how the plugin works is pretty important when you use it, so here's an overview of what it does.

1. Parse the javascript into an AST
2. Traverse the AST and find any keys in `replaceValues` that can be replaced in code with boolean literals (only inside if statements)
    - `stripConsole`: If true we strip any console usages in its entirety (may have unintended side effects)
    - `stripConsoleLevel`: If stripConsole is false we can use this to only skip console logging up to a certain level (inclusive) `off`, `log`, `info`, `warn`, `error`
3. Traverse the AST a second time, this time finding all `if` statements in your code, any statements that consist only of boolean literals are evaluated to either true or false
    - `true`: Keep the code within the if statement, removing any else or else if that follows it as well
    - `false`: Remove the if statement, and if it has an else statement use that, if it has an else if statement continue to parse it as well

```js
// If replaceValues.keepMe = true and stripConsoleLevel = 'log'
if (!!keepMe && true) {
    console.warn('Keep me')
    console.log('Remove me')
} else {
    console.log('Remove me')
}
// Becomes
{
    console.warn('Keep me')
}
```

## Options

## `Optional` replaceValues: `Record<string, boolean>`

default: `{}`

Sets the values to replace.

### Example
```js
deadCode({
  replaceValues: {
    keepMe: true,
    debug: process.env.NODE_ENV === 'development'
  },
})
```

## `Optional` stripConsole: `boolean`

default: `false`

### Example

Strips all `console` uses. Note that it doesn't just strip the logging related entries, it strips anything that uses `console`, which can have unintended side effects. If you just want to remove logging use `stripConsoleLevel: 'error'` instead.

```js
deadCode({
  stripConsole: true
})
```

## `Optional` stripConsoleLevel: `string`

default: `off`

### Example

This will strip all entries up to and including `warn`, leaving only `error` in your final output. Note that if you set `stripConsole: true` then this option is never used since if you strip the console in its entirety there's no point in checking which level to strip.

```js
deadCode({
  stripConsoleLevel: 'warn'
})
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/vite-dead-code/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/vite-dead-code

[npm-downloads-src]: https://img.shields.io/npm/dm/vite-dead-code.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/vite-dead-code

[license-src]: https://img.shields.io/npm/l/vite-dead-code.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/vite-dead-code

