import type { ConfigFromSchema, ConfigSchema, Plugin } from './types'

export function _createPlugin<TSchema extends ConfigSchema>(plugin: Plugin<TSchema>) {
  return plugin
}

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace globalThis {
    // eslint-disable-next-line vars-on-top,no-var
    var createPlugin: typeof _createPlugin
  }

  interface Window {
    createPlugin: typeof _createPlugin
  }
}

globalThis.createPlugin = _createPlugin
export const createPlugin = _createPlugin

const pluginCache = new Map<string, Plugin<any> | null>()
export async function _importPluginInner<TSchema extends ConfigSchema>(content: string) {
  const blob = new Blob([content], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const module = await import(/* @vite-ignore */ url)
  URL.revokeObjectURL(url)
  if (module.default) {
    return module.default as Plugin<TSchema>
  }
  return null
}

export async function importPlugin<TSchema extends ConfigSchema>(content: string) {
  if (pluginCache.has(content)) {
    return pluginCache.get(content) as Plugin<TSchema>
  }
  const plugin = await _importPluginInner<TSchema>(content)
  pluginCache.set(content, plugin)
  return plugin
}

export function getDefaultConfig<TSchema extends ConfigSchema>(
  schema: TSchema,
): ConfigFromSchema<TSchema> {
  return Object.fromEntries(
    Object.entries(schema).map(([key, item]) => [key, item.default]),
  ) as ConfigFromSchema<TSchema>
}
