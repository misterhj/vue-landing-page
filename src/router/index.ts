import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PublicLayout from '@/features/public/PublicLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
	// RUTAS PÚBLICAS
	{
		path: '/',
		component: PublicLayout,
		children: [
			{
				path: '',
				component: () => import('@/features/public/landing/LandingView.vue'),
				meta: { title: 'Cute Store' },
			},
			{
				path: 'producto/:slug',
				component: () => import('@/features/public/products/ProductDetailView.vue'),
			},
		],
	},

	// PÁGINAS ESTÁTICAS (sin navbar de productos)
	{
		path: '/politica-de-privacidad',
		component: () => import('@/features/public/StaticPageLayout.vue'),
		children: [
			{
				path: '',
				component: () => import('@/features/public/privacy-policy/PrivacyPolicyView.vue'),
			},
		],
	},
	{
		path: '/condiciones-del-servicio',
		component: () => import('@/features/public/StaticPageLayout.vue'),
		children: [
			{
				path: '',
				component: () => import('@/features/public/terms-of-service/TermsOfServiceView.vue'),
			},
		],
	},
	{
		path: '/eliminacion-de-datos',
		component: () => import('@/features/public/StaticPageLayout.vue'),
		children: [
			{
				path: '',
				component: () => import('@/features/public/data-deletion/DataDeletionView.vue'),
			},
		],
	},

	// AUTENTICACIÓN
	{
		path: '/login',
		component: () => import('@/features/auth/LoginView.vue'),
	},
	{
		path: '/register',
		component: () => import('@/features/auth/RegisterView.vue'),
	},
	{
		path: '/auth/callback',
		component: () => import('@/features/auth/AuthCallbackView.vue'),
	},

	// ZONA ADMIN (Protegida)
	{
		path: '/admin',
		component: () => import('@/features/admin/AdminLayout.vue'),
		meta: { requiresAuth: true },
		children: [
			{
				path: 'dashboard',
				component: () => import('@/features/admin/dashboard/DashboardView.vue'),
				meta: { title: 'Dashboard', icon: 'dashboard', showInSidebar: true },
			},
			{
				path: 'catalog',
				meta: { title: 'Catálogo', icon: 'catalog', isDropdown: true },
				children: [
					{
						path: 'products',
						component: () => import('@/features/admin/products/ProductsView.vue'),
						meta: { title: 'Productos' },
					},
					{
						path: 'categories',
						component: () => import('@/features/admin/categories/CategoriesView.vue'),
						meta: { title: 'Categorías y Subcats' },
					},
					{
						path: 'brands',
						component: () => import('@/features/admin/brands/BrandsView.vue'),
						meta: { title: 'Marcas y Modelos' },
					},
					{
						path: 'sections',
						component: () => import('@/features/admin/sections/SectionsView.vue'),
						meta: { title: 'Secciones' },
					},
					{
						path: 'product-requests',
						component: () => import('@/features/admin/product-requests/ProductRequestsView.vue'),
						meta: { title: 'Solicitudes de Clientes' },
					},
				],
			},
			{
				path: 'users',
				component: () => import('@/features/admin/users/UsersView.vue'),
				meta: { title: 'Usuarios', icon: 'users', showInSidebar: true },
			},
			{
				path: 'settings',
				component: () => import('@/features/admin/settings/SettingsView.vue'),
				meta: { title: 'Configuraciones', icon: 'settings', showInSidebar: true },
			},
			{
				path: '',
				redirect: 'dashboard',
				meta: { title: 'Dashboard', icon: 'dashboard', showInSidebar: true },
			},
		],
	},

	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to) => {
	if (to.matched.some((record) => record.meta.requiresAuth)) {
		const auth = useAuthStore()
		if (!auth.isAuthenticated) {
			return { path: '/login' }
		}
	}
	return true
})

export default router