import type { Brand, Category, Model, Section, Settings, User, ProductRequestDto } from '@/core/models'
import { api } from '@/core/services/http'
import { CATEGORIES_CACHE_KEY, CACHE_TTL_MS, SECTIONS_CACHE_KEY } from '@/environments/environment'
import { readCache, removeCache, writeCache } from '@/core/utils/storage-cache'

let categoriesMemoryCache: Category[] | null = null
let sectionsMemoryCache: Section[] | null = null
let brandsMemoryCache: Brand[] | null = null
let modelsMemoryCache: Model[] | null = null
let settingsMemoryCache: Settings[] | null = null

async function getCategories(search?: string): Promise<Category[]> {
	if (search) {
		return api.get<Category[]>('/categories', { params: { q: search } })
	}
	if (categoriesMemoryCache) {
		return categoriesMemoryCache
	}
	const cached = readCache<Category[]>(CATEGORIES_CACHE_KEY, CACHE_TTL_MS)
	if (cached) {
		categoriesMemoryCache = cached
		return cached
	}
	const data = await api.get<Category[]>('/categories')
	categoriesMemoryCache = data
	writeCache(CATEGORIES_CACHE_KEY, data)
	return data
}

function clearCategoriesCache(): void {
	categoriesMemoryCache = null
	removeCache(CATEGORIES_CACHE_KEY)
}

export const categoryService = {
	getCategories,
	getSubcategories: (parentId?: number, search?: string) =>
		api.get<Category[]>('/categories/subcategories', {
			params: { parentId, q: search },
		}),
	createCategory: async (category: { name: string; slug: string; parentCategoryId?: number }) => {
		const data = await api.post<Category>('/categories', category)
		clearCategoriesCache()
		return data
	},
	updateCategory: async (id: number, category: { name: string; slug: string }) => {
		const data = await api.put<Category>(`/categories/${id}`, category)
		clearCategoriesCache()
		return data
	},
	deleteCategory: async (id: number) => {
		await api.delete<void>(`/categories/${id}`)
		clearCategoriesCache()
	},
}

async function getSections(search?: string): Promise<Section[]> {
	if (search) {
		return api.get<Section[]>('/sections', { params: { q: search } })
	}
	if (sectionsMemoryCache) {
		return sectionsMemoryCache
	}
	const cached = readCache<Section[]>(SECTIONS_CACHE_KEY, CACHE_TTL_MS)
	if (cached) {
		sectionsMemoryCache = cached
		return cached
	}
	const data = await api.get<Section[]>('/sections')
	sectionsMemoryCache = data
	writeCache(SECTIONS_CACHE_KEY, data)
	return data
}

function clearSectionsCache(): void {
	sectionsMemoryCache = null
	removeCache(SECTIONS_CACHE_KEY)
}

export const sectionService = {
	getSections,
	createSection: async (section: { name: string }) => {
		const data = await api.post<Section>('/sections', section)
		clearSectionsCache()
		return data
	},
	updateSection: async (id: number, section: { name: string }) => {
		const data = await api.put<Section>(`/sections/${id}`, section)
		clearSectionsCache()
		return data
	},
	deleteSection: async (id: number) => {
		await api.delete<void>(`/sections/${id}`)
		clearSectionsCache()
	},
}

export const brandService = {
	getBrands: async (search?: string): Promise<Brand[]> => {
		if (search) {
			return api.get<Brand[]>('/brands', { params: { q: search } })
		}
		if (brandsMemoryCache) {
			return brandsMemoryCache
		}
		const data = await api.get<Brand[]>('/brands')
		brandsMemoryCache = data
		return data
	},
	createBrand: async (brand: { name: string }) => {
		const data = await api.post<Brand>('/brands', brand)
		brandsMemoryCache = null
		return data
	},
	updateBrand: async (id: number, brand: { name: string }) => {
		const data = await api.put<Brand>(`/brands/${id}`, brand)
		brandsMemoryCache = null
		return data
	},
	deleteBrand: async (id: number) => {
		await api.delete<void>(`/brands/${id}`)
		brandsMemoryCache = null
	},
}

export const modelService = {
	getModels: async (brandId?: number, search?: string): Promise<Model[]> => {
		if (brandId !== undefined || search) {
			return api.get<Model[]>('/models', { params: { brandId, q: search } })
		}
		if (modelsMemoryCache) {
			return modelsMemoryCache
		}
		const data = await api.get<Model[]>('/models')
		modelsMemoryCache = data
		return data
	},
	createModel: async (model: { name: string; brandId: number }) => {
		const data = await api.post<Model>('/models', model)
		modelsMemoryCache = null
		return data
	},
	updateModel: async (id: number, model: { name: string }) => {
		const data = await api.put<Model>(`/models/${id}`, model)
		modelsMemoryCache = null
		return data
	},
	deleteModel: async (id: number) => {
		await api.delete<void>(`/models/${id}`)
		modelsMemoryCache = null
	},
}

export const settingsService = {
	getSettings: async (): Promise<Settings[]> => {
		if (settingsMemoryCache) {
			return settingsMemoryCache
		}
		const data = await api.get<Settings[]>('/settings')
		settingsMemoryCache = data
		return data
	},
	getPublicSettings: async (): Promise<Settings[]> => {
		if (settingsMemoryCache) {
			return settingsMemoryCache
		}
		const data = await api.get<Settings[]>('/settings/public')
		settingsMemoryCache = data
		return data
	},
	getSettingsByKey: (key: string) => api.get<Settings>(`/settings/key/${key}`),
	createSettings: async (settings: { key: string; value: string; description?: string }) => {
		const data = await api.post<Settings>('/settings', settings)
		settingsMemoryCache = null
		return data
	},
	updateSettings: async (id: number, settings: { value: string; description?: string }) => {
		const data = await api.put<Settings>(`/settings/${id}`, settings)
		settingsMemoryCache = null
		return data
	},
	deleteSettings: async (id: number) => {
		await api.delete<void>(`/settings/${id}`)
		settingsMemoryCache = null
	},
}

export const userService = {
	getUsers: () => api.get<User[]>('/users'),
	updateUser: (id: number, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
	deleteUser: (id: number) => api.delete<void>(`/users/${id}`),
}

export const productRequestService = {
	getAll: () => api.get<ProductRequestDto[]>('/product-requests'),
}

export const tableDataService = {
	fetchData: <T>(query: {
		procedure: string
		pageIndex: number
		pageSize: number
		sortColumn?: string
		sortDirection?: 'asc' | 'desc'
		columnFilters?: Record<string, string | number>
	}) => api.post<{ items: T[]; totalCount: number; pageIndex: number; pageSize: number }>('/data/query', query),
}