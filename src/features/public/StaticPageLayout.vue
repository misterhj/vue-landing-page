<script setup lang="ts">
import { RouterView } from 'vue-router'
import FooterBar from '@/shared/components/FooterBar.vue'
</script>

<template>
	<div class="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
		<!-- Header simple: solo brand + link -->
		<header class="bg-slate-900 border-b border-slate-800">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
				<RouterLink to="/" class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white text-sm">
						CS
					</div>
					<span class="font-bold text-lg text-white tracking-wide">Cute Store</span>
				</RouterLink>
				<RouterLink to="/" class="text-xs text-slate-400 hover:text-white transition">
					← Volver al inicio
				</RouterLink>
			</div>
		</header>

		<main class="flex-1">
			<RouterView />
		</main>

		<FooterBar />
	</div>
</template>