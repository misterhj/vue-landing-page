<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Modal from '@/shared/components/Modal.vue'

export interface SectionModalPayload {
	id?: number
	name: string
}

const props = withDefaults(
	defineProps<{
		isOpen: boolean
		title?: string
		item: { id?: number; name: string } | null
	}>(),
	{
		title: 'Gestionar Sección',
		item: null,
	},
)

const emit = defineEmits<{ close: []; save: [payload: SectionModalPayload] }>()

interface FormState {
	id: number | null
	name: string
}

const form = reactive<FormState>({ id: null, name: '' })
const nameTouched = ref(false)

watch(
	() => props.isOpen,
	(open) => {
		if (!open) return
		nameTouched.value = false
		if (props.item) {
			form.id = props.item.id ?? null
			form.name = props.item.name
		} else {
			form.id = null
			form.name = ''
		}
	},
)

function onSubmit(): void {
	nameTouched.value = true
	if (form.name.trim().length < 2) {
		return
	}
	emit('save', {
		id: form.id ?? undefined,
		name: form.name.trim(),
	})
}

function onCloseModal(): void {
	emit('close')
}
</script>

<template>
	<Modal :is-open="isOpen" :title="title" max-width-class="max-w-md" @close="onCloseModal">
		<form @submit.prevent="onSubmit" class="space-y-4">
			<!-- Campo Nombre -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Nombre de la sección</label>
				<input
					type="text"
					v-model="form.name"
					@blur="nameTouched = true"
					placeholder="Ej. Destacados, Ofertas del Mes, Novedades..."
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="nameTouched && form.name.trim().length < 2" class="text-[10px] text-red-400 mt-1 block">
					El nombre es obligatorio (mínimo 2 caracteres).
				</span>
			</div>

			<!-- BOTONES DE ACCIÓN -->
			<div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-800/80">
				<button
					type="button"
					@click="onCloseModal"
					class="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
				>
					Cancelar
				</button>
				<button
					type="submit"
					class="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition shadow-md cursor-pointer"
					:disabled="form.name.trim().length < 2"
				>
					Guardar
				</button>
			</div>
		</form>
	</Modal>
</template>