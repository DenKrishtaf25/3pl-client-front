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
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/auth')
    } finally {
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}
