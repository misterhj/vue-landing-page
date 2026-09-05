<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ProductRequestDto } from '@/core/models'
import { productRequestService } from '@/core/services/domain'
import { formatDateTime } from '@/core/utils/format'

const requests = ref<ProductRequestDto[]>([])
const isLoading = ref(true)

onMounted(async () => {
	try {
		requests.value = await productRequestService.getAll()
	} catch (err) {
		console.error('Error al cargar solicitudes:', err)
	} finally {
		isLoading.value = false
	}
})

function statusLabel(status: string): string {
	switch (status) {
		case 'added':
			return 'Agregado al catálogo'
		case 'rejected':
			return 'Rechazado'
		default:
			return 'Pendiente'
	}
}

function statusClasses(status: string): string {
	switch (status) {
		case 'added':
			return 'bg-emerald-500/20 text-emerald-400'
		case 'rejected':
			return 'bg-rose-500/20 text-rose-400'
		default:
			return 'bg-amber-500/20 text-amber-400'
	}
}
</script>

<template>
	<div class="p-1">
		<div class="bg-slate-800/50 rounded-xl border border-slate-700/60 p-4 sm:p-6 mb-6">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h1 class="text-lg sm:text-xl font-bold text-white">Productos Solicitados</h1>
					<p class="text-sm text-slate-400 mt-0.5">
						Pedidos que los clientes solicitaron por el chat y que aún no están en el catálogo.
					</p>
				</div>
				<span
					class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-200 w-fit"
				>
					{{ requests.length }} en total
				</span>
			</div>
		</div>

		<div v-if="isLoading" class="py-12 flex justify-center items-center gap-3 text-slate-400">
			<div class="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
			<span>Cargando solicitudes...</span>
		</div>

		<div
			v-else-if="requests.length === 0"
			class="py-12 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-600 rounded-xl"
		>
			<svg class="w-12 h-12 mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				/>
			</svg>
			<p class="font-medium text-slate-300">Aún no hay productos solicitados</p>
			<p class="text-sm mt-1">Cuando un cliente pida un producto que no existe, aparecerá acá.</p>
		</div>

		<div v-else class="bg-slate-800/50 rounded-xl border border-slate-700/60 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="bg-slate-700/40 text-slate-300 text-left">
							<th class="px-4 py-3 font-semibold">ID</th>
							<th class="px-4 py-3 font-semibold">Producto solicitado</th>
							<th class="px-4 py-3 font-semibold">Cliente</th>
							<th class="px-4 py-3 font-semibold">Estado</th>
							<th class="px-4 py-3 font-semibold">Fecha</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-700/60">
						<tr v-for="r in requests" :key="r.id" class="hover:bg-slate-700/20 transition">
							<td class="px-4 py-3 text-slate-400">{{ r.id }}</td>
							<td class="px-4 py-3 font-medium text-white">{{ r.term }}</td>
							<td class="px-4 py-3 text-slate-300">{{ r.userName }}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
									:class="statusClasses(r.status)"
								>
									{{ statusLabel(r.status) }}
								</span>
							</td>
							<td class="px-4 py-3 text-slate-400 whitespace-nowrap">{{ formatDateTime(r.createdAt) }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>