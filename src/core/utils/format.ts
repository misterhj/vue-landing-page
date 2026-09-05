export function formatPrice(value: number): string {
	return new Intl.NumberFormat('es-PY').format(Math.round(value))
}

export function formatGs(value: number): string {
	return `Gs. ${formatPrice(value)}`
}

export function formatDateTime(value: string): string {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}