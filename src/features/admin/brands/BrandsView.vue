<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import GenericTable from '@/shared/components/GenericTable.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import RowActions from '@/shared/components/RowActions.vue'
import BrandModal from './BrandModal.vue'
import type { BrandModalPayload } from './BrandModal.vue'
import type { Brand, Model } from '@/core/models'
import { brandService, modelService } from '@/core/services/domain'

const brandTable = ref<InstanceType<typeof GenericTable> | null>(null)
const modelTable = ref<InstanceType<typeof GenericTable> | null>(null)

const selectedBrand = ref<Brand | null>(null)

// Estado Form Modal Unificado
const isModalOpen = ref(false)
const modalTitle = ref('')
const editingItem = ref<Brand | Model | null>(null)
const brandIdForModal = ref<number | null>(null)

// Estado Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref<{ type: 'brand' | 'model'; item: Brand | Model } | null>(null)

const modelFilters = computed<Record<string, string | undefined>>(() => {
	const brand = selectedBrand.value
	if (!brand) return {}
	return { brandid: brand.id?.toString() }
})

const brandColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '' },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'name', header: 'MARCA' },
]

const modelColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '' },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'name', header: 'MODELO' },
]

function isModel(item: Brand | Model): boolean {
	return 'brandId' in item
}

function onSelectBrand(brand: Brand): void {
	selectedBrand.value = brand
}

function onAddBrand(): void {
	modalTitle.value = 'Nueva Marca'
	editingItem.value = null
	brandIdForModal.value = null
	isModalOpen.value = true
}

function onAddModel(): void {
	const brand = selectedBrand.value
	if (!brand) return

	modalTitle.value = `Nuevo Modelo en ${brand.name}`
	editingItem.value = null
	brandIdForModal.value = brand.id ?? null
	isModalOpen.value = true
}

function onEditItem(item: Brand | Model): void {
	editingItem.value = item

	const model = isModel(item) ? (item as Model).brandId : null

	brandIdForModal.value = model
	modalTitle.value = model ? 'Editar Modelo' : 'Editar Marca'
	isModalOpen.value = true
}

async function onSaveItem(payload: BrandModalPayload): Promise<void> {
	try {
		const isModelPayload = !!payload.brandId
		if (isModelPayload) {
			if (payload.id) {
				await modelService.updateModel(payload.id, { name: payload.name })
			} else {
				await modelService.createModel({ name: payload.name, brandId: payload.brandId! })
			}
		} else {
			if (payload.id) {
				await brandService.updateBrand(payload.id, { name: payload.name })
			} else {
				await brandService.createBrand({ name: payload.name })
			}
		}
		isModalOpen.value = false
		refreshTables()
	} catch (err) {
		console.error('Error al guardar:', err)
	}
}

function onDeleteItem(item: Brand | Model): void {
	const type = isModel(item) ? 'model' : 'brand'
	itemToDelete.value = { type, item }
	isDeleteModalOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
	const target = itemToDelete.value
	if (!target) return

	isDeleting.value = true
	try {
		if (target.type === 'brand') {
			await brandService.deleteBrand(target.item.id!)
		} else {
			await modelService.deleteModel(target.item.id!)
		}
		isDeleteModalOpen.value = false

		if (target.type === 'brand' && selectedBrand.value?.id === target.item.id) {
			selectedBrand.value = null
		}

		itemToDelete.value = null
		refreshTables()
	} catch (err) {
		console.error('Error al eliminar:', err)
	} finally {
		isDeleting.value = false
	}
}

const deleteMessage = computed(() => {
	const target = itemToDelete.value
	if (!target) return ''
	return target.type === 'brand'
		? `¿Estás seguro de que deseas eliminar la marca "${target.item.name}"? Se eliminarán todos sus modelos asociados.`
		: `¿Estás seguro de que deseas eliminar el modelo "${target.item.name}"?`
})

function refreshTables(): void {
	brandTable.value?.reload()
	modelTable.value?.reload()
}
</script>

<template>
	<div class="p-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- TABLA 1: MARCAS -->
		<GenericTable
			ref="brandTable"
			procedure="GET_BRANDS"
			title="MARCAS"
			:columns="brandColumns"
			:show-add-button="true"
			@row-click="onSelectBrand"
			@add-clicked="onAddBrand"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>

		<!-- TABLA 2: MODELOS -->
		<GenericTable
			v-if="selectedBrand"
			ref="modelTable"
			procedure="GET_MODELS"
			:title="`MODELOS DE ${selectedBrand.name}`"
			:columns="modelColumns"
			:default-filters="modelFilters"
			:show-add-button="true"
			@add-clicked="onAddModel"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>

		<div
			v-else
			class="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]"
		>
			Selecciona una marca de la tabla izquierda para gestionar sus modelos.
		</div>
	</div>

	<!-- MODAL FORMULARIO CREAR / EDITAR -->
	<BrandModal
		:is-open="isModalOpen"
		:title="modalTitle"
		:item="editingItem"
		:selected-brand-name="selectedBrand?.name ?? null"
		:brand-id="brandIdForModal"
		@close="isModalOpen = false"
		@save="onSaveItem"
	/>

	<!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN -->
	<ConfirmModal
		:is-open="isDeleteModalOpen"
		:is-loading="isDeleting"
		title="Eliminar Registro"
		:message="deleteMessage"
		@confirm="onConfirmDelete"
		@cancel="isDeleteModalOpen = false"
	/>
</template>