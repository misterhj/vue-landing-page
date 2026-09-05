<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { environment } from '@/environments/environment'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const auth = useAuthStore()
const chat = useChatStore()

const isOpen = ref(false)
const draft = ref('')
const scroller = ref<HTMLDivElement | null>(null)

const suggestions = ['Horarios', 'Envíos', 'Formas de pago', 'Garantías']

function connectionLabel(): string {
	switch (chat.connectionState) {
		case 'connected':
			return 'En línea'
		case 'connecting':
			return 'Conectando...'
		default:
			return 'Sin conexión'
	}
}

async function toggle(): Promise<void> {
	isOpen.value = !isOpen.value
	if (isOpen.value && auth.isCustomerAuthenticated) {
		if (chat.messages.length === 0) {
			await chat.loadHistory()
		}
		await chat.connect()
	}
}

function close(): void {
	isOpen.value = false
}

function loginWith(url: string): void {
	if (typeof window !== 'undefined') {
		window.location.href = url
	}
}

function onKeyup(event: KeyboardEvent): void {
	if (event.key === 'Enter') {
		send()
	}
}

function send(text?: string): void {
	const content = (text ?? draft.value).trim()
	if (!content) {
		return
	}
	void chat.send(content)
	draft.value = ''
}

watch(
	() => [chat.messages.length, chat.botTyping],
	async () => {
		await nextTick()
		const el = scroller.value
		if (el) {
			el.scrollTop = el.scrollHeight
		}
	},
)
</script>

<template>
	<!-- Panel del chat -->
	<div
		v-if="isOpen"
		class="fixed bottom-24 sm:bottom-28 right-4 sm:right-6 z-50 w-[92vw] max-w-[380px] h-[420px] sm:h-[430px] max-h-[calc(100vh-9rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 flex flex-col overflow-hidden"
	>
		<!-- Encabezado -->
		<div class="bg-slate-900 text-white px-4 py-3 flex items-center gap-3 shrink-0">
			<div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
				<svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="4" y="8" width="16" height="11" rx="3" />
					<path d="M12 8V4m0 0h2" />
					<circle cx="9" cy="13.5" r="1" fill="currentColor" stroke="none" />
					<circle cx="15" cy="13.5" r="1" fill="currentColor" stroke="none" />
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold leading-tight">Asistente CuteStore</p>
				<p class="text-[11px] leading-tight" :class="chat.connectionState === 'connected' ? 'text-emerald-400' : 'text-slate-400'">
					{{ connectionLabel() }}
				</p>
			</div>
			<button @click="close" aria-label="Cerrar chat" class="p-1.5 rounded-lg hover:bg-slate-700 transition cursor-pointer">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Vista de login social -->
		<div v-if="!auth.isCustomerAuthenticated" class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
			<div class="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-slate-700 leading-relaxed">
				¡Hola! Soy el asistente virtual de CuteStore. Para empezar la conversación e identificar tus mensajes,
				iniciá sesión con tu cuenta favorita.
			</div>

			<button
				@click="loginWith(environment.googleLoginUrl)"
				class="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
			>
				<svg class="w-5 h-5" viewBox="0 0 24 24">
					<path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.62.75 3.84 3.27 2.06 7l3.66 2.84C6.6 7.18 9.05 5.04 12 5.04z" />
					<path fill="#4285F4" d="M23.25 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.32c-.27 1.46-1.1 2.7-2.34 3.53l3.63 2.82c2.12-1.96 3.64-4.85 3.64-8.59z" />
					<path fill="#FBBC05" d="M5.73 14.39c-.22-.65-.35-1.34-.35-2.06s.13-1.41.34-2.06L2.06 7.43A11.26 11.26 0 0 0 .75 12.33c0 1.78.43 3.45 1.31 4.9l3.67-2.84z" />
					<path fill="#34A853" d="M12 23.91c2.97 0 5.46-.98 7.28-2.65l-3.63-2.82c-.98.66-2.23 1.05-3.65 1.05-2.95 0-5.4-2.14-6.27-4.79l-3.66 2.84c1.78 3.72 5.56 6.37 9.93 6.37z" />
				</svg>
				Continuar con Google
			</button>

			<button
				@click="loginWith(environment.facebookLoginUrl)"
				class="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-semibold transition cursor-pointer"
			>
				<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
					<path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
				</svg>
				Continuar con Facebook
			</button>

			<p class="text-[11px] text-slate-500 text-center leading-relaxed px-2">
				Solo usamos tu cuenta para identificar la conversación. No publicamos nada en tu perfil.
			</p>
		</div>

		<!-- Vista de conversación -->
		<template v-if="auth.isCustomerAuthenticated">
			<div ref="scroller" class="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50">
				<!-- Estado inicial / conectando -->
				<div
					v-if="chat.messages.length === 0 && chat.connectionState !== 'connected'"
					class="h-full flex items-center justify-center gap-2 text-xs text-slate-400"
				>
					<div class="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
					<span>{{ chat.connectionState === 'connecting' ? 'Conectando...' : 'Sin conexión con el servidor' }}</span>
				</div>

				<!-- Burbujas -->
				<div
					v-for="(msg, i) in chat.messages"
					:key="i"
					class="max-w-[80%] px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line break-words"
					:class="msg.sender === 'user'
						? 'ml-auto bg-slate-900 text-white rounded-2xl rounded-br-md'
						: 'mr-auto bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-md'"
				>
					{{ msg.content }}
				</div>

				<!-- Indicador escribiendo -->
				<div v-if="chat.botTyping" class="mr-auto bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 inline-flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
					<span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]"></span>
					<span class="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]"></span>
				</div>
			</div>

			<!-- Consultas rápidas -->
			<div v-if="chat.messages.length === 0" class="flex flex-wrap gap-2 px-3 pb-2 shrink-0">
				<button
					v-for="suggestion in suggestions"
					:key="suggestion"
					@click="send(suggestion)"
					class="text-xs px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900 transition cursor-pointer"
				>
					{{ suggestion }}
				</button>
			</div>

			<!-- Input -->
			<div class="border-t border-slate-200 p-2.5 flex items-center gap-2 bg-white shrink-0">
				<input
					type="text"
					v-model="draft"
					@keyup="onKeyup"
					placeholder="Escribí tu mensaje..."
					class="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
				/>
				<button
					@click="send()"
					:disabled="chat.connectionState !== 'connected' || !draft.trim()"
					aria-label="Enviar mensaje"
					class="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
					</svg>
				</button>
			</div>
		</template>
	</div>

	<!-- Botón lanzador -->
	<button
		v-if="!isOpen"
		@click="toggle"
		aria-label="Abrir chat de ayuda"
		title="¿Necesitás ayuda? Chateá con nosotros"
		class="fixed bottom-24 sm:bottom-28 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-700 text-white shadow-lg shadow-slate-900/20 flex items-center justify-center transition hover:scale-105 cursor-pointer"
	>
		<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
		</svg>
	</button>
</template>