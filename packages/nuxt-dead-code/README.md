<div align="center">
<img src="/logo.png" width="200">

# nuxt-dead-code 
Strips dead code from Javascript

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
</div>


## Install

```bash
pnpm add nuxt-dead-code
```

## Usage

```js
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    ['nuxt-dead-code', {
      replaceValues: {
        keepMe: true
      }
    }]
  ]
})

```

## How it works

This module does little more than register the `vite-dead-code` plugin (also developed by me). For more information on how that plugin works and its options go read its documentation.

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-dead-code/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-dead-code

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-dead-code.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-dead-code

[license-src]: https://img.shields.io/npm/l/nuxt-dead-code.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-dead-code

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
