import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) redirect('/not-found')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) redirect('/not-found')

    const data = await res.json()
    const role = data?.user?.role

    if (role !== 'ADMIN') {
      // Если пользователь не админ, редиректим на 404
      redirect('/not-found')
    }
  } catch {
    redirect('/not-found')
  }

  return <>{children}</>
}


