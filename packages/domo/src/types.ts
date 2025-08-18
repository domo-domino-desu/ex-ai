import type { SUPPORTED_PROVIDERS } from './provider'

export type Uuid = string

// ==== Chat ====
export interface Message {
  id: Uuid
  role: 'user' | 'assistant' | 'system'
  content: string
  specialStatus?: 'streaming' | 'error'
  metadata?: Record<string, any>
  createdAt: string
}

export interface Conversation {
  id: Uuid
  messages: Message[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// ==== Provider ====
export type ProviderType = keyof typeof SUPPORTED_PROVIDERS
export type Provider = {
  type: 'openai'
  baseURL: string
  apiKey: string
  model: string
} | {
  type: 'gemini'
  baseURL: string
  apiKey: string
  model: string
}

// ==== Plugin ====
export interface ConfigItemBase {
  description?: string
  validation?: (value: any) => boolean | string
}

export interface StringConfigItem extends ConfigItemBase {
  type: 'string'
  default: string
  showAsTextArea?: boolean
}

export interface NumberConfigItem extends ConfigItemBase {
  type: 'number'
  default: number
}

export interface BooleanConfigItem extends ConfigItemBase {
  type: 'boolean'
  default: boolean
}

export interface SelectConfigItem extends ConfigItemBase {
  type: 'select'
  default: string
  options: string[]
}

export interface MultiSelectConfigItem extends ConfigItemBase {
  type: 'multiselect'
  default: string[]
  options: string[]
}

export type ConfigItem
  = | StringConfigItem
    | NumberConfigItem
    | BooleanConfigItem
    | SelectConfigItem
    | MultiSelectConfigItem
export type ConfigSchema = Record<string, ConfigItem>

export type ConfigFromSchema<TSchema extends ConfigSchema> = {
  -readonly [K in keyof TSchema]: TSchema[K] extends { type: 'string' }
    ? string
    : TSchema[K] extends { type: 'number' }
      ? number
      : TSchema[K] extends { type: 'boolean' }
        ? boolean
        : TSchema[K] extends { type: 'select' }
          ? string
          : TSchema[K] extends { type: 'multiselect' }
            ? string[]
            : never;
}

export type HandlerFn<TSchema extends ConfigSchema> = (
  chat: Conversation,
  config: ConfigFromSchema<TSchema>,
  capabilities: Record<any, (...args: any) => any>,
) => Promise<Conversation>

export interface Plugin<TSchema extends ConfigSchema> {
  name: string
  description: string
  configSchema: TSchema
  /**
   * Allow extension to modify what will be shown in the chat.
   */
  inboundHooks?: {
    order: number
    /**
     * This handler will be called on the pipeline of receiving data from the AI provider.
     * @param chat The chat object containing messages and metadata.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: HandlerFn<TSchema>
  }[]
  /**
   * Allow extension to modify what will be sent to the AI provider.
   */
  outboundHooks?: {
    order: number
    /**
     * This handler will be called on the pipeline of sending data to the AI provider.
     * @param chat The chat object containing messages and metadata.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: HandlerFn<TSchema>
  }[]
  /**
   * Allow extension to maintain a consistent state of the chat history.
   */
  modHooks?: {
    order: number
    /**
     * This handler will be called whenever the chat history is changed,
     * such as a message being added, edited, or deleted, or a new conversation being created.
     * (By `added', we mean 1. before user sends, 2. after AI provider fully responds.)
     * **This is only useful for plugins that need to maintain a consistent state.**
     * The result will be used as the new source-of-truth chat history.
     * @param chat The source-of-truth chat history.
     * @param config The configuration object based on the schema.
     * @param capabilities An object containing capabilities that the extension can use.
     * @return The modified chat object.
     */
    handler: HandlerFn<TSchema>
  }[]
  /**
   * Allow extension to add additional components to the chat UI.
   */
  additionalComponents?: {
    [key: string]: React.ComponentType<any>
  }
}
