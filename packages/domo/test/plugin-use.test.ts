import type { Conversation } from '../src'
import { create } from 'mutative'
import { v7 } from 'uuid'
import { expect, it } from 'vitest'
import { buildPipeline, createPlugin, getDefaultConfig } from '../src'

const plugin1 = createPlugin({
  name: 'Test Plugin',
  description: 'A test plugin',
  configSchema: {
    role: {
      type: 'string',
      default: 'AI助手',
    },
  },
  inboundHooks: [
    {
      order: 10,
      handler: async function addSystemMessage(chat, config, capabilities) {
        return create(chat, (draft) => {
          draft.messages.unshift({
            id: v7(),
            role: 'system',
            content: `${capabilities.getYou?.()}是一个${config.role}，旨在帮助用户解决问题。`,
            createdAt: new Date().toISOString(),
          })
        })
      },
    },
    {
      order: 90,
      handler: async function systemMeow(chat) {
        return create(chat, (draft) => {
          for (const message of draft.messages) {
            if (message.role === 'system') {
              message.content += '你要以猫娘的语气回答问题喵~'
              break
            }
          }
        })
      },
    },
  ],
})

const plugin2 = createPlugin({
  name: 'Test Plugin2',
  description: 'Another test plugin',
  configSchema: {},
  inboundHooks: [
    {
      order: 40,
      handler: async function addSystemInfo(chat) {
        return create(chat, (draft) => {
          const now = new Date().toISOString()
          for (const message of draft.messages) {
            if (message.role === 'system') {
              message.content = `当前时间是：${now}。${message.content}`
              break
            }
          }
        })
      },
    },
  ],
})

const plugin3 = createPlugin({
  name: 'Test Plugin3',
  description: 'Yet another test plugin',
  configSchema: {},
})

const testConversation: Conversation = {
  id: v7(),
  messages: [
    {
      id: v7(),
      role: 'user',
      content: '你好！请问你能做什么？',
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

it('can create a plugin', () => {
  expect(plugin1).toBeDefined()
  expect(plugin2).toBeDefined()
  expect(plugin3).toBeDefined()
  expect(getDefaultConfig(plugin1.configSchema)).toStrictEqual({ role: 'AI助手' })
})

it('can build pipeline', async () => {
  const pipeline = buildPipeline('inbound', [
    { plugin: plugin1, config: getDefaultConfig(plugin1.configSchema) },
    { plugin: plugin2, config: getDefaultConfig(plugin2.configSchema) },
    { plugin: plugin3, config: getDefaultConfig(plugin3.configSchema) },
  ], {
    getYou: () => '你',
  })
  const result = await pipeline(testConversation)
  expect(result).toBeDefined()
  expect(result.messages.length).toBe(2)
  expect(result.messages[0].content).toMatch(/当前时间是：(.+)。你是一个AI助手，旨在帮助用户解决问题。你要以猫娘的语气回答问题喵~/)
})
