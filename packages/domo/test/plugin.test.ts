import { expect, it } from 'vitest'
import { createPlugin, getDefaultConfig, importPlugin } from '../src/plugin'

const pluginContent = `
export default createPlugin({
  name: 'Test Plugin',
  description: 'A test plugin',
  configSchema: {
    testString: {
      type: 'string',
      default: 'default value',
    },
    testNumber: {
      type: 'number',
      default: 42,
    },
    testBoolean: {
      type: 'boolean',
      default: true,
    },
    testSelect: {
      type: 'select',
      options: ['option1', 'option2', 'option3'],
      default: 'option3',
    },
    testMultiSelect: {
      type: 'multiselect',
      options: ['option1', 'option2', 'option3'],
      default: ['option1', 'option2'],
    },
  },
})
`

it('can import a plugin', async () => {
  const plugin = await importPlugin(pluginContent)
  expect(plugin).toBeDefined()
  expect(plugin?.name).toBe('Test Plugin')
})

it('can cache imported plugins', async () => {
  const plugin1 = await importPlugin(pluginContent)
  const plugin2 = await importPlugin(pluginContent)
  expect(plugin1).toBe(plugin2)
})

it('can get default config values', () => {
  const plugin = createPlugin({
    name: 'Test Plugin',
    description: 'A test plugin',
    configSchema: {
      testString: {
        type: 'string',
        default: 'default value',
      },
      testNumber: {
        type: 'number',
        default: 42,
      },
      testBoolean: {
        type: 'boolean',
        default: true,
      },
      testSelect: {
        type: 'select',
        options: ['option1', 'option2', 'option3'],
        default: 'option3',
      },
      testMultiSelect: {
        type: 'multiselect',
        options: ['option1', 'option2', 'option3'],
        default: ['option1', 'option2'],
      },
    },
  })

  expect(getDefaultConfig(plugin.configSchema)).toStrictEqual({
    testString: 'default value',
    testNumber: 42,
    testBoolean: true,
    testSelect: 'option3',
    testMultiSelect: ['option1', 'option2'],
  })
})
