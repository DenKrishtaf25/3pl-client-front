import { IAuthForm, IAuthResponse } from '../types/auth.types'
import { axiosClassic } from '../api/interceptors'

import { removeFromStorage, saveTokenStorage } from './auth-token.service'

export const authService = {
	async login(data: IAuthForm) {
		const response = await axiosClassic.post<IAuthResponse>(
			'/auth/login',
			data
		)

		if (response.data.accessToken) saveTokenStorage(response.data.accessToken)

		return response
	},

	async getNewTokens() {
		const response = await axiosClassic.post<IAuthResponse>(
			'/auth/login/access-token'
		)

		if (response.data.accessToken) saveTokenStorage(response.data.accessToken)

		return response
	},

	async logout() {
		const response = await axiosClassic.post<boolean>('/auth/logout')

		removeFromStorage()

		return response
	}
}
