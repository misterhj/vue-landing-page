import { environment } from '@/environments/environment'
import { getAdminToken, getCustomerToken } from '@/core/utils/cookies'

const USE_CUSTOMER_TOKEN_HEADER = 'X-Use-Customer-Token'

export interface ApiErrorResponse {
	message?: string
}

interface RequestOptions {
	method?: string
	body?: unknown
	customerToken?: boolean
	params?: Record<string, string | number | boolean | null | undefined>
	headers?: Record<string, string>
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
	const url = new URL(environment.apiUrl + path)
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== '') {
				url.searchParams.set(key, String(value))
			}
		}
	}
	return url.toString()
}

function buildHeaders(options: RequestOptions): Record<string, string> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers ?? {}),
	}

	let token: string | null = null
	if (options.customerToken || headers[USE_CUSTOMER_TOKEN_HEADER]) {
		delete headers[USE_CUSTOMER_TOKEN_HEADER]
		token = getCustomerToken()
	} else {
		token = getAdminToken() ?? getCustomerToken()
	}

	if (token) {
		headers['Authorization'] = `Bearer ${token}`
	}

	return headers
}

function mapError(status: number, path: string, errorBody: ApiErrorResponse | null): Error {
	if (path === '/auth/login' && errorBody?.message) {
		return new Error(errorBody.message)
	}
	if (status === 0) {
		return new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.')
	}
	if (status === 401) {
		return new Error('No autorizado.')
	}
	if (status === 403) {
		return new Error('Sin permisos.')
	}
	if (errorBody?.message) {
		return new Error(errorBody.message)
	}
	return new Error('Ocurrió un error inesperado.')
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const url = buildUrl(path, options.params)

	let response: Response
	try {
		response = await fetch(url, {
			method: options.method ?? 'GET',
			headers: buildHeaders(options),
			body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
		})
	} catch {
		throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté encendido.')
	}

	let bodyText = ''
	try {
		bodyText = await response.text()
	} catch {
		bodyText = ''
	}

	let errorBody: ApiErrorResponse | null = null
	if (!response.ok) {
		if (bodyText) {
			try {
				errorBody = JSON.parse(bodyText) as ApiErrorResponse
			} catch {
				errorBody = null
			}
		}
		throw mapError(response.status, path, errorBody)
	}

	if (!bodyText) {
		return undefined as T
	}
	return JSON.parse(bodyText) as T
}

export const api = {
	get: <T>(path: string, options: Omit<RequestOptions, 'method'> = {}) =>
		request<T>(path, { ...options, method: 'GET' }),
	post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
		request<T>(path, { ...options, method: 'POST', body }),
	put: <T>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
		request<T>(path, { ...options, method: 'PUT', body }),
	delete: <T>(path: string, options: Omit<RequestOptions, 'method'> = {}) =>
		request<T>(path, { ...options, method: 'DELETE' }),
}