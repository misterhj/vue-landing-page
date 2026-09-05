<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavbarBar from '@/shared/components/NavbarBar.vue'
import FooterBar from '@/shared/components/FooterBar.vue'
import WhatsAppButton from '@/shared/components/WhatsAppButton.vue'
import CartDrawer from '@/shared/components/CartDrawer.vue'
import ChatWidget from '@/shared/components/ChatWidget.vue'
</script>

<template>
	<div class="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased">
		<NavbarBar />
		<main class="flex-1 pt-32 sm:pt-36 lg:pt-24">
			<RouterView />
		</main>
		<FooterBar />
		<WhatsAppButton />
		<CartDrawer />
		<ChatWidget />
	</div>
</template>