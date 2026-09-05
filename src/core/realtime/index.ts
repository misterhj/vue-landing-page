import { createSignalRChatClient } from './realtime-chat'
import type { RealtimeChatClientFactory } from './realtime-chat'

export * from './realtime-chat'

/**
 * Punto único de intercambio del transporte en tiempo real.
 * Para migrar a NestJS (socket.io, ws) basta con asignar aquí una nueva fábrica
 * que implemente la interfaz RealtimeChatClient, sin tocar el store ni la UI.
 */
export let realtimeChatClientFactory: RealtimeChatClientFactory = createSignalRChatClient

export function setRealtimeChatClientFactory(factory: RealtimeChatClientFactory): void {
	realtimeChatClientFactory = factory
}