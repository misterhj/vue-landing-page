<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const errorMessage = ref('')

const hash = typeof location !== 'undefined' ? location.hash : ''
const tokenMatch = /[#&]token=([^&]+)/.exec(hash)
const errorParam = String(route.query.error ?? '')

if (tokenMatch) {
	auth.setCustomerToken(decodeURIComponent(tokenMatch[1] ?? ''))
	void router.replace('/')
} else if (errorParam === 'no_email') {
	errorMessage.value = 'Tu cuenta del proveedor no expone un correo verificable. Probá con otro método.'
} else if (errorParam) {
	errorMessage.value = 'No pudimos completar el inicio de sesión. Intentá nuevamente.'
}
</script>

<template>
	<div class="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-600">
		<template v-if="!errorMessage">
			<div class="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
			<p class="text-sm">Iniciando tu sesión...</p>
		</template>
		<template v-else>
			<p class="text-sm text-rose-600 font-medium">{{ errorMessage }}</p>
			<RouterLink to="/" class="text-sm underline hover:text-slate-900">Volver al inicio</RouterLink>
		</template>
	</div>
</template>