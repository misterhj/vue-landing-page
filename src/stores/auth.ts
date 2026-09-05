import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/core/services/http'
import {
	deleteAdminToken,
	deleteCustomerToken,
	getAdminToken,
	getCustomerToken as getCustomerTokenFromCookie,
	getCustomerName as parseCustomerNameFromToken,
	getUserName as parseUserNameFromToken,
	setAdminToken,
	setCustomerToken as persistCustomerToken,
} from '@/core/utils/cookies'

export interface LoginResponse {
	token: string
	message?: string
}

export interface LoginRequest {
	username: string
	password: string
}

export interface RegisterRequest {
	email: string
	firstName: string
	lastName: string
	username: string
	password: string
	identityDocument?: string
	phoneNumber?: string
}

export interface RegisterResponse {
	message: string
}

function hasWindow(): boolean {
	return typeof window !== 'undefined'
}

function checkAdminToken(): boolean {
	return hasWindow() && (document.cookie.includes('admin-token') || getAdminToken() !== null)
}

function checkCustomerToken(): boolean {
	return hasWindow() && (document.cookie.includes('customer-token') || getCustomerTokenFromCookie() !== null)
}

export const useAuthStore = defineStore('auth', () => {
	const isAuthenticated = ref(checkAdminToken())
	const isCustomerAuthenticated = ref(checkCustomerToken())

	async function login(request: LoginRequest): Promise<LoginResponse> {
		const response = await api.post<LoginResponse>('/auth/login', request)
		if (response.token) {
			setAdminToken(response.token)
			isAuthenticated.value = true
		}
		return response
	}

	async function register(request: RegisterRequest): Promise<RegisterResponse> {
		return api.post<RegisterResponse>('/auth/register', request)
	}

	function logout(): void {
		deleteAdminToken()
		isAuthenticated.value = false
	}

	function getUserName(): string {
		return parseUserNameFromToken(getAdminToken())
	}

	function setCustomerToken(token: string): void {
		persistCustomerToken(token)
		isCustomerAuthenticated.value = true
	}

	function getCustomerToken(): string | null {
		return getCustomerTokenFromCookie()
	}

	function getCustomerName(): string {
		return parseCustomerNameFromToken(getCustomerToken())
	}

	function logoutCustomer(): void {
		deleteCustomerToken()
		isCustomerAuthenticated.value = false
	}

	return {
		isAuthenticated,
		isCustomerAuthenticated,
		login,
		register,
		logout,
		getUserName,
		setCustomerToken,
		getCustomerToken,
		getCustomerName,
		logoutCustomer,
	}
})