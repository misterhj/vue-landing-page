import { defineStore } from 'pinia'
import { ref } from 'vue'
import { realtimeChatClientFactory } from '@/core/realtime'
import type { ChatConnectionState, ChatMessageDto, RealtimeChatClient } from '@/core/realtime'
import { environment } from '@/environments/environment'
import { getCustomerToken } from '@/core/utils/cookies'
import { api } from '@/core/services/http'

export const useChatStore = defineStore('chat', () => {
	const messages = ref<ChatMessageDto[]>([])
	const connectionState = ref<ChatConnectionState>('disconnected')
	const botTyping = ref(false)

	let client: RealtimeChatClient | null = null

	function handleReceiveMessage(msg: ChatMessageDto): void {
		if (msg.sender === 'bot') {
			botTyping.value = false
		}
		const existing = messages.value.some((m) => m.sentAt === msg.sentAt && m.content === msg.content)
		if (!existing) {
			messages.value.push(msg)
		}
	}

	async function connect(): Promise<void> {
		if (client) {
			return
		}
		const token = getCustomerToken()
		if (!token) {
			return
		}

		client = realtimeChatClientFactory(`${environment.hubUrl}/chat`, () => getCustomerToken())
		client.onMessage(handleReceiveMessage)
		client.onStateChange((state) => {
			connectionState.value = state
		})

		connectionState.value = 'connecting'
		try {
			await client.connect()
			connectionState.value = 'connected'
		} catch (err) {
			console.error('Error al conectar al chat:', err)
			await disconnect()
		}
	}

	async function disconnect(): Promise<void> {
		if (client) {
			await client.disconnect()
		}
		client = null
		connectionState.value = 'disconnected'
	}

	async function send(content: string): Promise<void> {
		if (!client || connectionState.value !== 'connected') {
			return
		}
		botTyping.value = true
		try {
			await client.send(content)
		} catch (err) {
			console.error('Error al enviar mensaje:', err)
			botTyping.value = false
		}
	}

	async function loadHistory(): Promise<void> {
		try {
			const history = await api.get<Array<{ senderType?: string; sender?: string; content: string; createdAt?: string; sentAt?: string }>>(
				'/chat/history',
				{ customerToken: true },
			)
			messages.value = history.map((m) => ({
				sender: m.sender === 'user' ? 'user' : (m.senderType === 'user' ? 'user' : 'bot'),
				content: m.content,
				sentAt: m.sentAt ?? m.createdAt ?? '',
			}))
		} catch {
			/* fallo silencioso */
		}
	}

	function reset(): void {
		void disconnect()
		messages.value = []
		botTyping.value = false
		connectionState.value = 'disconnected'
	}

	return {
		messages,
		connectionState,
		botTyping,
		connect,
		disconnect,
		send,
		loadHistory,
		reset,
	}
})