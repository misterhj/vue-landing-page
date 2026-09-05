interface CacheEntry<T> {
	data: T
	savedAt: number
}

function hasWindow(): boolean {
	return typeof window !== 'undefined'
}

export function readCache<T>(key: string, ttlMs: number): T | null {
	if (!hasWindow()) {
		return null
	}
	try {
		const raw = window.localStorage.getItem(key)
		if (!raw) {
			return null
		}
		const entry: CacheEntry<T> = JSON.parse(raw)
		if (!entry || !entry.data || !entry.savedAt) {
			return null
		}
		if (Date.now() - entry.savedAt > ttlMs) {
			window.localStorage.removeItem(key)
			return null
		}
		return entry.data
	} catch {
		return null
	}
}

export function writeCache<T>(key: string, data: T): void {
	if (!hasWindow()) {
		return
	}
	try {
		const entry: CacheEntry<T> = { data, savedAt: Date.now() }
		window.localStorage.setItem(key, JSON.stringify(entry))
	} catch {
		/* almacenamiento no disponible: ignorar */
	}
}

export function removeCache(key: string): void {
	if (!hasWindow()) {
		return
	}
	try {
		window.localStorage.removeItem(key)
	} catch {
		/* ignorar */
	}
}