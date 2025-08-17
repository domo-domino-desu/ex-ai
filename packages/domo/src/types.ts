import type { SUPPORTED_PROVIDERS } from './provider'

export type Uuid = string

// ==== Chat ====
export interface Message {
  id: Uuid
  role: 'user' | 'assistant' | 'system'
  content: string
  status: 'streaming' | 'completed' | 'error'
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

export interface Plugin<TSchema extends ConfigSchema> {
  name: string
  description: string
  configSchema: TSchema
}
