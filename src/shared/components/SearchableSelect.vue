<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface SelectOption {
	id?: number | string
	name: string
}

const props = withDefaults(
	defineProps<{
		modelValue: number | string | null | undefined
		options: SelectOption[]
		placeholder?: string
		disabled?: boolean
	}>(),
	{
		placeholder: 'Seleccionar...',
		disabled: false,
	},
)

const emit = defineEmits<{
	'update:modelValue': [value: number | string | null]
	search: [term: string]
}>()

const rootEl = ref<HTMLDivElement | null>(null)
const dropdownEl = ref<HTMLDivElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

const isOpen = ref(false)
const searchTerm = ref('')
const focusedIndex = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | undefined

const filteredOptions = computed<SelectOption[]>(() => {
	const term = searchTerm.value.toLowerCase().trim()
	if (!term) return props.options
	return props.options.filter((opt) => String(opt.name).toLowerCase().includes(term))
})

const selectedLabel = computed<string>(() => {
	const found = props.options.find((opt) => opt.id === props.modelValue)
	return found ? found.name : ''
})

const isSelected = (opt: SelectOption): boolean => opt.id === props.modelValue

function emitSearch(term: string): void {
	clearTimeout(debounceTimer)
	debounceTimer = setTimeout(() => emit('search', term), 300)
}

function onFocus(): void {
	if (props.disabled) return
	searchTerm.value = ''
	focusedIndex.value = -1
	isOpen.value = true
	emitSearch('')
}

function onInput(event: Event): void {
	const value = (event.target as HTMLInputElement).value
	searchTerm.value = value
	focusedIndex.value = 0
	if (!isOpen.value) isOpen.value = true
	emitSearch(value)
}

function toggleOpen(event: MouseEvent): void {
	event.stopPropagation()
	if (props.disabled) return
	if (isOpen.value) {
		isOpen.value = false
	} else {
		searchTerm.value = ''
		focusedIndex.value = -1
		isOpen.value = true
		emitSearch('')
	}
}

function selectOption(option: SelectOption | null): void {
	const value = option ? option.id : null
	emit('update:modelValue', value ?? null)
	isOpen.value = false
	searchTerm.value = ''
	focusedIndex.value = -1
}

function scrollToFocused(): void {
	setTimeout(() => {
		if (!dropdownEl.value) return
		const targetId = focusedIndex.value === -1 ? 'opt-null' : `opt-${focusedIndex.value}`
		const element = dropdownEl.value.querySelector(`#${targetId}`)
		if (element) {
			element.scrollIntoView({ block: 'nearest' })
		}
	}, 0)
}

function onKeyDown(event: KeyboardEvent): void {
	if (!isOpen.value) {
		if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
			isOpen.value = true
			event.preventDefault()
		}
		return
	}

	const total = filteredOptions.value.length

	switch (event.key) {
		case 'ArrowDown':
			event.preventDefault()
			if (focusedIndex.value < total - 1) {
				focusedIndex.value += 1
				scrollToFocused()
			}
			break
		case 'ArrowUp':
			event.preventDefault()
			if (focusedIndex.value > -1) {
				focusedIndex.value -= 1
				scrollToFocused()
			}
			break
		case 'Enter':
			event.preventDefault()
			if (focusedIndex.value === -1) {
				selectOption(null)
			} else if (focusedIndex.value >= 0 && focusedIndex.value < total) {
				selectOption(filteredOptions.value[focusedIndex.value] ?? null)
			}
			break
		case 'Escape':
		case 'Tab':
			isOpen.value = false
			break
	}
}

function onClickOutside(event: MouseEvent): void {
	if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
		isOpen.value = false
	}
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => {
	document.removeEventListener('click', onClickOutside)
	clearTimeout(debounceTimer)
})
</script>

<template>
	<div ref="rootEl" class="relative w-full">
		<div class="relative flex items-center">
			<input
				ref="searchInput"
				type="text"
				:placeholder="placeholder"
				:value="isOpen ? searchTerm : selectedLabel"
				:disabled="disabled"
				@focus="onFocus"
				@input="onInput"
				@keydown="onKeyDown"
				class="w-full px-3 py-2 pr-8 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
			/>

			<button
				type="button"
				tabindex="-1"
				:disabled="disabled"
				@click.prevent="toggleOpen"
				class="absolute right-2 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
			>
				<svg
					class="w-4 h-4 transition-transform duration-200"
					:class="{ 'rotate-180': isOpen }"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</div>

		<div
			v-if="isOpen"
			ref="dropdownEl"
			class="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-52 overflow-y-auto left-0"
		>
			<!-- Opción Sin seleccionar -->
			<div
				id="opt-null"
				@click="selectOption(null)"
				:class="focusedIndex === -1 ? 'bg-slate-700' : ''"
				class="px-3 py-2 text-xs text-slate-400 hover:bg-slate-700/60 cursor-pointer border-b border-slate-700/50 transition-colors"
			>
				-- Sin seleccionar --
			</div>

			<!-- Lista de Opciones -->
			<div
				v-for="(opt, i) in filteredOptions"
				:id="`opt-${i}`"
				:key="`${opt.id ?? i}`"
				@click="selectOption(opt)"
				:class="{
					'bg-slate-700': focusedIndex === i && !isSelected(opt),
					'bg-blue-600/30': isSelected(opt),
					'text-blue-400': isSelected(opt),
				}"
				class="px-3 py-2 text-sm text-white hover:bg-slate-700 cursor-pointer flex items-center justify-between transition-colors"
			>
				<span>{{ opt.name }}</span>
				<span v-if="isSelected(opt)" class="text-blue-400 text-xs font-bold">✓</span>
			</div>

			<div v-if="filteredOptions.length === 0" class="px-3 py-2 text-xs text-slate-500 text-center">
				No se encontraron resultados
			</div>
		</div>
	</div>
</template>