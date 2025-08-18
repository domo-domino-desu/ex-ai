import type { ModelMessage } from 'ai'
import type { Conversation } from './types'

export function transformToSdkMessages(conversation: Conversation): ModelMessage[] {
  return conversation.messages.map(message => ({
    id: message.id,
    role: message.role,
    content: message.content,
  }))
}
