<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '@/core/services/product'
import type { Product, ProductMedia } from '@/core/models'
import { useCartStore } from '@/stores/cart'
import { formatGs } from '@/core/utils/format'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref<Product | null>(null)
const isLoading = ref(true)
const selectedMediaIndex = ref(0)
const imageContainer = ref<HTMLDivElement | null>(null)
const detailImage = ref<HTMLImageElement | null>(null)

const ZOOM = 2.5
const imageZoomStyle = ref<Record<string, string> | null>(null)

const specEntries = computed(() => Object.entries(product.value?.specifications ?? {}))

function mediaList(p: Product): ProductMedia[] {
	const list = (p.media ?? []).filter((m) => !!m.url)
	if (list.length > 0) {
		return list
	}
	return p.imageUrl ? [{ url: p.imageUrl, mediaType: 'image' }] : []
}

const currentMedia = computed(() => {
	if (!product.value) {
		return null
	}
	return mediaList(product.value)[selectedMediaIndex.value] ?? null
})

const isVideoSelected = computed(() => currentMedia.value?.mediaType === 'video')

async function loadProduct(slug: string): Promise<void> {
	if (!slug) {
		isLoading.value = false
		router.replace('/')
		return
	}
	isLoading.value = true
	try {
		const p = await productService.getProductBySlug(slug)
		product.value = p
		selectedMediaIndex.value = 0
		imageZoomStyle.value = null
	} catch (err) {
		console.error('Error al cargar producto:', err)
	} finally {
		isLoading.value = false
	}
}

function selectMedia(index: number): void {
	selectedMediaIndex.value = index
	imageZoomStyle.value = null
}

function onBuy(p: Product): void {
	cart.add(p, 1)
}

function onImageError(event: Event): void {
	;(event.target as HTMLElement).style.display = 'none'
}

function onThumbError(event: Event): void {
	;(event.target as HTMLElement).style.visibility = 'hidden'
}

function onImageMouseLeave(): void {
	imageZoomStyle.value = null
}

function onImageMouseMove(event: MouseEvent): void {
	const container = imageContainer.value
	const img = detailImage.value
	if (!container || !img) {
		imageZoomStyle.value = null
		return
	}
	if (!img.naturalWidth || !img.naturalHeight) {
		imageZoomStyle.value = null
		return
	}

	const cRect = container.getBoundingClientRect()
	const mx = event.clientX - cRect.left
	const my = event.clientY - cRect.top

	const scale = Math.min(cRect.width / img.naturalWidth, cRect.height / img.naturalHeight)
	const drawW = img.naturalWidth * scale
	const drawH = img.naturalHeight * scale
	const drawX = (cRect.width - drawW) / 2
	const drawY = (cRect.height - drawH) / 2

	if (mx < drawX || mx > drawX + drawW || my < drawY || my > drawY + drawH) {
		imageZoomStyle.value = null
		return
	}

	const px = ((mx - drawX) / drawW) * 100
	const py = ((my - drawY) / drawH) * 100

	imageZoomStyle.value = {
		transformOrigin: `${px}% ${py}%`,
		transform: `scale(${ZOOM})`,
	}
}

onMounted(() => {
	const slug = String(route.params.slug ?? '')
	void loadProduct(slug)
})

watch(
	() => route.params.slug,
	(slug) => {
		void loadProduct(String(slug ?? ''))
	},
)
</script>

<template>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Loader -->
		<div v-if="isLoading" class="py-24 flex justify-center items-center gap-3 text-slate-500">
			<div class="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
			<span>Cargando producto...</span>
		</div>

		<!-- No encontrado -->
		<div v-if="!isLoading && !product" class="py-24 text-center">
			<p class="text-slate-500 mb-4">No se encontró el producto solicitado.</p>
			<RouterLink to="/" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition">
				Volver al catálogo
			</RouterLink>
		</div>

		<template v-if="product">
			<!-- Migas de pan -->
			<nav class="text-xs text-slate-400 mb-6 flex flex-wrap items-center gap-1.5">
				<RouterLink to="/" class="hover:text-slate-900 transition">Inicio</RouterLink>
				<span>/</span>
				<template v-if="product.sectionName">
					<span class="text-slate-600">{{ product.sectionName }}</span>
					<span v-if="product.categoryName">/</span>
				</template>
				<template v-if="product.categoryName">
					<span class="text-slate-600">{{ product.categoryName }}</span>
				</template>
				<span v-if="product.sectionName || product.categoryName">/</span>
				<span class="text-slate-900 font-semibold line-clamp-1">{{ product.name }}</span>
			</nav>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
				<!-- Galería: visor + miniaturas -->
				<div>
					<div
						ref="imageContainer"
						class="w-full h-72 sm:h-96 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative"
						:class="isVideoSelected ? '' : 'cursor-zoom-in'"
						@mousemove="onImageMouseMove"
						@mouseleave="onImageMouseLeave"
					>
						<img
							v-if="currentMedia?.mediaType === 'image'"
							ref="detailImage"
							:src="currentMedia.url"
							:alt="product.name"
							@error="onImageError"
							:style="imageZoomStyle ?? undefined"
							class="w-full h-full object-contain transition-transform duration-200 ease-out will-change-transform"
						/>
						<video
							v-else-if="currentMedia"
							:src="currentMedia.url"
							controls
							preload="metadata"
							class="w-full h-full object-contain bg-black"
						></video>
						<svg v-else class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>

					<!-- Miniaturas -->
					<div v-if="product && mediaList(product).length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
						<button
							v-for="(m, i) in mediaList(product)"
							:key="i"
							type="button"
							@click="selectMedia(i)"
							class="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
							:class="i === selectedMediaIndex ? 'border-blue-500' : 'border-slate-200'"
							:aria-label="`Ver medio ${i + 1}`"
						>
							<img
								v-if="m.mediaType === 'image'"
								:src="m.url"
								:alt="`${product.name} - ${i + 1}`"
								@error="onThumbError"
								class="w-full h-full object-cover"
							/>
							<span v-else class="absolute inset-0 flex items-center justify-center bg-slate-900">
								<svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8 5v14l11-7z" />
								</svg>
							</span>
						</button>
					</div>
				</div>

				<!-- Información -->
				<div class="flex flex-col">
					<div class="flex items-center gap-2 flex-wrap mb-3">
						<span v-if="product.brandName" class="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md uppercase tracking-wide">{{ product.brandName }}</span>
						<span v-if="product.categoryName" class="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md">{{ product.categoryName }}</span>
						<span v-if="product.modelName" class="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-md">{{ product.modelName }}</span>
					</div>

					<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">{{ product.name }}</h1>

					<div class="mt-3 space-y-1 text-sm text-slate-500">
						<p v-if="product.code"><span class="font-semibold text-slate-700">Código:</span> {{ product.code }}</p>
						<p v-if="product.barcode"><span class="font-semibold text-slate-700">Código de barras:</span> {{ product.barcode }}</p>
					</div>

					<!-- Disponibilidad -->
					<div class="mt-4">
						<span
							:class="(product.stock ?? 0) > 0
								? 'inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1'
								: 'inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1'"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<template v-if="(product.stock ?? 0) > 0">
								{{ product.stock === 1 ? 'Queda 1 unidad' : `Quedan ${product.stock} unidades` }}
							</template>
							<template v-else>Producto agotado</template>
						</span>
					</div>

					<!-- Precio -->
					<div class="mt-5">
						<span class="text-xs text-slate-400 block">Precio</span>
						<span class="text-3xl font-extrabold text-slate-900">{{ formatGs(product.price) }}</span>
					</div>

					<!-- Descripción -->
					<p v-if="product.description" class="mt-5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ product.description }}</p>

					<!-- Acciones -->
					<div class="mt-6 flex flex-col sm:flex-row gap-3">
						<button
							@click="onBuy(product)"
							class="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
						>
							Comprar ahora
						</button>
						<button
							@click="onBuy(product)"
							class="flex-1 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl transition"
						>
							Consultar
						</button>
					</div>
				</div>
			</div>

			<!-- Especificaciones técnicas -->
			<div v-if="specEntries.length > 0" class="mt-12">
				<h2 class="text-lg font-bold text-slate-900 mb-4">Especificaciones técnicas</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5">
					<div v-for="[key, value] in specEntries" :key="key" class="flex items-start gap-2 text-sm">
						<svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-slate-600"><span class="font-semibold text-slate-900">{{ key }}:</span> {{ value }}</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>