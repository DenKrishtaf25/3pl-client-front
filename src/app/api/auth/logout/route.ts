import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		// Получаем access token из cookies
		const accessToken = request.cookies.get('accessToken')?.value

		if (!accessToken) {
			return NextResponse.json(
				{ success: false, message: 'No access token found' },
				{ status: 401 }
			)
		}

		// Делаем запрос к внешнему API для logout
		const response = await fetch('http://localhost:4200/api/auth/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})

		const data = await response.json()

		// Создаем ответ с удалением cookie
		const nextResponse = NextResponse.json(data, { status: response.status })
		
		// Удаляем access token cookie
		nextResponse.cookies.delete('accessToken')

		return nextResponse
	} catch (error) {
		console.error('Logout error:', error)
		return NextResponse.json(
			{ success: false, message: 'Internal server error' },
			{ status: 500 }
		)
	}
}
