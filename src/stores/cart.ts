import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/core/models'
import { CART_STORAGE_KEY } from '@/environments/environment'
import { formatGs } from '@/core/utils/format'

export interface CartItem {
	product: Product
	quantity: number
}

function hasWindow(): boolean {
	return typeof window !== 'undefined'
}

function loadFromStorage(): CartItem[] {
	if (!hasWindow()) {
		return []
	}
	try {
		const raw = window.localStorage.getItem(CART_STORAGE_KEY)
		if (!raw) {
			return []
		}
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) {
			return []
		}
		return parsed.filter((item: CartItem) => item && item.product && item.quantity > 0)
	} catch {
		return []
	}
}

export const useCartStore = defineStore('cart', () => {
	const items = ref<CartItem[]>(loadFromStorage())
	const isOpen = ref(false)

	const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
	const total = computed(() =>
		items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
	)

	function persist(): void {
		if (!hasWindow()) {
			return
		}
		try {
			window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
		} catch {
			/* ignore */
		}
	}

	function open(): void {
		isOpen.value = true
	}
	function close(): void {
		isOpen.value = false
	}
	function add(product: Product, quantity = 1): void {
		const existing = items.value.find((item) => item.product.id === product.id)
		if (existing) {
			existing.quantity += quantity
		} else {
			items.value.push({ product, quantity })
		}
		persist()
		isOpen.value = true
	}
	function remove(productId?: number): void {
		items.value = items.value.filter((item) => item.product.id !== productId)
		persist()
	}
	function setQuantity(productId: number | undefined, qty: number): void {
		if (qty <= 0) {
			remove(productId)
			return
		}
		const item = items.value.find((i) => i.product.id === productId)
		if (item) {
			item.quantity = qty
			persist()
		}
	}
	function increment(productId: number | undefined): void {
		const item = items.value.find((i) => i.product.id === productId)
		if (item) {
			item.quantity += 1
			persist()
		}
	}
	function decrement(productId: number | undefined): void {
		const item = items.value.find((i) => i.product.id === productId)
		if (item) {
			item.quantity -= 1
			persist()
		}
	}
	function quantityOf(productId?: number): number {
		return items.value.find((item) => item.product.id === productId)?.quantity ?? 0
	}
	function clear(): void {
		items.value = []
		persist()
	}
	function buildMessage(): string {
		const lines = items.value.map(
			(item) => `• ${item.product.name} x${item.quantity} — ${formatGs(item.product.price * item.quantity)}`,
		)
		return `Hola! Quiero consultar por estos productos:\n\n${lines.join('\n')}\n\nTOTAL: ${formatGs(total.value)}`
	}

	return {
		items,
		isOpen,
		count,
		total,
		open,
		close,
		add,
		remove,
		setQuantity,
		increment,
		decrement,
		quantityOf,
		clear,
		buildMessage,
	}
})