export interface ApiError {
	response?: {
		data?: {
			message?: string | string[]
		}
	}
	message?: string
}

export const errorCatch = (error: unknown): string => {
	const err = error as ApiError
	
	const message = err?.response?.data?.message

	return message
		? typeof message === 'object'
			? message[0]
			: message
		: err.message || 'Произошла ошибка'
}
