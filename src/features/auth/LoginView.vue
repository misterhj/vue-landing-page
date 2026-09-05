<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const notificationMessage = ref<string | null>(null)
const showPassword = ref(false)

const form = reactive({
	username: '',
	password: '',
})

const touched = reactive({
	username: false,
	password: false,
})

function toggleShowPassword(): void {
	showPassword.value = !showPassword.value
}

async function onSubmit(): Promise<void> {
	touched.username = true
	touched.password = true

	if (!form.username || !form.password || form.password.length < 6) {
		return
	}

	isLoading.value = true
	errorMessage.value = null
	notificationMessage.value = null

	try {
		const response = await auth.login({ username: form.username, password: form.password })
		if (response?.message) {
			notificationMessage.value = response.message
		}
		await router.push('/admin/dashboard')
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		errorMessage.value = message || 'Credenciales erróneas o fallo de conexión.'
	} finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="min-h-screen flex items-center justify-center bg-slate-950 p-4">
		<div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
			<!-- Header -->
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-white tracking-tight">Login</h1>
				<p class="text-slate-400 text-sm mt-2">Ingresa tus credenciales para administrar la plataforma</p>
			</div>

			<!-- Error Banner -->
			<div v-if="errorMessage" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
				{{ errorMessage }}
			</div>

			<!-- Success Banner -->
			<div v-if="notificationMessage" class="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
				{{ notificationMessage }}
			</div>

			<form @submit.prevent="onSubmit" class="space-y-5">
				<!-- Usuario -->
				<div>
					<label class="block text-xs font-semibold uppercase text-slate-400 mb-2">Usuario</label>
					<input
						type="text"
						v-model="form.username"
						placeholder="admin"
						class="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
					/>
					<span v-if="touched.username && !form.username" class="text-xs text-red-400 mt-1 block">
						El nombre de usuario es requerido.
					</span>
				</div>

				<!-- Contraseña -->
				<div>
					<label class="block text-xs font-semibold uppercase text-slate-400 mb-2">Contraseña</label>
					<div class="relative">
						<input
							:type="showPassword ? 'text' : 'password'"
							v-model="form.password"
							placeholder="••••••••"
							class="w-full pl-4 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
						/>
						<button
							type="button"
							@click="toggleShowPassword"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
							:title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
						>
							<svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
							<svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.959 8.959 0 013.122-.863c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
							</svg>
						</button>
					</div>
					<span v-if="touched.password && (!form.password || form.password.length < 6)" class="text-xs text-red-400 mt-1 block">
						La contraseña es requerida (mínimo 6 caracteres).
					</span>
				</div>

				<!-- Botón Iniciar Sesión -->
				<button
					type="submit"
					:disabled="isLoading"
					class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					<span v-if="!isLoading">Iniciar Sesión</span>
					<span v-else>Ingresando...</span>
				</button>

				<!-- Enlace / Botón para ir al Registro -->
				<div class="mt-6 text-center border-t border-slate-800 pt-4">
					<p class="text-xs text-slate-400">
						¿No tienes una cuenta de administrador?
						<RouterLink to="/register" class="text-blue-400 hover:text-blue-300 font-semibold ml-1 cursor-pointer transition">
							Regístrate aquí
						</RouterLink>
					</p>
				</div>
			</form>
		</div>
	</div>
</template>