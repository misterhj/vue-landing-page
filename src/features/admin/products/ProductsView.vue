<script setup lang="ts">
import { computed, ref } from 'vue'
import ProductTable from './ProductTable.vue'
import ProductModal from './ProductModal.vue'
import type { ProductFormData } from './ProductModal.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import type { Product } from '@/core/models'
import { productService } from '@/core/services/product'

const productTable = ref<InstanceType<typeof ProductTable> | null>(null)

// Crear / Editar Modal
const isModalOpen = ref(false)
const productToEdit = ref<Product | null>(null)
const isSaving = ref(false)

// Eliminar Confirm Modal
const isDeleteModalOpen = ref(false)
const deletingProduct = ref<Product | null>(null)
const isDeleting = ref(false)

function openCreateModal(): void {
	productToEdit.value = null
	isModalOpen.value = true
}

function openEditModal(product: Product): void {
	productToEdit.value = product
	isModalOpen.value = true
}

async function onSave(payload: ProductFormData): Promise<void> {
	isSaving.value = true
	try {
		const product = productToEdit.value
		const isEdit = !!product?.id

		const body: ProductFormData & { id?: number } = {
			id: isEdit ? product.id : undefined,
			...payload,
		}

		if (isEdit && product?.id) {
			await productService.updateProduct(product.id, body)
		} else {
			await productService.createProduct(body)
		}

		isModalOpen.value = false
		productToEdit.value = null
		productTable.value?.reload()
	} catch (err) {
		console.error('Error al guardar producto:', err)
	} finally {
		isSaving.value = false
	}
}

function onDelete(product: Product): void {
	deletingProduct.value = product
	isDeleteModalOpen.value = true
}

async function onConfirmDelete(): Promise<void> {
	const product = deletingProduct.value
	if (!product?.id) return

	isDeleting.value = true
	try {
		await productService.deleteProduct(product.id)
		isDeleteModalOpen.value = false
		deletingProduct.value = null
		productTable.value?.reload()
	} catch (err) {
		console.error('Error al eliminar producto:', err)
	} finally {
		isDeleting.value = false
	}
}

const deleteMessage = computed(() =>
	deletingProduct.value ? `¿Estás seguro de que deseas eliminar el producto "${deletingProduct.value.name}"?` : '',
)
</script>

<template>
	<div class="p-1">
		<ProductTable ref="productTable" @on-create="openCreateModal" @on-edit="openEditModal" @on-delete="onDelete" />
	</div>

	<!-- MODAL CREAR / EDITAR -->
	<ProductModal
		:is-open="isModalOpen"
		:product-to-edit="productToEdit"
		:is-saving="isSaving"
		@on-close="isModalOpen = false"
		@on-save="onSave"
	/>

	<!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN -->
	<ConfirmModal
		:is-open="isDeleteModalOpen"
		:is-loading="isDeleting"
		title="Eliminar Producto"
		:message="deleteMessage"
		@confirm="onConfirmDelete"
		@cancel="isDeleteModalOpen = false"
	/>
</template>