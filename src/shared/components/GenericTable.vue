<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'
import type { Slot } from 'vue'
import {
	useTable,
	FlexRender,
	tableFeatures,
	rowPaginationFeature,
	rowSortingFeature,
	columnFilteringFeature,
	columnSizingFeature,
	columnResizingFeature,
	type ColumnDef,
	type ColumnFiltersState,
} from '@tanstack/vue-table'
import { tableDataService } from '@/core/services/domain'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'
import type { SelectOption } from '@/shared/components/SearchableSelect.vue'

export interface SelectFilterConfig {
	options: SelectOption[]
	placeholder?: string
	filterKey?: string
	numeric?: boolean
}

const features = tableFeatures({
	rowPaginationFeature,
	rowSortingFeature,
	columnFilteringFeature,
	columnSizingFeature,
	columnResizingFeature,
})

const props = withDefaults(
	defineProps<{
		procedure: string
		columns: ColumnDef<any, any>[]
		title?: string
		showAddButton?: boolean
		defaultFilters?: Record<string, string | undefined>
		selectFilters?: Record<string, SelectFilterConfig>
	}>(),
	{
		title: '',
		showAddButton: true,
		defaultFilters: () => ({}),
		selectFilters: () => ({}),
	},
)

const emit = defineEmits<{
	addClicked: []
	rowClick: [row: any]
}>()

const slots = useSlots() as Record<string, Slot | undefined>

const data = ref<any[]>([])
const totalCount = ref(0)
const isLoading = ref(false)

const showFilters = ref(false)
const pendingTextFilters = ref<Record<string, string>>({})

const hasActiveFilters = computed(() => table.atoms.columnFilters.get().length > 0)

function selectConfigFor(columnId: string): SelectFilterConfig | undefined {
	return props.selectFilters[columnId]
}

function filterValueFor(column: { getFilterValue(): unknown }): number | string | null {
	const v = column.getFilterValue()
	return typeof v === 'number' || typeof v === 'string' ? v : null
}

const table = useTable<any, any>({
	features,
	columns: props.columns,
	data,
	initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
	manualPagination: true,
	manualSorting: true,
	manualFiltering: true,
	rowCount: totalCount,
	columnResizeMode: 'onChange',
})

const pagination = computed(() => table.atoms.pagination.get())
const sorting = computed(() => table.atoms.sorting.get())
const columnFilters = computed(() => table.atoms.columnFilters.get())

async function fetchServerData(): Promise<void> {
	if (!props.procedure) return
	isLoading.value = true

	const filterMap: Record<string, string | number> = {}
	const currentFilters = columnFilters.value

	for (const [key, val] of Object.entries(props.defaultFilters)) {
		if (val !== undefined && val !== null && val !== '') {
			filterMap[key] = val
		}
	}

	for (const f of currentFilters) {
		if (f.value !== undefined && f.value !== null && f.value !== '') {
			const config = props.selectFilters[f.id]
			const key = config?.filterKey ?? f.id
			filterMap[key] = config?.numeric ? Number(f.value) : String(f.value)
		}
	}

	const activeSort = sorting.value[0]

	try {
		const res = await tableDataService.fetchData<any>({
			procedure: props.procedure,
			pageIndex: pagination.value.pageIndex,
			pageSize: pagination.value.pageSize,
			sortColumn: activeSort?.id,
			sortDirection: activeSort ? (activeSort.desc ? 'desc' : 'asc') : undefined,
			columnFilters: filterMap,
		})
		data.value = res.items
		totalCount.value = res.totalCount
	} catch (err) {
		console.error('Error al cargar datos de la tabla:', err)
	} finally {
		isLoading.value = false
	}
}

watch(
	[() => props.procedure, () => props.defaultFilters, () => props.selectFilters, pagination, sorting, columnFilters],
	() => {
		void fetchServerData()
	},
	{ immediate: true },
)

function onTextFilterInput(columnId: string, event: Event): void {
	const value = (event.target as HTMLInputElement).value
	pendingTextFilters.value = { ...pendingTextFilters.value, [columnId]: value }
}

function applyTextFilter(columnId: string): void {
	const value = pendingTextFilters.value[columnId] ?? ''
	if (pagination.value.pageIndex !== 0) {
		table.setPageIndex(0)
	}
	table.getColumn(columnId)?.setFilterValue(value === '' ? null : value)
}

function applyPendingTextFilters(): void {
	if (pagination.value.pageIndex !== 0) {
		table.setPageIndex(0)
	}
	table.setColumnFilters((prev) => {
		const nonText = prev.filter((f) => !props.selectFilters[f.id])
		const pending: ColumnFiltersState = []
		for (const [id, value] of Object.entries(pendingTextFilters.value)) {
			pending.push({ id, value: value === '' ? null : value })
		}
		return [...nonText, ...pending]
	})
}

function updateSelectFilter(columnId: string, value: number | string | null): void {
	if (pagination.value.pageIndex !== 0) {
		table.setPageIndex(0)
	}
	table.getColumn(columnId)?.setFilterValue(value)
}

function clearFilters(): void {
	pendingTextFilters.value = {}
	table.resetColumnFilters()
}

function reload(): void {
	void fetchServerData()
}

function hasCellSlot(columnId: string): boolean {
	return !!slots[`cell-${columnId}`]
}

defineExpose({ reload })
</script>

<template>
	<!-- CONTENEDOR PRINCIPAL -->
	<div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[600px] md:h-[calc(100vh-4.5rem)]">
		<!-- BARRA SUPERIOR -->
		<div v-if="title" class="flex-none px-4 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
			<h2 class="text-sm font-semibold text-white tracking-wide uppercase">{{ title }}</h2>
		</div>

		<!-- ÁREA SCROLLABLE -->
		<div class="flex-1 overflow-auto relative">
			<table
				:style="{ width: table.getTotalSize() + 'px' }"
				class="min-w-full text-left text-xs text-slate-300 border-collapse table-fixed"
			>
				<!-- CABECERA -->
				<thead class="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm text-[11px] uppercase text-slate-400 border-b border-slate-800 font-semibold shadow-sm">
					<tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
						<th
							v-for="header in headerGroup.headers"
							:key="header.id"
							:style="{ width: header.getSize() + 'px' }"
							:class="
								showFilters && selectFilters[header.column.id]
									? 'overflow-visible'
									: 'overflow-hidden'
							"
							class="px-3 py-2.5 relative group select-none"
						>
							<!-- COLUMNA DE ACCIONES -->
							<div v-if="header.column.id === 'actions'" class="flex items-center gap-2">
								<button
									v-if="showAddButton"
									@click="emit('addClicked')"
									type="button"
									title="Agregar nuevo registro"
									class="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow flex items-center justify-center cursor-pointer active:scale-95"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
									</svg>
								</button>
								<button
									v-if="hasActiveFilters"
									@click="clearFilters"
									type="button"
									title="Limpiar todos los filtros"
									class="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition flex items-center justify-center cursor-pointer active:scale-95"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 16l4 4m0-4l-4 4"
										/>
									</svg>
								</button>
								<button
									v-if="showFilters"
									@click="applyPendingTextFilters"
									type="button"
									title="Buscar"
									class="p-1 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition flex items-center justify-center cursor-pointer active:scale-95"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</button>
							</div>

							<!-- OTRAS COLUMNAS -->
							<template v-else>
								<div
									@click="header.column.getToggleSortingHandler()?.($event)"
									:class="header.column.getCanSort() ? 'cursor-pointer' : ''"
									class="flex items-center justify-between gap-1.5 select-none hover:text-white transition overflow-hidden"
								>
									<FlexRender :header="header" class="truncate" />
									<span v-if="header.column.getCanSort()" class="text-[9px] text-slate-500 flex-shrink-0">
										{{ header.column.getIsSorted() === 'asc' ? '▲' : header.column.getIsSorted() === 'desc' ? '▼' : '⇅' }}
									</span>
								</div>

								<!-- Filtro por Columna -->
								<div v-if="showFilters && header.column.getCanFilter()" class="mt-1.5">
									<SearchableSelect
										v-if="selectConfigFor(header.column.id)"
										:model-value="filterValueFor(header.column)"
										:options="selectFilters[header.column.id]!.options"
										:placeholder="selectFilters[header.column.id]!.placeholder || 'Filtrar...'"
										@update:model-value="updateSelectFilter(header.column.id, $event)"
									/>
									<input
										v-else
										type="text"
										:value="pendingTextFilters[header.column.id] ?? ''"
										@input="onTextFilterInput(header.column.id, $event)"
										@keydown.enter="applyTextFilter(header.column.id)"
										placeholder="Filtrar..."
										class="w-full px-2 py-0.5 text-[11px] bg-slate-800/80 border border-slate-700/80 rounded text-slate-200 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-600 font-normal"
									/>
								</div>
							</template>

							<!-- TIRADOR DE REDIMENSIONAMIENTO -->
							<div
								v-if="header.column.getCanResize()"
								@mousedown="header.getResizeHandler()"
								@touchstart="header.getResizeHandler()"
								:class="
									header.column.getIsResizing()
										? 'bg-blue-500 opacity-100'
										: 'opacity-0 hover:bg-blue-500/80'
								"
								class="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none touch-none group-hover:opacity-100 transition-opacity"
							></div>
						</th>
					</tr>
				</thead>

				<!-- CUERPO DE LA TABLA -->
				<tbody class="divide-y divide-slate-800/50">
					<!-- Estado de Carga -->
					<tr v-if="isLoading">
						<td :colspan="columns.length" class="p-8 text-center text-slate-500">
							Cargando registros...
						</td>
					</tr>

					<!-- Sin Resultados -->
					<tr v-else-if="data.length === 0">
						<td :colspan="columns.length" class="p-8 text-center text-slate-500">
							No se encontraron registros con los criterios de búsqueda.
						</td>
					</tr>

					<!-- Filas de Datos -->
					<tr
						v-for="row in table.getRowModel().rows"
						:key="row.id"
						@click="emit('rowClick', row.original)"
						class="hover:bg-slate-800/60 transition cursor-pointer select-none"
					>
						<td
							v-for="cell in row.getVisibleCells()"
							:key="cell.id"
							:style="{ width: cell.column.getSize() + 'px' }"
							class="px-3 py-2.5 overflow-hidden text-ellipsis whitespace-nowrap"
						>
							<slot v-if="hasCellSlot(cell.column.id)" :name="`cell-${cell.column.id}`" :row="row.original as any">
								<FlexRender :cell="cell" />
							</slot>
							<FlexRender v-else :cell="cell" />
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- CONTROLES DE PAGINACIÓN -->
		<div class="flex-none p-3 bg-slate-950/40 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
			<div class="flex items-center gap-2">
				<span>Mostrar</span>
				<select
					:value="pagination.pageSize"
					@change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
					class="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white focus:outline-none text-xs"
				>
					<option :value="5">5</option>
					<option :value="10">10</option>
					<option :value="25">25</option>
					<option :value="50">50</option>
				</select>
				<span>de <strong>{{ totalCount }}</strong> coincidencias</span>
				<button
					@click="showFilters = !showFilters"
					type="button"
					:class="
						showFilters
							? 'bg-blue-600 hover:bg-blue-500 text-white'
							: 'bg-slate-800 hover:bg-slate-700 text-slate-300'
					"
					class="p-2 border border-slate-700 rounded-lg shadow transition flex items-center justify-center cursor-pointer active:scale-95"
					:title="showFilters ? 'Ocultar filtros' : 'Mostrar filtros'"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</button>
			</div>

			<div class="flex items-center gap-1.5">
				<button
					@click="table.setPageIndex(0)"
					:disabled="!table.getCanPreviousPage()"
					class="px-2 py-1 bg-slate-800 border border-slate-700 rounded disabled:opacity-30 hover:bg-slate-700 transition cursor-pointer"
				>
					«
				</button>
				<button
					@click="table.previousPage()"
					:disabled="!table.getCanPreviousPage()"
					class="px-2 py-1 bg-slate-800 border border-slate-700 rounded disabled:opacity-30 hover:bg-slate-700 transition cursor-pointer"
				>
					Anterior
				</button>

				<span class="px-2">
					Página <strong>{{ pagination.pageIndex + 1 }}</strong> de <strong>{{ table.getPageCount() }}</strong>
				</span>

				<button
					@click="table.nextPage()"
					:disabled="!table.getCanNextPage()"
					class="px-2 py-1 bg-slate-800 border border-slate-700 rounded disabled:opacity-30 hover:bg-slate-700 transition cursor-pointer"
				>
					Siguiente
				</button>
				<button
					@click="table.setPageIndex(table.getPageCount() - 1)"
					:disabled="!table.getCanNextPage()"
					class="px-2 py-1 bg-slate-800 border border-slate-700 rounded disabled:opacity-30 hover:bg-slate-700 transition cursor-pointer"
				>
					»
				</button>
			</div>
		</div>
	</div>
</template>