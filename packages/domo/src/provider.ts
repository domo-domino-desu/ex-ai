import type { Provider } from './types'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'

export const SUPPORTED_PROVIDERS = {
  openai: {
    defaultURL: 'https://api.openai.com/v1',
    urlTip: 'Expected to end with v1',
  },
  gemini: {
    defaultURL: 'https://generativeai.googleapis.com/v1beta',
    urlTip: 'Expected to end with v1beta',
  },
} as const

export function createSdkModel(provider: Provider) {
  if (provider.type === 'openai') {
    const sdkProvider = createOpenAI({
      baseURL: provider.baseURL || SUPPORTED_PROVIDERS.openai.defaultURL,
      apiKey: provider.apiKey,
    })
    return sdkProvider.chat(provider.model)
  }
  else if (provider.type === 'gemini') {
    const sdkProvider = createGoogleGenerativeAI({
      baseURL: provider.baseURL || SUPPORTED_PROVIDERS.gemini.defaultURL,
      apiKey: provider.apiKey,
    })
    return sdkProvider.chat(provider.model)
  }
}
