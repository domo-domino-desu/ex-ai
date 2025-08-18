import type { ConfigFromSchema, ConfigSchema, Conversation, Plugin } from './types'
import { isBrowser, isBun, isDeno, isNode } from 'environment'

const isLocal = isNode || isBun || isDeno

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace globalThis {
    // eslint-disable-next-line vars-on-top,no-var
    var createPlugin: null | typeof _createPlugin
  }

  interface Window {
    createPlugin: null | typeof _createPlugin
  }
}

/**
 * Creates a plugin with correct type annotations.
 * @param plugin The plugin object to create.
 * @returns The created plugin.
 */
export function _createPlugin<TSchema extends ConfigSchema>(plugin: Plugin<TSchema>) {
  return plugin
}
export const createPlugin = _createPlugin
export function registerGlobalCreatePlugin() {
  globalThis.createPlugin = _createPlugin
}

export async function _importPluginBrowser<TSchema extends ConfigSchema>(content: string) {
  const blob = new Blob([content], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const module = await import(/* @vite-ignore */ url)
  URL.revokeObjectURL(url)
  if (module.default) {
    return module.default as Plugin<TSchema>
  }
  return null
}

export async function _importPluginLocal<TSchema extends ConfigSchema>(content: string) {
  const fs = await import('node:fs/promises')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')

  const tempFile = await fs.mkdtemp(join(tmpdir(), 'plugin-'))
  const filePath = `${tempFile}/plugin.js`
  await fs.writeFile(filePath, content)
  const module = await import(filePath)
  if (module.default) {
    return module.default as Plugin<TSchema>
  }
  return null
}

const pluginCache = new Map<string, Plugin<any> | null>()

/**
 * Imports a plugin from a string containing the plugin code.
 * @param content The file content of the plugin to import.
 * @returns The imported plugin or null if the import failed.
 */
export async function importPlugin<TSchema extends ConfigSchema>(content: string) {
  if (pluginCache.has(content)) {
    return pluginCache.get(content) as Plugin<TSchema>
  }
  let importFn
  if (isBrowser) {
    importFn = _importPluginBrowser
  } else if (isLocal) {
    importFn = _importPluginLocal
  } else {
    throw new Error('Unsupported environment for plugin import')
  }
  const plugin = await importFn<TSchema>(content)
  pluginCache.set(content, plugin)
  return plugin
}

/**
 * Gets the default configuration values for a given config schema.
 * @param schema The config schema to get default values for.
 * @returns An object containing the default values for each config item.
 */
export function getDefaultConfig<TSchema extends ConfigSchema>(
  schema: TSchema,
): ConfigFromSchema<TSchema> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, item]) => [key, item.default]),
  ) as ConfigFromSchema<TSchema>
}

export function buildPipeline(type: 'inbound' | 'outbound' | 'mod', plugins: { plugin: Plugin<any>, config: any }[], capabilities: Record<any, (...args: any) => any>) {
  return async (chat: Conversation) => {
    const allHooks = plugins
      .flatMap(({ plugin, config }) => (plugin[`${type}Hooks`] || []).map(hook => ({
        handler: hook.handler,
        order: hook.order,
        pluginName: plugin.name,
        config,
      })))
      .sort((a, b) => a.order - b.order)
    for (const { handler, config } of allHooks) {
      chat = await handler(chat, config, capabilities)
    }
    return chat
  }
}
