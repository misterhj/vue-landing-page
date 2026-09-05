<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import GenericTable from '@/shared/components/GenericTable.vue'
import type { SelectFilterConfig } from '@/shared/components/GenericTable.vue'
import type { Product } from '@/core/models'
import { brandService, categoryService, modelService, sectionService } from '@/core/services/domain'
import { formatGs } from '@/core/utils/format'

const emit = defineEmits<{
	onCreate: []
	onEdit: [product: Product]
	onDelete: [product: Product]
}>()

const genericTable = ref<InstanceType<typeof GenericTable> | null>(null)

const columns: ColumnDef<any, any>[] = [
	{ id: 'actions', header: 'Acciones', size: 120, enableSorting: false, enableColumnFilter: false },
	{ accessorKey: 'id', header: 'ID', size: 60, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'code', header: 'Código', size: 120, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'barcode', header: 'Código de Barras', size: 150, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'name', header: 'Producto', size: 250, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'section', header: 'Sección', size: 140, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'category', header: 'Categoría', size: 160, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'subcategory', header: 'Subcategoría', size: 140, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'brand', header: 'Marca', size: 120, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'model', header: 'Modelo', size: 120, enableSorting: true, enableColumnFilter: true },
	{ accessorKey: 'price', header: 'Precio', size: 120, enableSorting: true, enableColumnFilter: false },
	{ accessorKey: 'stock', header: 'Stock', size: 90, enableSorting: true, enableColumnFilter: false },
]

const selectFilters = ref<Record<string, SelectFilterConfig>>({})

onMounted(async () => {
	await Promise.allSettled([
		sectionService.getSections().then((data) => {
			selectFilters.value = {
				...selectFilters.value,
				section: { options: data, placeholder: 'Filtrar por sección...', filterKey: 'sectionId', numeric: true },
			}
		}),
		categoryService.getCategories().then((data) => {
			selectFilters.value = {
				...selectFilters.value,
				category: { options: data, placeholder: 'Filtrar por categoría...', filterKey: 'categoryId', numeric: true },
			}
		}),
		brandService.getBrands().then((data) => {
			selectFilters.value = {
				...selectFilters.value,
				brand: { options: data, placeholder: 'Filtrar por marca...', filterKey: 'brandId', numeric: true },
			}
		}),
		categoryService.getSubcategories().then((data) => {
			selectFilters.value = {
				...selectFilters.value,
				subcategory: {
					options: data,
					placeholder: 'Filtrar por subcategoría...',
					filterKey: 'subcategoryId',
					numeric: true,
				},
			}
		}),
		modelService.getModels().then((data) => {
			selectFilters.value = {
				...selectFilters.value,
				model: { options: data, placeholder: 'Filtrar por modelo...', filterKey: 'modelId', numeric: true },
			}
		}),
	])
})

function primaryImage(product: Product): string | undefined {
	const firstImage = (product.media ?? []).find((m) => m.mediaType === 'image')
	return firstImage?.url ?? product.imageUrl ?? undefined
}

function sectionLabel(product: Product): string {
	const s = product.section
	return typeof s === 'string' ? s : (s?.name ?? '')
}

function categoryLabel(product: Product): string {
	const c = product.category
	return typeof c === 'string' ? c : (c?.name ?? '')
}

function subcategoryLabel(product: Product): string {
	const s = product.subcategory
	return typeof s === 'string' ? s : (s?.name ?? '')
}

function brandLabel(product: Product): string {
	const b = product.brand
	return typeof b === 'string' ? b : (b?.name ?? '')
}

function modelLabel(product: Product): string {
	const m = product.model
	return typeof m === 'string' ? m : (m?.name ?? '')
}

function reload(): void {
	genericTable.value?.reload()
}

defineExpose({ reload })
</script>

<template>
	<GenericTable
		ref="genericTable"
		procedure="GET_PRODUCTS"
		title="Gestión de Productos"
		:columns="columns"
		:select-filters="selectFilters"
		@add-clicked="emit('onCreate')"
	>
		<!-- ACCIONES -->
		<template #cell-actions="{ row }">
			<div class="flex items-center space-x-2 whitespace-nowrap" @click.stop>
				<button
					@click="emit('onEdit', row)"
					class="p-1.5 text-slate-400 hover:text-blue-400 transition cursor-pointer"
					title="Editar"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</button>
				<button
					@click="emit('onDelete', row)"
					class="p-1.5 text-slate-400 hover:text-red-400 transition cursor-pointer"
					title="Eliminar"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>
		</template>

		<!-- PRODUCTO -->
		<template #cell-name="{ row }">
			<div class="flex items-center gap-3 min-w-[200px]">
				<div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
					<img v-if="primaryImage(row)" :src="primaryImage(row)" :alt="row.name" class="w-full h-full object-cover" />
				</div>
				<div>
					<span class="font-medium text-white block">{{ row.name }}</span>
					<span class="text-xs text-slate-500 line-clamp-1">{{ row.description || 'Sin descripción' }}</span>
				</div>
			</div>
		</template>

		<!-- CÓDIGO -->
		<template #cell-code="{ row }">
			<span class="text-slate-300">{{ row.code }}</span>
		</template>

		<!-- CÓDIGO DE BARRAS -->
		<template #cell-barcode="{ row }">
			<span class="text-slate-300 whitespace-nowrap">{{ row.barcode }}</span>
		</template>

		<!-- SECCIÓN -->
		<template #cell-section="{ row }">
			{{ sectionLabel(row) }}
		</template>

		<!-- CATEGORÍA -->
		<template #cell-category="{ row }">
			{{ categoryLabel(row) }}
		</template>

		<!-- SUBCATEGORÍA -->
		<template #cell-subcategory="{ row }">
			{{ subcategoryLabel(row) }}
		</template>

		<!-- MARCA -->
		<template #cell-brand="{ row }">
			{{ brandLabel(row) }}
		</template>

		<!-- MODELO -->
		<template #cell-model="{ row }">
			{{ modelLabel(row) }}
		</template>

		<!-- PRECIO -->
		<template #cell-price="{ row }">
			<span class="font-semibold text-white whitespace-nowrap">{{ formatGs(row.price) }}</span>
		</template>

		<!-- STOCK -->
		<template #cell-stock="{ row }">
			<span class="whitespace-nowrap font-medium" :class="!row.stock ? 'text-red-400' : 'text-slate-300'">
				{{ row.stock || 0 }}
			</span>
		</template>
	</GenericTable>
</template>