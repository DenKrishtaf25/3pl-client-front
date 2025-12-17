import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminShell from '@/layout/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    redirect('/not-found')
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      redirect('/not-found')
    }

    const data = await res.json()
    
    // Валидация данных ответа
    if (!data || typeof data !== 'object' || !data.user) {
      redirect('/not-found')
    }

    const role = data?.user?.role

    if (role !== 'ADMIN') {
      // Если пользователь не админ, редиректим на 404
      redirect('/not-found')
    }
  } catch (error) {
    // Логируем ошибку только в development режиме
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin layout error:', error)
    }
    redirect('/not-found')
  }

  return <AdminShell>{children}</AdminShell>
}


