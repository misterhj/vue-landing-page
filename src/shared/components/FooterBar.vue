<script setup lang="ts"></script>

<template>
	<footer class="bg-white border-t border-slate-200 text-slate-500 text-sm py-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
			<RouterLink to="/" class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-sm">
					CS
				</div>
				<span class="font-semibold text-slate-900">Cute Store</span>
				<span class="text-xs">© 2026 Todos los derechos reservados.</span>
			</RouterLink>

			<div class="flex items-center gap-6 text-xs">
				<RouterLink to="/condiciones-del-servicio" class="hover:text-slate-900 transition">Términos y Condiciones</RouterLink>
				<RouterLink to="/politica-de-privacidad" class="hover:text-slate-900 transition">Política de Privacidad</RouterLink>
				<RouterLink to="/eliminacion-de-datos" class="hover:text-slate-900 transition">Eliminación de Datos</RouterLink>
				<a href="#" class="hover:text-slate-900 transition">Soporte</a>
			</div>
		</div>
	</footer>
</template>