interface Environment {
	production: boolean
	apiUrl: string
	hubUrl: string
	googleLoginUrl: string
	facebookLoginUrl: string
}

const development: Environment = {
	production: false,
	// apiUrl: 'http://localhost:8080/api/v1'
	apiUrl: 'http://localhost:5281/api/v1',
	hubUrl: 'http://localhost:5281/hubs',
	googleLoginUrl: 'http://localhost:5281/api/v1/auth/external-login/google',
	facebookLoginUrl: 'http://localhost:5281/api/v1/auth/external-login/facebook',
}

const environments: Record<string, Environment> = {
	development,
	production: {
		production: true,
		apiUrl: 'https://cutestore.runasp.net/api/v1',
		hubUrl: 'https://cutestore.runasp.net/hubs',
		googleLoginUrl: 'https://cutestore.runasp.net/api/v1/auth/external-login/google',
		facebookLoginUrl: 'https://cutestore.runasp.net/api/v1/auth/external-login/facebook',
	},
}

export const environment: Environment = environments[import.meta.env.MODE] ?? development

export const CART_STORAGE_KEY = 'cutestore_cart'
export const CATEGORIES_CACHE_KEY = 'lp_categories_v1'
export const SECTIONS_CACHE_KEY = 'lp_sections_v1'
export const CACHE_TTL_MS = 10 * 60 * 1000
export const ADMIN_TOKEN_COOKIE = 'admin-token'
export const CUSTOMER_TOKEN_COOKIE = 'customer-token'