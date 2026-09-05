<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Category, Section } from '@/core/models'
import { categoryService, sectionService } from '@/core/services/domain'
import { useCatalogFilterStore } from '@/stores/catalog-filter'

const catalogFilter = useCatalogFilterStore()
const sections = ref<Section[]>([])
const categories = ref<Category[]>([])

onMounted(async () => {
	try {
		sections.value = await sectionService.getSections()
	} catch (err) {
		console.error('Error al cargar secciones:', err)
	}
	try {
		categories.value = await categoryService.getCategories()
	} catch (err) {
		console.error('Error al cargar categorías:', err)
	}
})

function setMinPrice(value: string): void {
	catalogFilter.setMinPrice(value === '' ? null : Number(value))
}

function setMaxPrice(value: string): void {
	catalogFilter.setMaxPrice(value === '' ? null : Number(value))
}
</script>

<template>
	<header class="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800">
		<div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
			<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
				<!-- Fila 1: Brand Logo + Buscador -->
				<div class="flex items-center gap-3 flex-1">
					<RouterLink to="/" class="flex items-center gap-2.5 shrink-0">
						<div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white shadow-sm text-sm sm:text-base">
							CS
						</div>
						<span class="font-bold text-base sm:text-lg text-white tracking-wide whitespace-nowrap">Cute Store</span>
					</RouterLink>

					<!-- Buscador -->
					<div class="relative flex-1">
						<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							type="text"
							:value="catalogFilter.searchTerm"
							@input="catalogFilter.setSearchTerm(($event.target as HTMLInputElement).value)"
							placeholder="Buscar productos..."
							class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
						/>
						<button
							v-if="catalogFilter.searchTerm"
							@click="catalogFilter.setSearchTerm('')"
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
							title="Limpiar búsqueda"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Filtros por Sección y Categoría -->
				<div class="flex gap-2 w-full sm:w-auto">
					<div class="relative flex-1 sm:w-48">
						<select
							:value="catalogFilter.selectedSectionId ?? ''"
							@change="catalogFilter.setSelectedSectionId(($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
							class="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
						>
							<option value="">Todas las secciones</option>
							<option v-for="section in sections" :key="section.id" :value="section.id">
								{{ section.name }}
							</option>
						</select>
						<svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>

					<div class="relative flex-1 sm:w-56">
						<select
							:value="catalogFilter.selectedCategoryId ?? ''"
							@change="catalogFilter.setSelectedCategoryId(($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
							class="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
						>
							<option value="">Todas las categorías</option>
							<option v-for="category in categories" :key="category.id" :value="category.id">
								{{ category.name }}
							</option>
						</select>
						<svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</div>

					<!-- Botón Filtros avanzados -->
					<button
						@click="catalogFilter.toggleFilters()"
						class="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm font-medium transition shrink-0"
						:class="catalogFilter.filtersOpen
							? 'bg-blue-600 border-blue-600 text-white'
							: 'bg-slate-800 border-slate-700 text-slate-200'"
						title="Filtros avanzados"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
						</svg>
						<span class="hidden sm:inline">Filtros</span>
						<span v-if="catalogFilter.hasActiveFilters" class="w-2 h-2 rounded-full bg-amber-400"></span>
					</button>
				</div>
			</div>
		</div>

		<!-- Panel de filtros avanzados -->
		<div v-if="catalogFilter.filtersOpen" class="border-t border-slate-800 bg-slate-900/95 backdrop-blur">
			<div class="max-w-7xl mx-auto px-3 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
				<!-- Precio mínimo -->
				<div>
					<label class="block text-[11px] font-medium text-slate-400 mb-1">Precio mín.</label>
					<input
						type="number"
						min="0"
						step="1"
						:value="catalogFilter.minPrice ?? ''"
						@input="setMinPrice(($event.target as HTMLInputElement).value)"
						placeholder="Ej: 100000"
						class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
					/>
				</div>

				<!-- Precio máximo -->
				<div>
					<label class="block text-[11px] font-medium text-slate-400 mb-1">Precio máx.</label>
					<input
						type="number"
						min="0"
						step="1"
						:value="catalogFilter.maxPrice ?? ''"
						@input="setMaxPrice(($event.target as HTMLInputElement).value)"
						placeholder="Ej: 500000"
						class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
					/>
				</div>

				<!-- Solo en stock -->
				<div class="flex items-center">
					<label class="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							:checked="catalogFilter.inStock"
							@change="catalogFilter.setInStock(($event.target as HTMLInputElement).checked)"
							class="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
						/>
						<span class="text-xs sm:text-sm text-slate-200">Solo en stock</span>
					</label>
				</div>

				<!-- Ordenar -->
				<div>
					<label class="block text-[11px] font-medium text-slate-400 mb-1">Ordenar por</label>
					<select
						:value="catalogFilter.sortBy"
						@change="catalogFilter.setSortBy(($event.target as HTMLSelectElement).value)"
						class="w-full appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
					>
						<option value="newest">Más recientes</option>
						<option value="price_asc">Precio: menor a mayor</option>
						<option value="price_desc">Precio: mayor a menor</option>
						<option value="name_asc">Nombre: A-Z</option>
						<option value="name_desc">Nombre: Z-A</option>
					</select>
				</div>
			</div>
		</div>
	</header>
</template>