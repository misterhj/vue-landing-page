<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '@/core/services/product'
import type { Product, ProductQueryParams } from '@/core/models'
import { useCatalogFilterStore } from '@/stores/catalog-filter'
import { useCartStore } from '@/stores/cart'
import { primaryImage } from '@/shared/composables/useProductImage'
import { formatGs } from '@/core/utils/format'

const router = useRouter()
const catalogFilter = useCatalogFilterStore()
const cart = useCartStore()

const pageSize = 12
const allProducts = ref<Product[]>([])
const totalCount = ref(0)
const currentPage = ref(0)
const isLoading = ref(false)

let loading = false

const hasMore = () => allProducts.value.length < totalCount.value

function loadProducts(reset: boolean): void {
	if (loading) {
		return
	}
	loading = true
	isLoading.value = true

	const pageIndex = reset ? 1 : currentPage.value + 1

	const params: ProductQueryParams = {
		pageIndex,
		pageSize,
	}

	const sectionId = catalogFilter.selectedSectionId
	const categoryId = catalogFilter.selectedCategoryId
	const term = catalogFilter.searchTerm.trim()

	if (sectionId != null) {
		params.sectionId = sectionId
	}
	if (categoryId != null) {
		params.categoryId = categoryId
	}
	if (term) {
		params.search = term
	}

	const minPrice = catalogFilter.minPrice
	const maxPrice = catalogFilter.maxPrice
	const inStock = catalogFilter.inStock
	const sortBy = catalogFilter.sortBy

	if (minPrice != null) {
		params.minPrice = minPrice
	}
	if (maxPrice != null) {
		params.maxPrice = maxPrice
	}
	if (inStock) {
		params.inStock = true
	}
	if (sortBy && sortBy !== 'newest') {
		params.sortBy = sortBy
	}

	productService
		.getProducts(params)
		.then((res) => {
			if (res.pageIndex === 1) {
				allProducts.value = res.items
			} else {
				allProducts.value = [...allProducts.value, ...res.items]
			}
			totalCount.value = res.totalCount
			currentPage.value = res.pageIndex
		})
		.catch((err) => {
			console.error('Error al cargar productos:', err)
		})
		.finally(() => {
			isLoading.value = false
			loading = false
		})
}

function onScroll(): void {
	if (isLoading.value || !hasMore() || typeof document === 'undefined') {
		return
	}
	const nearBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200
	if (nearBottom) {
		loadProducts(false)
	}
}

function onImageError(event: Event): void {
	;(event.target as HTMLElement).style.display = 'none'
}

function goToProduct(product: Product): void {
	const slug = product.slug ?? product.id
	if (slug != null) {
		router.push(`/producto/${slug}`)
	}
}

function addToCart(product: Product): void {
	cart.add(product, 1)
}

watch(
	() => [
		catalogFilter.searchTerm,
		catalogFilter.selectedSectionId,
		catalogFilter.selectedCategoryId,
		catalogFilter.minPrice,
		catalogFilter.maxPrice,
		catalogFilter.inStock,
		catalogFilter.sortBy,
	],
	() => {
		loadProducts(true)
	},
	{ immediate: true },
)

onMounted(() => {
	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', onScroll, { passive: true })
	}
})

onBeforeUnmount(() => {
	if (typeof window !== 'undefined') {
		window.removeEventListener('scroll', onScroll)
	}
})
</script>

<template>
	<!-- CATÁLOGO -->
	<section id="catalog" class="py-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Spinner / Loader -->
			<div v-if="isLoading && allProducts.length === 0" class="py-12 flex justify-center items-center gap-3 text-slate-500">
				<div class="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
				<span>Cargando catálogo...</span>
			</div>

			<!-- Sin Productos -->
			<div v-if="!isLoading && allProducts.length === 0" class="py-12 text-center text-slate-400">
				No se encontraron productos que coincidan con tu búsqueda.
			</div>

			<!-- Grid de Productos -->
			<div v-if="allProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div
					v-for="product in allProducts"
					:key="product.id"
					@click="goToProduct(product)"
					class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 transition group cursor-pointer"
				>
					<!-- Imagen del Producto -->
					<div class="w-full h-56 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative mb-4">
						<img
							v-if="primaryImage(product)"
							:src="primaryImage(product)!"
							:alt="product.name"
							@error="onImageError"
							class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
						/>
						<svg v-else class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>

					<!-- Información -->
					<div class="flex-1 flex flex-col justify-between">
						<div>
							<h3 class="font-bold text-slate-900 text-base mt-2 group-hover:text-slate-600 transition line-clamp-1">
								{{ product.name }}
							</h3>
							<p class="text-xs text-slate-500 mt-1 line-clamp-2">
								{{ product.description }}
							</p>
						</div>

						<!-- Precio y Acción -->
						<div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
							<div>
								<span class="text-xs text-slate-400 block">Precio</span>
								<span class="text-lg font-extrabold text-slate-900">
									{{ formatGs(product.price) }}
								</span>
							</div>
							<button
								@click.stop="addToCart(product)"
								class="p-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl transition shadow-sm"
								title="Agregar y consultar"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Cargando más (scroll infinito) -->
			<div v-if="isLoading && allProducts.length > 0" class="py-8 flex justify-center items-center gap-3 text-slate-500">
				<div class="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
				<span>Cargando más productos...</span>
			</div>
		</div>
	</section>
</template>