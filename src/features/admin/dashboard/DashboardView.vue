<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const username = computed(() => auth.getUserName()?.trim() || 'Administrador')
</script>

<template>
	<div class="p-4">
		<div class="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
			<div class="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
				<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
			</div>
			<h2 class="text-lg font-bold text-white mb-1">Bienvenido, {{ username }}</h2>
			<p class="text-xs text-slate-400 max-w-sm leading-relaxed">
				Usá el menú lateral para gestionar productos, catálogo, usuarios y configuraciones del sitio.
			</p>
		</div>
	</div>
</template>