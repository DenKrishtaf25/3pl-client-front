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
      console.log('Creating user with data:', JSON.stringify(data, null, 2))
      console.log('API URL:', this.BASE_URL)
      console.log('sendEmail flag:', data.sendEmail)
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
    try {
      const response = await axiosWithAuth.get<IClient[] | { data: IClient[]; meta?: unknown }>('/admin/clients')
      
      console.log('getClients response:', response.data);
      
      // Если ответ в пагинированном формате { data: [], meta: {} }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        const paginatedResponse = response.data as { data: IClient[]; meta?: unknown };
        if (Array.isArray(paginatedResponse.data)) {
          console.log('Returning paginated data:', paginatedResponse.data.length, 'clients');
          return paginatedResponse.data;
        }
      }
      
      // Если ответ - обычный массив
      if (Array.isArray(response.data)) {
        console.log('Returning array data:', response.data.length, 'clients');
        return response.data;
      }
      
      console.warn('Unexpected response format, returning empty array');
      return [];
    } catch (error) {
      console.error('Error fetching clients in getClients:', error);
      return [];
    }
  }
}

export const adminUserService = new AdminUserService()
