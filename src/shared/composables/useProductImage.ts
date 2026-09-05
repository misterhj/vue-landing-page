import type { Product } from '@/core/models'

export function primaryImage(product: Product): string | null {
	const firstImage = (product.media ?? []).find((m) => m.mediaType === 'image')
	return firstImage?.url ?? product.imageUrl ?? null
}