import { ADMIN_TOKEN_COOKIE, CUSTOMER_TOKEN_COOKIE } from '@/environments/environment'

export function setCookie(name: string, value: string, days: number): void {
	if (typeof document === 'undefined') {
		return
	}
	const date = new Date()
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
	const expires = `expires=${date.toUTCString()}`
	const maxAge = `max-age=${days * 24 * 60 * 60}`
	document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; ${maxAge}; path=/; SameSite=Lax`
}

export function getCookie(name: string): string | null {
	if (typeof document === 'undefined') {
		return null
	}
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
	return match ? decodeURIComponent(match[1] as string) : null
}

export function deleteCookie(name: string): void {
	if (typeof document === 'undefined') {
		return
	}
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export function getAdminToken(): string | null {
	return getCookie(ADMIN_TOKEN_COOKIE)
}

export function getCustomerToken(): string | null {
	return getCookie(CUSTOMER_TOKEN_COOKIE)
}

export function setAdminToken(token: string): void {
	setCookie(ADMIN_TOKEN_COOKIE, token, 7)
}

export function setCustomerToken(token: string): void {
	setCookie(CUSTOMER_TOKEN_COOKIE, token, 7)
}

export function deleteAdminToken(): void {
	deleteCookie(ADMIN_TOKEN_COOKIE)
}

export function deleteCustomerToken(): void {
	deleteCookie(CUSTOMER_TOKEN_COOKIE)
}

function decodeJwtPayload<T>(token: string): T | null {
	try {
		const payload = token.split('.')[1]
		if (!payload) {
			return null
		}
		const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
		return JSON.parse(atob(normalized)) as T
	} catch {
		return null
	}
}

const NAME_CLAIMS = [
	'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
	'unique_name',
	'sub',
]

const EMAIL_CLAIMS = [
	'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
	'email',
	'sub',
]

function extractClaim<T = unknown>(payload: Record<string, unknown> | null, claims: string[]): T | null {
	if (!payload) {
		return null
	}
	for (const claim of claims) {
		const value = payload[claim]
		if (value !== undefined && value !== null) {
			return value as T
		}
	}
	return null
}

export function getUserName(token: string | null): string {
	if (!token) {
		return 'Admin'
	}
	const payload = decodeJwtPayload<Record<string, unknown>>(token)
	return extractClaim<string>(payload, NAME_CLAIMS) ?? 'Admin'
}

export function getCustomerName(token: string | null): string {
	if (!token) {
		return ''
	}
	const payload = decodeJwtPayload<Record<string, unknown>>(token)
	return extractClaim<string>(payload, NAME_CLAIMS) ?? extractClaim<string>(payload, EMAIL_CLAIMS) ?? ''
}