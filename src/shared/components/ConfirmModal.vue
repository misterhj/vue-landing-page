<script setup lang="ts">
import Modal from '@/shared/components/Modal.vue'

withDefaults(
	defineProps<{
		isOpen: boolean
		title?: string
		message?: string
		confirmText?: string
		cancelText?: string
		isLoading?: boolean
	}>(),
	{
		title: 'Confirmar Acción',
		message: '',
		confirmText: 'Eliminar',
		cancelText: 'Cancelar',
		isLoading: false,
	},
)

const emit = defineEmits<{ cancel: []; confirm: [] }>()
</script>

<template>
	<Modal
		:is-open="isOpen"
		:title="title"
		max-width-class="max-w-sm"
		:close-on-escape="!isLoading"
		:close-on-backdrop="!isLoading"
		@close="emit('cancel')"
	>
		<div class="text-center space-y-4">
			<!-- Ícono de Advertencia -->
			<div class="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</div>

			<!-- Mensaje -->
			<p class="text-xs text-slate-400 leading-relaxed">{{ message }}</p>

			<!-- Botones de Acción -->
			<div class="pt-3 flex items-center justify-center gap-2 border-t border-slate-800/80">
				<button
					type="button"
					:disabled="isLoading"
					@click="emit('cancel')"
					class="px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition cursor-pointer"
				>
					{{ cancelText }}
				</button>
				<button
					type="button"
					:disabled="isLoading"
					@click="emit('confirm')"
					class="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
				>
					<svg v-if="isLoading" class="animate-spin w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					{{ isLoading ? 'Eliminando...' : confirmText }}
				</button>
			</div>
		</div>
	</Modal>
</template>