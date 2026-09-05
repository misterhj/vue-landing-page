<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Modal from '@/shared/components/Modal.vue'
import type { Settings } from '@/core/models'

export interface SettingsModalPayload {
	id?: number
	key: string
	value: string
	description?: string
}

const props = withDefaults(
	defineProps<{
		isOpen: boolean
		title?: string
		item: Settings | null
	}>(),
	{
		title: 'Gestionar Configuración',
		item: null,
	},
)

const emit = defineEmits<{ close: []; save: [payload: SettingsModalPayload] }>()

const form = reactive<{ id: number | null; key: string; value: string; description: string }>({
	id: null,
	key: '',
	value: '',
	description: '',
})

const touched = reactive<Record<string, boolean>>({ key: false, value: false })

watch(
	() => props.isOpen,
	(open) => {
		if (!open) return
		for (const key of Object.keys(touched)) {
			touched[key] = false
		}
		if (props.item) {
			form.id = props.item.id ?? null
			form.key = props.item.key
			form.value = props.item.value
			form.description = props.item.description ?? ''
		} else {
			form.id = null
			form.key = ''
			form.value = ''
			form.description = ''
		}
	},
)

function onSubmit(): void {
	touched.key = true
	touched.value = true
	if (form.key.trim().length < 2 || !form.value.trim()) {
		return
	}

	emit('save', {
		id: form.id ?? undefined,
		key: form.key.trim(),
		value: form.value.trim(),
		...(form.description.trim() ? { description: form.description.trim() } : {}),
	})
}

function onCloseModal(): void {
	emit('close')
}
</script>

<template>
	<Modal :is-open="isOpen" :title="title" max-width-class="max-w-lg" @close="onCloseModal">
		<form @submit.prevent="onSubmit" class="space-y-4">
			<!-- Campo Clave -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Clave</label>
				<input
					type="text"
					v-model="form.key"
					@blur="touched.key = true"
					:readonly="!!item"
					:class="{ 'opacity-60': !!item }"
					placeholder="Ej. Api:SyncKey"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.key && form.key.trim().length < 2" class="text-[10px] text-red-400 mt-1 block">
					La clave es obligatoria (mínimo 2 caracteres).
				</span>
			</div>

			<!-- Campo Valor -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Valor</label>
				<textarea
					v-model="form.value"
					@blur="touched.value = true"
					rows="7"
					placeholder="Ej. valor de la configuración"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition resize-y placeholder:text-slate-500"
				></textarea>
				<span v-if="touched.value && !form.value.trim()" class="text-[10px] text-red-400 mt-1 block">
					El valor es obligatorio.
				</span>
			</div>

			<!-- Campo Descripción -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
				<textarea
					v-model="form.description"
					rows="2"
					placeholder="Descripción opcional de la configuración"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition resize-none placeholder:text-slate-500"
				></textarea>
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
					:disabled="form.key.trim().length < 2 || !form.value.trim()"
				>
					Guardar
				</button>
			</div>
		</form>
	</Modal>
</template>