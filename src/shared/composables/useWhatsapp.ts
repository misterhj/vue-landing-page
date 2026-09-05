import { ref } from 'vue'
import { settingsService } from '@/core/services/domain'

const WHATSAPP_KEY = 'whatsapp:numero'

export function useWhatsAppNumber() {
	const waNumber = ref<string | null>(null)

	async function load(): Promise<void> {
		try {
			const settings = await settingsService.getPublicSettings()
			const setting = settings.find((s) => s.key?.trim().toLowerCase() === WHATSAPP_KEY)
			const digits = setting?.value?.replace(/\D/g, '') ?? ''
			waNumber.value = digits || null
		} catch {
			waNumber.value = null
		}
	}

	function waLink(message: string): string | null {
		if (!waNumber.value) {
			return null
		}
		return `https://wa.me/${waNumber.value}?text=${encodeURIComponent(message)}`
	}

	return { waNumber, load, waLink }
}