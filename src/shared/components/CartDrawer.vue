<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWhatsAppNumber } from '@/shared/composables/useWhatsapp'
import { primaryImage } from '@/shared/composables/useProductImage'
import { formatGs } from '@/core/utils/format'
import type { Product } from '@/core/models'

const cart = useCartStore()
const router = useRouter()
const { waNumber, load, waLink } = useWhatsAppNumber()

onMounted(load)

function sendByWhatsApp(): void {
	const link = waLink(cart.buildMessage())
	if (link) {
		window.open(link, '_blank')
	}
}

function goToCatalog(): void {
	cart.close()
	router.push('/')
}

function imageUrl(product: Product): string | null {
	return primaryImage(product)
}
</script>

<template>
	<!-- Botón flotante del carrito -->
	<button
		@click="cart.open()"
		class="fixed bottom-40 sm:bottom-48 right-6 z-40 flex items-center w-14 h-14 bg-slate-900 hover:bg-slate-700 text-white rounded-full shadow-lg shadow-slate-900/30 transition"
		aria-label="Abrir carrito"
		title="Carrito de consultas"
	>
		<svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
		<span
			v-if="cart.count > 0"
			class="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow"
		>
			{{ cart.count }}
		</span>
	</button>

	<!-- Overlay -->
	<div
		v-if="cart.isOpen"
		@click="cart.close()"
		class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
	></div>

	<!-- Drawer -->
	<aside
		v-if="cart.isOpen"
		class="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-4 border-b border-slate-200">
			<h2 class="font-bold text-slate-900 text-lg">Tu consulta</h2>
			<button
				@click="cart.close()"
				class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
				aria-label="Cerrar carrito"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto px-4 py-4">
			<!-- Vacío -->
			<div v-if="cart.items.length === 0" class="h-full flex flex-col items-center justify-center text-center text-slate-400">
				<svg class="w-16 h-16 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
				</svg>
				<p class="font-medium text-slate-500">Tu carrito está vacío</p>
				<button
					@click="goToCatalog()"
					class="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm rounded-lg transition"
				>
					Ver productos
				</button>
			</div>

			<!-- Items -->
			<div v-if="cart.items.length > 0" class="space-y-4">
				<div v-for="item in cart.items" :key="item.product.id" class="flex gap-3 border border-slate-100 rounded-xl p-3">
					<!-- Imagen -->
					<div class="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
						<img
							v-if="imageUrl(item.product)"
							:src="imageUrl(item.product)!"
							:alt="item.product.name"
							class="w-full h-full object-cover"
						/>
						<svg v-else class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>

					<!-- Info -->
					<div class="flex-1 min-w-0">
						<p class="font-semibold text-slate-800 text-sm line-clamp-1">{{ item.product.name }}</p>
						<p class="text-xs text-slate-400 mt-0.5">{{ formatGs(item.product.price) }}</p>
						<div class="flex items-center justify-between mt-2">
							<!-- Cantidad -->
							<div class="flex items-center border border-slate-200 rounded-lg overflow-hidden">
								<button @click="cart.decrement(item.product.id)" class="px-2.5 py-1 text-slate-500 hover:bg-slate-100 transition text-sm">-</button>
								<span class="px-2 text-sm font-medium text-slate-800">{{ item.quantity }}</span>
								<button @click="cart.increment(item.product.id)" class="px-2.5 py-1 text-slate-500 hover:bg-slate-100 transition text-sm">+</button>
							</div>
							<button
								@click="cart.remove(item.product.id)"
								class="p-1.5 text-slate-400 hover:text-red-500 transition"
								title="Quitar"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div v-if="cart.items.length > 0" class="border-t border-slate-200 px-4 py-4">
			<div class="flex items-center justify-between mb-3">
				<span class="text-sm text-slate-600">Total</span>
				<span class="text-lg font-extrabold text-slate-900">{{ formatGs(cart.total) }}</span>
			</div>
			<p class="text-xs text-slate-400 mb-3">Se envía como consulta por WhatsApp para confirmar disponibilidad y precios.</p>

			<button
				@click="sendByWhatsApp()"
				:disabled="!waNumber"
				class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1ebe5b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
			>
				<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
					<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
				</svg>
				Consultar por WhatsApp
			</button>
		</div>
	</aside>
</template>