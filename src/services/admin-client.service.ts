import { IClient, IClientCreate, IClientUpdate } from '@/types/auth.types'
import { axiosWithAuth } from '../api/interceptors'

class AdminClientService {
  private BASE_URL = '/admin/clients'

  async getAll() {
    const response = await axiosWithAuth.get<IClient[]>(this.BASE_URL)
    return response.data
  }

  async create(data: IClientCreate) {
    try {
      console.log('Creating client with data:', data)
      console.log('API URL:', this.BASE_URL)
      const response = await axiosWithAuth.post<IClient>(this.BASE_URL, data)
      console.log('Client created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Create client error:', error.response?.data || error.message)
      console.error('Full error:', error)
      throw error
    }
  }

  async update(id: string, data: IClientUpdate) {
    const response = await axiosWithAuth.put<IClient>(`${this.BASE_URL}/${id}`, data)
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

export const adminClientService = new AdminClientService()
