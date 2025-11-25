import { IClient, IClientCreate, IClientUpdate, IPaginatedResponse, IClientQueryParams } from '@/types/auth.types'
import { axiosWithAuth } from '../api/interceptors'

class AdminClientService {
  private BASE_URL = '/admin/clients'

  async getAll() {
    const response = await axiosWithAuth.get<IClient[]>(this.BASE_URL)
    return response.data
  }

  async getPaginated(params?: IClientQueryParams): Promise<IPaginatedResponse<IClient>> {
    const queryParams = new URLSearchParams()
    
    if (params?.search) {
      queryParams.append('search', params.search)
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy)
    }
    if (params?.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder)
    }

    const url = queryParams.toString() 
      ? `${this.BASE_URL}?${queryParams.toString()}`
      : this.BASE_URL

    const response = await axiosWithAuth.get<IPaginatedResponse<IClient> | IClient[]>(url)
    
    // Если ответ - массив (старый формат), преобразуем в пагинированный формат
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: {
          total: response.data.length,
          page: params?.page || 1,
          limit: params?.limit || response.data.length,
          totalPages: 1
        }
      }
    }
    
    return response.data as IPaginatedResponse<IClient>
  }

  async create(data: IClientCreate) {
    try {
      console.log('Creating client with data:', data)
      console.log('API URL:', this.BASE_URL)
      const response = await axiosWithAuth.post<IClient>(this.BASE_URL, data)
      console.log('Client created successfully:', response.data)
      return response.data
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: unknown }; message?: string };
        console.error('Create client error:', apiError.response?.data || apiError.message)
      } else if (error instanceof Error) {
        console.error('Create client error:', error.message)
      }
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
