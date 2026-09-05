import type { PagedResultDto, Product, ProductQueryParams } from '@/core/models'
import { api } from '@/core/services/http'

const sortByOptions = [
	{ value: 'newest', label: 'Más recientes' },
	{ value: 'price_asc', label: 'Precio: menor a mayor' },
	{ value: 'price_desc', label: 'Precio: mayor a menor' },
	{ value: 'name_asc', label: 'Nombre: A-Z' },
	{ value: 'name_desc', label: 'Nombre: Z-A' },
]

export function getProductSortOptions(): { value: string; label: string }[] {
	return sortByOptions
}

export interface ProductService {
	getProducts(params: ProductQueryParams): Promise<PagedResultDto<Product>>
	getProduct(id: number): Promise<Product>
	getProductBySlug(slug: string): Promise<Product>
	createProduct(product: Partial<Product>): Promise<Product>
	updateProduct(id: number, product: Partial<Product>): Promise<Product>
	deleteProduct(id: number): Promise<void>
}

export const productService: ProductService = {
	getProducts: (params) =>
		api.get<PagedResultDto<Product>>('/products', {
			params: {
				pageIndex: params.pageIndex,
				pageSize: params.pageSize,
				sectionId: params.sectionId,
				categoryId: params.categoryId,
				search: params.search,
				minPrice: params.minPrice,
				maxPrice: params.maxPrice,
				inStock: params.inStock ?? undefined,
				sortBy: params.sortBy && params.sortBy !== 'newest' ? params.sortBy : undefined,
			},
		}),
	getProduct: (id) => api.get<Product>(`/products/${id}`),
	getProductBySlug: (slug) => api.get<Product>(`/products/product/${slug}`),
	createProduct: (product) => api.post<Product>('/products', product),
	updateProduct: (id, product) => api.put<Product>(`/products/${id}`, product),
	deleteProduct: (id) => api.delete<void>(`/products/${id}`),
}