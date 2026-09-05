<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import Modal from '@/shared/components/Modal.vue'
import SearchableSelect from '@/shared/components/SearchableSelect.vue'
import type { Brand, Category, Model, Product, ProductMedia, Section } from '@/core/models'
import { brandService, categoryService, modelService, sectionService } from '@/core/services/domain'

export interface ProductFormData {
	code?: string
	barcode?: string
	name: string
	description?: string
	price: number
	stock?: number
	sectionId?: number
	categoryId?: number | null
	subcategoryId?: number | null
	brandId?: number | null
	modelId?: number | null
	specifications?: Record<string, string>
	media?: ProductMedia[]
}

const props = withDefaults(
	defineProps<{
		isOpen: boolean
		productToEdit: Product | null
		isSaving: boolean
	}>(),
	{
		productToEdit: null,
		isSaving: false,
	},
)

const emit = defineEmits<{ onClose: []; onSave: [payload: ProductFormData] }>()

const TABS = ['Datos', 'Multimedia', 'Especificaciones'] as const
const activeTab = ref<(typeof TABS)[number]>('Datos')

const form = reactive({
	id: null as number | null,
	code: '',
	barcode: '',
	name: '',
	price: 0,
	stock: 0,
	sectionId: undefined as number | undefined,
	categoryId: undefined as number | null | undefined,
	subcategoryId: undefined as number | null | undefined,
	brandId: undefined as number | null | undefined,
	modelId: undefined as number | null | undefined,
	description: '',
})

const touched = reactive<{ name: boolean; price: boolean; stock: boolean }>({ name: false, price: false, stock: false })

const mediaList = ref<ProductMedia[]>([])
const newMediaUrl = ref('')
const newMediaType = ref<'image' | 'video'>('image')

interface SpecRow {
	key: string
	value: string
}
const specRows = ref<SpecRow[]>([])
const newSpecKey = ref('')
const newSpecValue = ref('')

const sections = ref<Section[]>([])
const categories = ref<Category[]>([])
const brands = ref<Brand[]>([])
const models = ref<Model[]>([])

const enabledTabs = computed<(typeof TABS)[number][]>(() =>
	form.id ? [...TABS] : [TABS[0], TABS[1]],
)

const choosableSubcategories = computed<Category[]>(() => {
	const cat = categories.value.find((c) => c.id === form.categoryId)
	return cat?.subcategories ?? []
})

const choosableModels = computed<Model[]>(() => {
	if (form.brandId === undefined || form.brandId === null) return []
	return models.value.filter((m) => m.brandId === form.brandId)
})

async function loadCatalogs(): Promise<void> {
	await Promise.allSettled([
		sectionService.getSections().then((data) => {
			sections.value = data
		}),
		categoryService.getCategories().then((data) => {
			categories.value = data
		}),
		brandService.getBrands().then((data) => {
			brands.value = data
		}),
		modelService.getModels().then((data) => {
			models.value = data
		}),
	])
}

function parseSpecifications(specs: Record<string, string> | null | undefined): void {
	if (!specs) {
		specRows.value = []
		return
	}
	specRows.value = Object.entries(specs).map(([key, value]) => ({ key, value }))
}

function serializeSpecifications(): Record<string, string> {
	return specRows.value.reduce<Record<string, string>>((acc, row) => {
		const key = row.key.trim()
		const value = row.value.trim()
		if (key && value) {
			acc[key] = value
		}
		return acc
	}, {})
}

function applyEditData(product: Product): void {
	const catId = product.categoryId ?? product.category?.id ?? null
	const brandId = product.brandId ?? product.brand?.id ?? null

	form.id = product.id ?? null
	form.code = product.code ?? ''
	form.barcode = product.barcode ?? ''
	form.name = product.name
	form.description = product.description ?? ''
	form.price = product.price
	form.stock = product.stock ?? 0
	form.sectionId = product.sectionId ?? undefined
	form.categoryId = catId
	form.subcategoryId = product.subcategoryId ?? product.subcategory?.id ?? null
	form.brandId = brandId
	form.modelId = product.modelId ?? product.model?.id ?? null

	mediaList.value = (product.media ?? []).map((m) => ({ ...m }))
	parseSpecifications(product.specifications)
}

function resetForm(): void {
	form.id = null
	form.code = ''
	form.barcode = ''
	form.name = ''
	form.price = 0
	form.stock = 0
	form.sectionId = undefined
	form.categoryId = undefined
	form.subcategoryId = undefined
	form.brandId = undefined
	form.modelId = undefined
	form.description = ''

	touched.name = false
	touched.price = false
	touched.stock = false
	mediaList.value = []
	newMediaUrl.value = ''
	newMediaType.value = 'image'
	specRows.value = []
	newSpecKey.value = ''
	newSpecValue.value = ''
}

function resizeDescription(el: HTMLTextAreaElement): void {
	el.style.height = 'auto'
	const max = 240
	el.style.height = `${Math.min(el.scrollHeight, max)}px`
	el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
}

function onDescriptionInput(event: Event): void {
	resizeDescription(event.target as HTMLTextAreaElement)
}

function addMediaRow(): void {
	const url = newMediaUrl.value.trim()
	if (!url) return
	mediaList.value.push({ url, mediaType: newMediaType.value })
	newMediaUrl.value = ''
	newMediaType.value = 'image'
}

function setPrimaryMedia(media: ProductMedia): void {
	mediaList.value = mediaList.value.map((m) => ({ ...m, isPrimary: m === media ? true : false }))
}

function removeMedia(index: number): void {
	mediaList.value.splice(index, 1)
}

function addSpecRow(): void {
	const key = newSpecKey.value.trim()
	if (!key) return
	specRows.value.push({ key, value: newSpecValue.value.trim() })
	newSpecKey.value = ''
	newSpecValue.value = ''
}

function removeSpecRow(index: number): void {
	specRows.value.splice(index, 1)
}

const formValid = computed(() => form.name.trim().length >= 3 && form.price >= 0 && form.stock >= 0)

function serializeMedia(): ProductMedia[] {
	return mediaList.value.map((m, i) => ({
		...(m.id !== undefined ? { id: m.id } : {}),
		url: m.url.trim(),
		mediaType: m.mediaType,
		isPrimary: m.isPrimary || i === 0,
		isDeleted: m.isDeleted,
	}))
}

function submitForm(): void {
	touched.name = true
	touched.price = true
	touched.stock = true
	if (!formValid.value) {
		return
	}

	emit('onSave', {
		code: form.code.trim() || undefined,
		barcode: form.barcode.trim() || undefined,
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		price: Number(form.price),
		stock: Number(form.stock),
		...(form.sectionId ? { sectionId: form.sectionId } : {}),
		...(form.categoryId ? { categoryId: form.categoryId } : { categoryId: null }),
		...(form.subcategoryId ? { subcategoryId: form.subcategoryId } : { subcategoryId: null }),
		...(form.brandId ? { brandId: form.brandId } : { brandId: null }),
		...(form.modelId ? { modelId: form.modelId } : { modelId: null }),
		specifications: serializeSpecifications(),
		media: serializeMedia(),
	})
}

watch(
	() => [props.isOpen, props.productToEdit] as const,
	async ([open, product]) => {
		if (!open) return
		activeTab.value = 'Datos'
		await loadCatalogs()
		if (product) {
			applyEditData(product)
		} else {
			resetForm()
		}
		await nextTick()
		const area = document.querySelector<HTMLTextAreaElement>('[data-desc-auto-grow]')
		if (area) {
			resizeDescription(area)
		}
	},
)
// Helpers de actualización de SearchableSelect
function setNumeric(formKey: 'sectionId', value: number | string | null): void {
	form.sectionId = value != null ? Number(value) : undefined
}
function setNullableNumeric(formKey: 'categoryId' | 'subcategoryId' | 'brandId' | 'modelId', value: number | string | null): void {
	;(form as unknown as Record<string, number | null | undefined>)[formKey] = value != null ? Number(value) : null
}
</script>

<template>
	<Modal
		:is-open="isOpen"
		:title="form.id ? `Editar Producto #${form.id}` : 'Nuevo Producto'"
		max-width-class="max-w-3xl"
		@close="emit('onClose')"
	>
		<fieldset :disabled="isSaving" class="space-y-4">
			<!-- TABS -->
			<div class="border-b border-slate-800 pb-3">
				<div class="flex items-center space-x-4">
					<button
						v-for="tab in enabledTabs"
						:key="tab"
						type="button"
						@click="activeTab = tab"
						:class="activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 border-b-2 border-transparent hover:text-slate-200'"
						class="text-sm font-medium pb-1 transition cursor-pointer flex items-center gap-2"
					>
						{{ tab }}
						<span v-if="tab === 'Multimedia'" class="text-xs font-bold text-blue-400/80 bg-blue-500/10 rounded-full px-2 py-0.5">
							{{ mediaList.length }}
						</span>
					</button>
				</div>
			</div>

			<!-- TAB DATOS -->
			<div v-show="activeTab === 'Datos'" class="space-y-4">
				<div class="space-y-4">
					<!-- CÓDIGO -->
					<div>
						<label class="block text-xs font-medium text-slate-300 mb-1">Código</label>
						<input
							type="text"
							v-model="form.code"
							placeholder="Ej. PRD-001"
							class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
					</div>

					<!-- CÓDIGO DE BARRAS -->
					<div>
						<label class="block text-xs font-medium text-slate-300 mb-1">Código de Barras</label>
						<input
							type="text"
							v-model="form.barcode"
							placeholder="Ej. 7791234567890"
							class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
					</div>

					<!-- NOMBRE -->
					<div>
						<label class="block text-xs font-medium text-slate-300 mb-1">Nombre *</label>
						<input
							type="text"
							v-model="form.name"
							@blur="touched.name = true"
							placeholder="Ej. Cereal Coco Pops 350g"
							class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<span v-if="touched.name && form.name.trim().length < 3" class="text-[10px] text-red-400 mt-1 block">
							El nombre es obligatorio (mínimo 3 caracteres).
						</span>
					</div>

					<!-- SELECTS DE CLASIFICACIÓN -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Sección</label>
							<SearchableSelect
								:model-value="form.sectionId ?? null"
								:options="sections"
								placeholder="Seleccionar sección..."
								@update:model-value="setNumeric('sectionId', $event)"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Categoría</label>
							<SearchableSelect
								:model-value="form.categoryId ?? null"
								:options="categories"
								placeholder="Seleccionar categoría..."
								@update:model-value="setNullableNumeric('categoryId', $event); form.subcategoryId = null"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Subcategoría</label>
							<SearchableSelect
								:model-value="form.subcategoryId ?? null"
								:options="choosableSubcategories"
								placeholder="Seleccionar subcategoría..."
								:disabled="form.categoryId == null"
								@update:model-value="setNullableNumeric('subcategoryId', $event)"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Marca</label>
							<SearchableSelect
								:model-value="form.brandId ?? null"
								:options="brands"
								placeholder="Seleccionar marca..."
								@update:model-value="setNullableNumeric('brandId', $event); form.modelId = null"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Modelo</label>
							<SearchableSelect
								:model-value="form.modelId ?? null"
								:options="choosableModels"
								placeholder="Seleccionar modelo..."
								:disabled="form.brandId == null"
								@update:model-value="setNullableNumeric('modelId', $event)"
							/>
						</div>
					</div>

					<!-- PRECIO Y STOCK -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Precio (Gs) *</label>
							<input
								type="number"
								v-model.number="form.price"
								@blur="touched.price = true"
								min="0"
								step="0.01"
								class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
							/>
							<span v-if="touched.price && form.price < 0" class="text-[10px] text-red-400 mt-1 block">
								El precio debe ser mayor o igual a 0.
							</span>
						</div>
						<div>
							<label class="block text-xs font-medium text-slate-300 mb-1">Stock *</label>
							<input
								type="number"
								v-model.number="form.stock"
								@blur="touched.stock = true"
								min="0"
								class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
							/>
							<span v-if="touched.stock && form.stock < 0" class="text-[10px] text-red-400 mt-1 block">
								El stock debe ser mayor o igual a 0.
							</span>
						</div>
					</div>

					<!-- DESCRIPCIÓN -->
					<div>
						<label class="block text-xs font-medium text-slate-300 mb-1">Descripción</label>
						<textarea
							v-model="form.description"
							data-desc-auto-grow
							rows="3"
							@input="onDescriptionInput"
							placeholder="Descripción del producto, ingredientes, garantía, etc."
							class="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition resize-none overflow-hidden placeholder:text-slate-500"
						></textarea>
					</div>
				</div>
			</div>

			<!-- TAB MULTIMEDIA -->
			<div v-show="activeTab === 'Multimedia'" class="space-y-4">
				<!-- LISTA DE MEDIA -->
				<div v-if="mediaList.length > 0" class="space-y-3">
					<div
						v-for="(media, i) in mediaList"
						:key="i"
						class="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3 flex-wrap"
					>
						<!-- PRIMARIO -->
						<div class="flex items-center gap-2 flex-shrink-0">
							<input
								type="radio"
								name="primaryMedia"
								:checked="media.isPrimary"
								@change="setPrimaryMedia(media)"
								class="accent-blue-500 cursor-pointer"
							/>
							<span class="text-[10px] uppercase text-slate-500 w-12">Primaria</span>
						</div>

						<!-- PREVIEW -->
						<div class="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
							<img v-if="media.mediaType === 'image'" :src="media.url" :alt="`Media ${i + 1}`" class="w-full h-full object-cover" />
							<video v-else :src="media.url" muted class="w-full h-full object-cover" />
						</div>

						<!-- URL -->
						<input
							type="text"
							v-model="media.url"
							placeholder="https://..."
							class="flex-1 min-w-[160px] px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>

						<!-- TIPO -->
						<select
							v-model="media.mediaType"
							class="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition cursor-pointer"
						>
							<option value="image">Imagen</option>
							<option value="video">Video</option>
						</select>

						<!-- ELIMINAR -->
						<button
							type="button"
							@click="removeMedia(i)"
							class="p-2 text-slate-400 hover:text-red-400 transition cursor-pointer flex-shrink-0"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- AGREGAR MULTIMEDIA -->
				<div class="rounded-lg border border-dashed border-slate-600 p-4 space-y-3">
					<p class="text-xs text-slate-400">Agregar nueva imagen o video (URL)</p>
					<div class="flex items-center gap-3 flex-wrap">
						<select
							v-model="newMediaType"
							class="px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition cursor-pointer"
						>
							<option value="image">Imagen</option>
							<option value="video">Video</option>
						</select>
						<input
							type="text"
							v-model="newMediaUrl"
							placeholder="https://ejemplo.com/imagen.jpg"
							class="flex-1 min-w-[200px] px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<button
							type="button"
							@click="addMediaRow"
							:disabled="!newMediaUrl.trim()"
							class="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition cursor-pointer"
						>
							Agregar Multimedia
						</button>
					</div>
				</div>
			</div>

			<!-- TAB ESPECIFICACIONES -->
			<div v-show="activeTab === 'Especificaciones'" class="space-y-4">
				<div v-if="specRows.length > 0" class="space-y-2">
					<div v-for="(specRow, i) in specRows" :key="i" class="flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
						<input
							type="text"
							v-model="specRow.key"
							placeholder="Clave (Ej: Garantía)"
							class="flex-1 px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<input
							type="text"
							v-model="specRow.value"
							placeholder="Valor (Ej: 3 años)"
							class="flex-1 px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<button
							type="button"
							@click="removeSpecRow(i)"
							class="p-2 text-slate-400 hover:text-red-400 transition cursor-pointer"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<div class="rounded-lg border border-dashed border-slate-600 p-4 space-y-3">
					<p class="text-xs text-slate-400">Agregar nueva especificación</p>
					<div class="flex items-center space-x-2 flex-wrap">
						<input
							type="text"
							v-model="newSpecKey"
							placeholder="Clave (Ej: Garantía)"
							class="flex-1 min-w-[140px] px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<input
							type="text"
							v-model="newSpecValue"
							placeholder="Valor (Ej: 3 años)"
							class="flex-1 min-w-[140px] px-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
						/>
						<button
							type="button"
							@click="addSpecRow"
							:disabled="!newSpecKey.trim()"
							class="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition cursor-pointer"
						>
							Agregar Espec.
						</button>
					</div>
				</div>
			</div>

			<!-- BOTONE DE ACCIÓN -->
			<div class="pt-3 flex items-center justify-between border-t border-slate-800/80">
				<p class="text-[10px] text-slate-500">Los campos marcados con * son obligatorios.</p>
				<button
					type="button"
					@click="emit('onClose')"
					:disabled="isSaving"
					class="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
				>
					Cancelar
				</button>
				<button
					type="button"
					@click="submitForm"
					:disabled="!formValid || isSaving"
					class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition flex items-center gap-2 shadow-md cursor-pointer"
				>
					<svg
						v-if="isSaving"
						class="w-4 h-4 animate-spin"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4zm16 0a8 8 0 01-8 8v-4a4 4 0 004-4h4z"
						/>
					</svg>
					{{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
				</button>
			</div>
		</fieldset>
	</Modal>
</template>