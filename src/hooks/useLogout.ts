import { useRouter } from 'next/navigation'
import { authService } from '../services/auth.service'
import { useState } from 'react'

export const useLogout = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Даже если logout на сервере не удался, очищаем локальное состояние
    } finally {
      setIsLoading(false)
      router.push('/auth')
    }
  }

  return { logout, isLoading }
}
