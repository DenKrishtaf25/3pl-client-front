"use client";
import { useEffect, useState } from 'react'
import { userService } from '../services/user.service'

type Role = 'USER' | 'ADMIN'

export function useAuthRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const profile = await userService.getProfile()
        if (!mounted) return
        setRole(profile?.role ?? null)
      } catch (error) {
        if (!mounted) return
        console.error('Failed to get user profile:', error)
        setRole(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return { role, loading }
}


