import * as signalR from '@microsoft/signalr'

export type ChatConnectionState = 'disconnected' | 'connecting' | 'connected'

export interface ChatMessageDto {
	sender: 'user' | 'bot'
	content: string
	sentAt: string
}

export interface RealtimeChatClient {
	connect(): Promise<void>
	disconnect(): Promise<void>
	onMessage(callback: (msg: ChatMessageDto) => void): void
	onStateChange(callback: (state: ChatConnectionState) => void): void
	send(content: string): Promise<void>
}

export type RealtimeChatClientFactory = (
	url: string,
	tokenProvider: () => string | null,
) => RealtimeChatClient

/**
 * Implementación sobre ASP.NET Core SignalR.
 * Cuando el backend migre a NestJS, basta con crear una nueva fábrica
 * (p. ej. socket.io) con esta misma interfaz y cambiarla en el store de chat.
 */
export function createSignalRChatClient(
	url: string,
	tokenProvider: () => string | null,
): RealtimeChatClient {
	const connection = new signalR.HubConnectionBuilder()
		.withUrl(url, {
			accessTokenFactory: () => tokenProvider() ?? '',
		})
		.withAutomaticReconnect([0, 2000, 5000, 10000])
		.configureLogging(signalR.LogLevel.Warning)
		.build()

	return {
		async connect() {
			await connection.start()
		},
		async disconnect() {
			await connection.stop()
		},
		onMessage(callback) {
			connection.on('ReceiveMessage', (msg: ChatMessageDto) => callback(msg))
		},
		onStateChange(callback) {
			connection.onreconnecting(() => callback('connecting'))
			connection.onreconnected(() => callback('connected'))
			connection.onclose(() => callback('disconnected'))
		},
		async send(content) {
			await connection.send('SendMessage', content)
		},
	}
}