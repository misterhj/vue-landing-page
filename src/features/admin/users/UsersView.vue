<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import GenericTable from '@/shared/components/GenericTable.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import RowActions from '@/shared/components/RowActions.vue'
import UserModal from './UserModal.vue'
import type { UserModalPayload } from './UserModal.vue'
import type { User } from '@/core/models'
import { userService } from '@/core/services/domain'

const userTable = ref<InstanceType<typeof GenericTable> | null>(null)

// Estado Form Modal
const isModalOpen = ref(false)
const modalTitle = ref('')
const editingItem = ref<User | null>(null)

// Estado Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref<User | null>(null)

const userColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '' },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'firstName', header: 'Nombre' },
	{ accessorKey: 'lastName', header: 'Apellido' },
	{ accessorKey: 'email', header: 'Email' },
	{ accessorKey: 'username', header: 'Usuario' },
	{ accessorKey: 'identityDocument', header: 'Documento' },
	{ accessorKey: 'phoneNumber', header: 'Teléfono' },
	{ accessorKey: 'isActive', header: 'Activo', cell: ({ row }) => (row.original.isActive ? 'Sí' : 'No') },
]

function onEditItem(item: User): void {
	editingItem.value = item
	modalTitle.value = 'Editar Usuario'
	isModalOpen.value = true
}

async function onSaveItem(payload: UserModalPayload): Promise<void> {
	if (!payload.id) return
	try {
		await userService.updateUser(payload.id, payload)
		isModalOpen.value = false
		userTable.value?.reload()
	} catch (err) {
		console.error('Error al guardar usuario:', err)
	}
}

function onDeleteItem(item: User): void {
	itemToDelete.value = item
	isDeleteModalOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
	const item = itemToDelete.value
	if (!item) return

	isDeleting.value = true
	try {
		await userService.deleteUser(item.id)
		isDeleteModalOpen.value = false
		itemToDelete.value = null
		userTable.value?.reload()
	} catch (err) {
		console.error('Error al eliminar usuario:', err)
	} finally {
		isDeleting.value = false
	}
}

const deleteMessage = computed(() =>
	itemToDelete.value ? `¿Estás seguro de que deseas eliminar al usuario "${itemToDelete.value.username}"?` : '',
)
</script>

<template>
	<div class="p-1">
		<GenericTable
			ref="userTable"
			procedure="GET_USERS"
			title="USUARIOS"
			:columns="userColumns"
			:show-add-button="false"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>
	</div>

	<!-- MODAL FORMULARIO EDITAR -->
	<UserModal
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
		title="Eliminar Usuario"
		:message="deleteMessage"
		@confirm="onConfirmDelete"
		@cancel="isDeleteModalOpen = false"
	/>
</template>