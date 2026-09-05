<script setup lang="ts"></script>

<template>
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Eliminación de Datos de Usuario</h1>

		<div class="space-y-6 text-sm text-slate-600 leading-relaxed">
			<p class="text-xs text-slate-400">Última actualización: 26 de agosto de 2026</p>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">1. Tu derecho a eliminar tus datos</h2>
				<p>
					De acuerdo con las políticas de Meta/Facebook y las normativas de protección de datos,
					tenés derecho a solicitar la eliminación de tu cuenta y de toda la información personal
					que hayas compartido con nosotros al iniciar sesión con Facebook.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">2. Cómo solicitar la eliminación</h2>
				<p>Para solicitar la eliminación de tus datos, tenés dos opciones:</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li>
						<strong>Desde la aplicación:</strong> en el futuro, podrás gestionar la eliminación
						desde tu perfil de usuario dentro del sitio.
					</li>
					<li>
						<strong>Por correo electrónico:</strong> envianos un correo con el asunto
						"Solicitud de eliminación de datos" indicando tu nombre de usuario o el correo
						electrónico con el que te registraste.
					</li>
					<li>
						<strong>Por WhatsApp:</strong> escribinos por el botón verde indicando que querés
						eliminar tus datos.
					</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">3. Qué se elimina</h2>
				<p>Al procesar tu solicitud eliminaremos:</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li>Tu cuenta de usuario y credenciales asociadas.</li>
					<li>Tu nombre, apellido y correo electrónico.</li>
					<li>El historial de conversaciones del chat vinculadas a tu cuenta.</li>
					<li>Preferencias y datos de navegación asociados a tu perfil.</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">4. Exclusiones</h2>
				<p>
					Podemos conservar información cuando sea requerido por obligaciones legales, resolución de
					disputas o aplicación de estos términos. Estos datos se conservarán durante el plazo mínimo
					legal exigido y serán tratados de forma confidencial.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">5. Plazo de procesamiento</h2>
				<p>
					Procesamos las solicitudes de eliminación en un plazo máximo de 30 días hábiles desde la
					recepción y verificación de la solicitud.
				</p>
			</section>
		</div>

		<div class="mt-10">
			<RouterLink to="/" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Volver al inicio
			</RouterLink>
		</div>
	</div>
</template>