import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCatalogFilterStore = defineStore('catalog-filter', () => {
	const searchTerm = ref('')
	const selectedSectionId = ref<number | null>(null)
	const selectedCategoryId = ref<number | null>(null)
	const minPrice = ref<number | null>(null)
	const maxPrice = ref<number | null>(null)
	const inStock = ref(false)
	const sortBy = ref('newest')
	const filtersOpen = ref(false)

	const hasActiveFilters = computed(
		() => minPrice.value !== null || maxPrice.value !== null || inStock.value === true,
	)

	function setSearchTerm(term: string): void {
		searchTerm.value = term
	}
	function setSelectedSectionId(id: number | null): void {
		selectedSectionId.value = id
	}
	function setSelectedCategoryId(id: number | null): void {
		selectedCategoryId.value = id
	}
	function setMinPrice(price: number | null): void {
		minPrice.value = price
	}
	function setMaxPrice(price: number | null): void {
		maxPrice.value = price
	}
	function setInStock(value: boolean): void {
		inStock.value = value
	}
	function setSortBy(value: string): void {
		sortBy.value = value
	}
	function toggleFilters(): void {
		filtersOpen.value = !filtersOpen.value
	}
	function clear(): void {
		searchTerm.value = ''
		selectedSectionId.value = null
		selectedCategoryId.value = null
		minPrice.value = null
		maxPrice.value = null
		inStock.value = false
		sortBy.value = 'newest'
	}

	return {
		searchTerm,
		selectedSectionId,
		selectedCategoryId,
		minPrice,
		maxPrice,
		inStock,
		sortBy,
		filtersOpen,
		hasActiveFilters,
		setSearchTerm,
		setSelectedSectionId,
		setSelectedCategoryId,
		setMinPrice,
		setMaxPrice,
		setInStock,
		setSortBy,
		toggleFilters,
		clear,
	}
})