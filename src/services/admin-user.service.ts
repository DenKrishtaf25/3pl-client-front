import { IUser, IUserCreate, IUserUpdate, IClient } from '@/types/auth.types'
import { axiosWithAuth } from '../api/interceptors'

class AdminUserService {
  private BASE_URL = '/admin/users'

  async getAll() {
    const response = await axiosWithAuth.get<IUser[]>(this.BASE_URL)
    return response.data
  }

  async create(data: IUserCreate) {
    try {
      console.log('Creating user with data:', data)
      console.log('API URL:', this.BASE_URL)
      const response = await axiosWithAuth.post<IUser>(this.BASE_URL, data)
      console.log('User created successfully:', response.data)
      return response.data
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: unknown }; message?: string };
        console.error('Create user error:', apiError.response?.data || apiError.message)
      } else if (error instanceof Error) {
        console.error('Create user error:', error.message)
      }
      console.error('Full error:', error)
      throw error
    }
  }

  async update(id: string, data: IUserUpdate) {
    const response = await axiosWithAuth.put<IUser>(`${this.BASE_URL}/${id}`, data)
    return response.data
  }

  async delete(id: string) {
    const response = await axiosWithAuth.delete(`${this.BASE_URL}/${id}`)
    return response.data
  }

  async getClients() {
    const response = await axiosWithAuth.get<IClient[]>('/admin/clients')
    return response.data
  }
}

export const adminUserService = new AdminUserService()
