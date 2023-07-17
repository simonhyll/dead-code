import { defineNuxtModule } from '@nuxt/kit'
import { deadCode } from 'vite-dead-code'
import { VitePluginOptions } from 'vite-dead-code/dist/types'

// Module options TypeScript interface definition
export interface ModuleOptions extends VitePluginOptions { }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'dead-code',
    configKey: 'deadCode'
  },
  // Default configuration options of the Nuxt module
  defaults: {
    replaceValues: {},
    stripConsole: false,
    stripConsoleLevel: 'off'
  },
  setup(options, nuxt) {
    nuxt.hook('vite:extendConfig', config => {
      config.plugins?.push(deadCode(options));
    })
  }
})
