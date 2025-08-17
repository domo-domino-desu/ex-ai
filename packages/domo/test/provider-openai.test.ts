import type { Provider } from '../src'
import { generateText, streamText } from 'ai'
import { expect, it } from 'vitest'
import { createSdkModel } from '../src'

const provider: Provider = {
  type: 'openai',
  baseURL: import.meta.env.VITE_OPENAI_BASE_URL!,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY!,
  model: import.meta.env.VITE_OPENAI_MODEL!,
}

it('can read env var', () => {
  expect(provider?.baseURL).toBeDefined()
  expect(provider?.apiKey).toBeDefined()
  expect(provider?.model).toBeDefined()
})

it('can generate text', async () => {
  const model = createSdkModel(provider)
  expect(model).toBeDefined()
  const response = await generateText({
    model: model!,
    prompt: 'Hello, how are you?',
    temperature: 0,
  })
  const output = response.text
  expect(output).toBeTruthy()
  if (!output.includes('Hello')) {
    console.warn('Output does not include "Hello":', output)
  }
})

it('can stream text', async () => {
  const model = createSdkModel(provider)
  expect(model).toBeDefined()
  const response = await streamText({
    model: model!,
    prompt: 'Hello, how are you?',
    temperature: 0,
  })
  let output = ''
  for await (const textPart of response.textStream) {
    output += textPart
  }
  expect(output).toBeTruthy()
  if (!output.includes('Hello')) {
    console.warn('Output does not include "Hello":', output)
  }
})
