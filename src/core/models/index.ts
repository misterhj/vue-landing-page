export interface ProductMedia {
	id?: number
	productId?: number
	url: string
	mediaType: 'image' | 'video'
	isPrimary?: boolean
	isDeleted?: boolean
	createdBy?: number | null
	createdAt?: string
	modifiedBy?: number | null
	modifiedAt?: string | null
	deletedBy?: number | null
	deletedAt?: string | null
}

export interface Section {
	id?: number
	name: string
}

export interface Category {
	id: number
	name: string
	slug: string
	subcategories?: Category[]
}

export interface Brand {
	id?: number
	name: string
	models?: Model[]
}

export interface Model {
	id?: number
	name: string
	brandId: number
	brand?: Brand
}

export interface Product {
	id?: number
	slug?: string
	code?: string
	barcode?: string
	name: string
	description?: string
	price: number
	stock?: number
	imageUrl?: string
	media?: ProductMedia[]
	specifications?: Record<string, string> | null
	categoryId?: number | null
	category?: Category
	subcategoryId?: number | null
	subcategory?: Category
	brandId?: number | null
	brand?: Brand
	modelId?: number | null
	model?: Model
	sectionId?: number | null
	section?: Section
	sectionName?: string
	categoryName?: string
	subcategoryName?: string
	brandName?: string
	modelName?: string
}

export interface ProductQueryParams {
	pageIndex?: number
	pageSize?: number
	sectionId?: number | null
	categoryId?: number | null
	search?: string
	minPrice?: number | null
	maxPrice?: number | null
	inStock?: boolean
	sortBy?: string
}

export interface ProductRequestDto {
	id: number
	term: string
	userId: number
	userName: string
	status: string
	createdAt: string
}

export interface Settings {
	id?: number
	key: string
	value: string
	description?: string
	isActive?: boolean
}

export interface User {
	id: number
	email: string
	firstName: string
	lastName: string
	identityDocument?: string
	phoneNumber?: string
	username: string
	isActive?: boolean
}

export interface TableQueryDto {
	procedure: string
	pageIndex: number
	pageSize: number
	sortColumn?: string
	sortDirection?: 'asc' | 'desc'
	columnFilters?: Record<string, string | number>
}

export interface PagedResultDto<T> {
	items: T[]
	totalCount: number
	pageIndex: number
	pageSize: number
}