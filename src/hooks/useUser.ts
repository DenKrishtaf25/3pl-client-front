import { useState, useEffect } from 'react';
import { IUser } from '@/types/auth.types';
import { userService } from '@/services/user.service';

export function useUser() {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getProfile();
        setUser(userData);
        // Сохраняем в localStorage для быстрого доступа
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error: any) {
        console.error('Failed to load user profile:', error);
        setError(error.message || 'Ошибка при загрузке профиля');
        
        // Пытаемся загрузить из localStorage как запасной вариант
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
          }
        } catch (e) {
          console.error('Failed to load user from localStorage:', e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const refetchUser = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getProfile();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
    } catch (error: any) {
      console.error('Failed to refetch user profile:', error);
      setError(error.message || 'Ошибка при загрузке профиля');
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error, refetchUser };
}

