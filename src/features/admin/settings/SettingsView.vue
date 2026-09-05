<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import GenericTable from '@/shared/components/GenericTable.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import RowActions from '@/shared/components/RowActions.vue'
import SettingsModal from './SettingsModal.vue'
import type { SettingsModalPayload } from './SettingsModal.vue'
import type { Settings } from '@/core/models'
import { settingsService } from '@/core/services/domain'

const settingsTable = ref<InstanceType<typeof GenericTable> | null>(null)

// Estado Form Modal
const isModalOpen = ref(false)
const modalTitle = ref('')
const editingItem = ref<Settings | null>(null)

// Estado Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref<Settings | null>(null)

const settingsColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '', size: 70 },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'key', header: 'CLAVE', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'value', header: 'VALOR', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'description', header: 'DESCRIPCIÓN', enableSorting: true, enableColumnFilter: true },
]

function onAddSettings(): void {
	modalTitle.value = 'Nueva Configuración'
	editingItem.value = null
	isModalOpen.value = true
}

function onEditItem(item: Settings): void {
	editingItem.value = item
	modalTitle.value = 'Editar Configuración'
	isModalOpen.value = true
}

async function onSaveItem(payload: SettingsModalPayload): Promise<void> {
	try {
		if (payload.id) {
			await settingsService.updateSettings(payload.id, {
				value: payload.value,
				description: payload.description,
			})
		} else {
			await settingsService.createSettings({
				key: payload.key,
				value: payload.value,
				description: payload.description,
			})
		}
		isModalOpen.value = false
		settingsTable.value?.reload()
	} catch (err) {
		console.error('Error al guardar configuración:', err)
	}
}

function onDeleteItem(item: Settings): void {
	itemToDelete.value = item
	isDeleteModalOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
	const item = itemToDelete.value
	if (!item?.id) return

	isDeleting.value = true
	try {
		await settingsService.deleteSettings(item.id)
		isDeleteModalOpen.value = false
		itemToDelete.value = null
		settingsTable.value?.reload()
	} catch (err) {
		console.error('Error al eliminar configuración:', err)
	} finally {
		isDeleting.value = false
	}
}

const deleteMessage = computed(() =>
	itemToDelete.value ? `¿Estás seguro de que deseas eliminar la configuración "${itemToDelete.value.key}"?` : '',
)
</script>

<template>
	<div class="p-1">
		<!-- TABLA DE CONFIGURACIONES -->
		<GenericTable
			ref="settingsTable"
			procedure="GET_SETTINGS"
			title="GESTIÓN DE CONFIGURACIONES"
			:columns="settingsColumns"
			:show-add-button="true"
			@add-clicked="onAddSettings"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>
	</div>

	<!-- MODAL FORMULARIO CREAR / EDITAR -->
	<SettingsModal
		:is-open="isModalOpen"
		:title="modalTitle"
		:item="editingItem"
		@close="isModalOpen = false"
		@save="onSaveItem"
	/>

	<!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN -->
	<ConfirmModal
		:is-open="isDeleteModalOpen"
		:is-loading="isDeleting"
		title="Eliminar Configuración"
		:message="deleteMessage"
		@confirm="onConfirmDelete"
		@cancel="isDeleteModalOpen = false"
	/>
</template>