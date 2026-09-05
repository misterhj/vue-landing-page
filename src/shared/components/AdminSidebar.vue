<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuItem {
	title: string
	icon?: string
	path?: string
	isDropdown?: boolean
	children?: MenuItem[]
}

const router = useRouter()
const route = useRoute()

const openDropdowns = ref<Record<string, boolean>>({})

function mapRoute(routeRecord: any, parentPath: string): MenuItem | null {
	if (routeRecord.redirect) {
		return null
	}
	const currentPath =
		routeRecord.path === '' ? parentPath : `${parentPath}/${routeRecord.path}`

	const item: MenuItem = {
		title: routeRecord.meta?.title ?? '',
		icon: routeRecord.meta?.icon,
		isDropdown: !!routeRecord.meta?.isDropdown,
		path: routeRecord.children ? undefined : currentPath,
	}

	if (routeRecord.children) {
		item.children = routeRecord.children
			.map((child: any) => mapRoute(child, currentPath))
			.filter((child: MenuItem | null): child is MenuItem => child !== null && !!child.title)
	}

	return item
}

function buildMenu(): MenuItem[] {
	const adminRoute = router.options.routes.find((r) => r.path === '/admin')
	if (!adminRoute || !adminRoute.children) {
		return []
	}
	return (adminRoute.children as any[])
		.map((child) => mapRoute(child, '/admin'))
		.filter((item): item is MenuItem => item !== null && !!item.title)
}

const menuItems = ref<MenuItem[]>(buildMenu())

function toggleDropdown(title: string): void {
	openDropdowns.value = { ...openDropdowns.value, [title]: !openDropdowns.value[title] }
}

function isDropdownOpen(title: string): boolean {
	return !!openDropdowns.value[title]
}

function isActive(path?: string): boolean {
	if (!path) return false
	return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
	<nav class="space-y-1 px-3 py-4">
		<template v-for="item in menuItems" :key="item.title">
			<!-- Opción Simple (Sin hijos) -->
			<RouterLink
				v-if="!item.isDropdown"
				:to="item.path!"
				:class="
					isActive(item.path)
						? 'bg-slate-800 text-blue-400 font-semibold'
						: 'text-slate-300'
				"
				class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 hover:text-white rounded-lg transition"
			>
				<span>{{ item.title }}</span>
			</RouterLink>

			<!-- Opción con Submenú (Dropdown) -->
			<div v-else class="space-y-1">
				<button
					@click="toggleDropdown(item.title)"
					class="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition cursor-pointer"
				>
					<span>{{ item.title }}</span>
					<svg
						class="w-4 h-4 transition-transform duration-200"
						:class="{ 'rotate-180': isDropdownOpen(item.title) }"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				<!-- Subítems Anidados -->
				<div v-if="isDropdownOpen(item.title)" class="pl-6 space-y-1">
					<RouterLink
						v-for="child in item.children"
						:key="child.title"
						:to="child.path!"
						:class="
							isActive(child.path)
								? 'bg-slate-800/80 text-blue-400 font-semibold'
								: 'text-slate-400'
						"
						class="block px-3 py-2 text-xs font-medium hover:text-white hover:bg-slate-800/40 rounded-md transition"
					>
						{{ child.title }}
					</RouterLink>
				</div>
			</div>
		</template>
	</nav>
</template>