<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Modal from '@/shared/components/Modal.vue'
import type { User } from '@/core/models'

export interface UserModalPayload {
	id?: number
	firstName: string
	lastName: string
	email: string
	username: string
	identityDocument?: string
	phoneNumber?: string
	password?: string
}

const props = withDefaults(
	defineProps<{
		isOpen: boolean
		title?: string
		item: User | null
	}>(),
	{
		title: 'Gestionar Usuario',
		item: null,
	},
)

const emit = defineEmits<{ close: []; save: [payload: UserModalPayload] }>()

const form = reactive<{
	id: number | null
	firstName: string
	lastName: string
	email: string
	username: string
	identityDocument: string
	phoneNumber: string
	password: string
}>({
	id: null,
	firstName: '',
	lastName: '',
	email: '',
	username: '',
	identityDocument: '',
	phoneNumber: '',
	password: '',
})

const touched = reactive<Record<string, boolean>>({
	firstName: false,
	lastName: false,
	email: false,
	username: false,
	password: false,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(
	() => props.isOpen,
	(open) => {
		if (!open) return
		for (const key of Object.keys(touched)) {
			touched[key] = false
		}
		if (props.item) {
			form.id = props.item.id
			form.firstName = props.item.firstName
			form.lastName = props.item.lastName
			form.email = props.item.email
			form.username = props.item.username
			form.identityDocument = props.item.identityDocument || ''
			form.phoneNumber = props.item.phoneNumber || ''
			form.password = ''
		} else {
			form.id = null
			form.firstName = ''
			form.lastName = ''
			form.email = ''
			form.username = ''
			form.identityDocument = ''
			form.phoneNumber = ''
			form.password = ''
		}
	},
)

const formValid = (): boolean =>
	form.firstName.trim().length >= 2 &&
	form.lastName.trim().length >= 2 &&
	EMAIL_RE.test(form.email.trim()) &&
	form.username.trim().length >= 3 &&
	(form.password === '' || form.password.trim().length >= 6)

function onSubmit(): void {
	for (const key of Object.keys(touched)) {
		touched[key] = true
	}
	if (!formValid()) {
		return
	}

	emit('save', {
		id: form.id ?? undefined,
		firstName: form.firstName.trim(),
		lastName: form.lastName.trim(),
		email: form.email.trim(),
		username: form.username.trim(),
		...(form.identityDocument.trim() ? { identityDocument: form.identityDocument.trim() } : {}),
		...(form.phoneNumber.trim() ? { phoneNumber: form.phoneNumber.trim() } : {}),
		...(form.password ? { password: form.password } : {}),
	})
}

function onCloseModal(): void {
	emit('close')
}
</script>

<template>
	<Modal :is-open="isOpen" :title="title" max-width-class="max-w-md" @close="onCloseModal">
		<form @submit.prevent="onSubmit" class="space-y-4">
			<!-- Nombre/s -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Nombre/s</label>
				<input
					type="text"
					v-model="form.firstName"
					@blur="touched.firstName = true"
					placeholder="Ej. Juan Carlos"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.firstName && form.firstName.trim().length < 2" class="text-[10px] text-red-400 mt-1 block">
					El nombre es obligatorio (mínimo 2 caracteres).
				</span>
			</div>

			<!-- Apellido/s -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Apellido/s</label>
				<input
					type="text"
					v-model="form.lastName"
					@blur="touched.lastName = true"
					placeholder="Ej. Pérez García"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.lastName && form.lastName.trim().length < 2" class="text-[10px] text-red-400 mt-1 block">
					El apellido es obligatorio (mínimo 2 caracteres).
				</span>
			</div>

			<!-- Email -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Correo electrónico</label>
				<input
					type="email"
					v-model="form.email"
					@blur="touched.email = true"
					placeholder="ej. usuario@email.com"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.email && !EMAIL_RE.test(form.email.trim())" class="text-[10px] text-red-400 mt-1 block">
					Ingresa un correo electrónico válido.
				</span>
			</div>

			<!-- Usuario -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">Usuario</label>
				<input
					type="text"
					v-model="form.username"
					@blur="touched.username = true"
					placeholder="Ej. admin2"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.username && form.username.trim().length < 3" class="text-[10px] text-red-400 mt-1 block">
					El nombre de usuario es obligatorio (mínimo 3 caracteres).
				</span>
			</div>

			<!-- Documento de Identidad (opcional) -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">
					Documento de Identidad <span class="text-slate-500 font-normal">(opcional)</span>
				</label>
				<input
					type="text"
					v-model="form.identityDocument"
					placeholder="Ej. 12345678"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
			</div>

			<!-- Teléfono (opcional) -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">
					Teléfono <span class="text-slate-500 font-normal">(opcional)</span>
				</label>
				<input
					type="tel"
					v-model="form.phoneNumber"
					placeholder="Ej. 987654321"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
			</div>

			<!-- Contraseña (opcional, solo reset) -->
			<div>
				<label class="block text-xs font-medium text-slate-300 mb-1">
					Nueva Contraseña <span class="text-slate-500 font-normal">(opcional)</span>
				</label>
				<input
					type="password"
					v-model="form.password"
					@blur="touched.password = true"
					placeholder="Dejar vacío para no cambiarla"
					class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
				/>
				<span v-if="touched.password && form.password.trim().length > 0 && form.password.trim().length < 6" class="text-[10px] text-red-400 mt-1 block">
					La contraseña debe tener mínimo 6 caracteres.
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
					:disabled="!formValid()"
				>
					Guardar
				</button>
			</div>
		</form>
	</Modal>
</template>