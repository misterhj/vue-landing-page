<script setup lang="ts"></script>

<template>
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8">Política de Privacidad</h1>

		<div class="space-y-6 text-sm text-slate-600 leading-relaxed">
			<p class="text-xs text-slate-400">Última actualización: 26 de agosto de 2026</p>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">1. Información que recopilamos</h2>
				<p>Cuando utilizás nuestros servicios, podemos recopilar la siguiente información:</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li><strong>Datos de registro:</strong> nombre, apellido, correo electrónico, nombre de usuario y número de teléfono cuando creás una cuenta.</li>
					<li><strong>Datos de autenticación social:</strong> si iniciás sesión con Google o Facebook, recibimos tu nombre, apellido y correo electrónico verificado por el proveedor.</li>
					<li><strong>Datos de navegación:</strong> productos consultados, búsquedas realizadas y tiempo de permanencia en el sitio.</li>
					<li><strong>Mensajes del chat:</strong> conversaciones sostenidas con nuestro asistente virtual, vinculadas a tu cuenta.</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">2. Uso de la información</h2>
				<p>Utilizamos la información recopilada para:</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li>Brindar y mejorar nuestros servicios de catálogo y atención al cliente.</li>
					<li>Personalizar tu experiencia de compra y mostrarte productos relevantes.</li>
					<li>Enviar comunicaciones relacionadas con tu cuenta o pedidos (solo si lo solicitás).</li>
					<li>Prevenir fraudes y garantizar la seguridad de la plataforma.</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">3. Compartición de datos</h2>
				<p>
					No vendemos ni compartimos tu información personal con terceros para fines de marketing.
					Podemos compartir datos únicamente con:
				</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li>Proveedores de servicios de pago necesarios para procesar transacciones.</li>
					<li>Servicios de autenticación (Google, Facebook) exclusivamente para el inicio de sesión.</li>
					<li>Autoridades competentes cuando la ley lo requiera.</li>
				</ul>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">4. Cookies y tecnologías similares</h2>
				<p>
					Utilizamos cookies esenciales para el funcionamiento del sitio (autenticación, preferencias de sesión).
					Estas cookies son necesarias para que el sitio funcione correctamente y no pueden desactivarse.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">5. Seguridad de los datos</h2>
				<p>
					Implementamos medidas técnicas y organizativas para proteger tu información personal contra acceso
					no autorizado, pérdida o alteración. Las contraseñas se almacenan de forma hasheada y nunca se
					guardan en texto plano.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">6. Tus derechos</h2>
				<p>Tenés derecho a:</p>
				<ul class="list-disc list-inside mt-2 space-y-1">
					<li>Acceder a la información personal que tenemos sobre vos.</li>
					<li>Solicitar la corrección o eliminación de tus datos.</li>
					<li>Oponerte al procesamiento de tu información para fines específicos.</li>
					<li>Solicitar la portabilidad de tus datos.</li>
				</ul>
				<p class="mt-2">Para ejercer estos derechos, contactanos a través de nuestro canal de WhatsApp o correo electrónico.</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">7. Retención de datos</h2>
				<p>
					Conservamos tu información personal mientras tu cuenta esté activa o sea necesaria para brindarte
					nuestros servicios. Si solicitás la eliminación de tu cuenta, procederemos a eliminar tus datos
					en un plazo razonable.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">8. Cambios en esta política</h2>
				<p>
					Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios serán publicados
					en esta página con la fecha de la última actualización.
				</p>
			</section>

			<section>
				<h2 class="text-base font-bold text-slate-900 mb-2">9. Contacto</h2>
				<p>
					Si tenés preguntas sobre esta política de privacidad o sobre el tratamiento de tus datos,
					podés comunicarte con nosotros a través de nuestro canal de WhatsApp (botón verde en la esquina
					inferior derecha) o por correo electrónico.
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