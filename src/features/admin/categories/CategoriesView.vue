<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import GenericTable from '@/shared/components/GenericTable.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import RowActions from '@/shared/components/RowActions.vue'
import CategoryModal from './CategoryModal.vue'
import type { CategoryModalPayload } from './CategoryModal.vue'
import type { Category } from '@/core/models'
import { categoryService } from '@/core/services/domain'

const catTable = ref<InstanceType<typeof GenericTable> | null>(null)
const subTable = ref<InstanceType<typeof GenericTable> | null>(null)

const selectedCategory = ref<Category | null>(null)

// Estado Form Modal
const isModalOpen = ref(false)
const modalTitle = ref('')
const editingItem = ref<Category | null>(null)
const parentCategoryIdForModal = ref<number | null>(null)

// Estado Delete Confirm Modal
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const itemToDelete = ref<Category | null>(null)

const subFilters = computed<Record<string, string | undefined>>(() => {
	const cat = selectedCategory.value
	if (!cat) return {}
	return { categoryid: cat.id.toString() }
})

const catColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '' },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'name', header: 'CATEGORÍA PRINCIPAL' },
	{ accessorKey: 'slug', header: 'SLUG' },
]

const subColumns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: '' },
	{ accessorKey: 'id', header: 'ID', enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'name', header: 'SUBCATEGORÍA' },
	{ accessorKey: 'slug', header: 'SLUG' },
]

function isSubcategory(item: Category): boolean {
	return 'categoryId' in item || 'parentCategoryId' in (item as unknown as Record<string, unknown>)
}

function onSelectCategory(category: Category): void {
	selectedCategory.value = category
}

function onAddCategory(): void {
	modalTitle.value = 'Nueva Categoría Principal'
	editingItem.value = null
	parentCategoryIdForModal.value = null
	isModalOpen.value = true
}

function onAddSubcategory(): void {
	const parentCat = selectedCategory.value
	if (!parentCat) return

	modalTitle.value = `Nueva Subcategoría en ${parentCat.name}`
	editingItem.value = null
	parentCategoryIdForModal.value = parentCat.id
	isModalOpen.value = true
}

function onEditItem(item: Category): void {
	editingItem.value = item

	const parentId =
		'categoryId' in item
			? (item.categoryId as number | null | undefined) ?? null
			: ((item as unknown as Record<string, unknown>).parentCategoryId as number | undefined) ?? null

	parentCategoryIdForModal.value = parentId
	modalTitle.value = parentId ? 'Editar Subcategoría' : 'Editar Categoría Principal'
	isModalOpen.value = true
}

async function onSaveItem(payload: CategoryModalPayload): Promise<void> {
	try {
		if (payload.id) {
			await categoryService.updateCategory(payload.id, { name: payload.name, slug: payload.slug })
		} else {
			await categoryService.createCategory(payload)
		}
		isModalOpen.value = false
		refreshTables()
	} catch (err) {
		console.error('Error al guardar categoría:', err)
	}
}

function onDeleteItem(item: Category): void {
	itemToDelete.value = item
	isDeleteModalOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
	const item = itemToDelete.value
	if (!item) return

	isDeleting.value = true
	try {
		await categoryService.deleteCategory(item.id)
		isDeleteModalOpen.value = false

		if (selectedCategory.value?.id === item.id && !isSubcategory(item)) {
			selectedCategory.value = null
		}

		itemToDelete.value = null
		refreshTables()
	} catch (err) {
		console.error('Error al eliminar categoría:', err)
	} finally {
		isDeleting.value = false
	}
}

const deleteMessage = computed(() => {
	const item = itemToDelete.value
	if (!item) return ''
	if (isSubcategory(item)) {
		return `¿Estás seguro de que deseas eliminar la subcategoría "${item.name}"?`
	}
	return `¿Estás seguro de que deseas eliminar "${item.name}"? Se pueden ver afectadas sus subcategorías asociadas.`
})

function refreshTables(): void {
	catTable.value?.reload()
	subTable.value?.reload()
}
</script>

<template>
	<div class="p-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- TABLA 1: CATEGORÍAS PRINCIPALES -->
		<GenericTable
			ref="catTable"
			procedure="GET_CATEGORIES"
			title="CATEGORÍAS PRINCIPALES"
			:columns="catColumns"
			@row-click="onSelectCategory"
			@add-clicked="onAddCategory"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>

		<!-- TABLA 2: SUBCATEGORÍAS -->
		<GenericTable
			v-if="selectedCategory"
			ref="subTable"
			procedure="GET_SUBCATEGORIES"
			:title="`SUBCATEGORÍAS DE ${selectedCategory.name}`"
			:columns="subColumns"
			:default-filters="subFilters"
			@add-clicked="onAddSubcategory"
		>
			<template #cell-actions="{ row }">
				<RowActions :row="row" @edit="onEditItem($event)" @delete="onDeleteItem($event)" />
			</template>
		</GenericTable>

		<div
			v-else
			class="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[300px]"
		>
			Selecciona una categoría de la tabla izquierda para gestionar sus subcategorías.
		</div>
	</div>

	<!-- MODAL FORMULARIO CREAR / EDITAR -->
	<CategoryModal
		:is-open="isModalOpen"
		:title="modalTitle"
		:item="editingItem"
		:parent-category-id="parentCategoryIdForModal"
		@close="isModalOpen = false"
		@save="onSaveItem"
	/>

	<!-- MODAL CONFIRMACIÓN DE ELIMINACIÓN -->
	<ConfirmModal
		:is-open="isDeleteModalOpen"
		title="Eliminar Registro"
		:message="deleteMessage"
		:is-loading="isDeleting"
		@cancel="isDeleteModalOpen = false"
		@confirm="onConfirmDelete"
	/>
</template>