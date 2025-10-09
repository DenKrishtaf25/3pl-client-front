import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) redirect('/(full-width-pages)/(auth)/signin')

  try {
    const res = await fetch('http://localhost:4200/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) redirect('/(full-width-pages)/(auth)/signin')

    const data = await res.json()
    const role = data?.user?.role

    if (role !== 'ADMIN') redirect('/')
  } catch {
    redirect('/(full-width-pages)/(auth)/signin')
  }

  return <>{children}</>
}


