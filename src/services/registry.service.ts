import { axiosWithAuth } from '../api/interceptors';
import { IClient, IPaginatedResponse, IRegistryQueryParams } from '../types/auth.types';

export interface IRegistry {
  id: string;
  branch: string;
  orderType: string;
  orderNumber: string;
  kisNumber: string;
  unloadingDate: string;
  status: string;
  counterparty: string;
  acceptanceDate: string;
  shipmentPlan: string;
  packagesPlanned: number;
  packagesActual: number;
  linesPlanned: number;
  linesActual: number;
  clientTIN: string;
  createdAt?: string;
  updatedAt?: string;
  client?: IClient;
}

class RegistryService {
  private BASE_URL = '/registries';

  /**
   * Получает Registry с пагинацией, поиском и сортировкой
   * @param params - параметры запроса (поиск, пагинация, сортировка, фильтр по клиенту)
   */
  async getPaginated(params?: IRegistryQueryParams): Promise<IPaginatedResponse<IRegistry>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }
      if (params?.clientTIN) {
        queryParams.append('clientTIN', params.clientTIN);
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await axiosWithAuth.get<IPaginatedResponse<IRegistry> | IRegistry[]>(url);
      
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
        };
      }
      
      return response.data as IPaginatedResponse<IRegistry>;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch registries:', error);
      }
      
      throw error;
    }
  }

  /**
   * Получает Registry для выбранных клиентов (обратная совместимость)
   * @param clientTINs - массив ИНН клиентов (опционально)
   */
  async getRegistries(clientTINs: string[] = []) {
    try {
      let url = this.BASE_URL;
      if (clientTINs.length > 0) {
        url += `?clientTIN=${clientTINs.join(',')}`;
      }
      const response = await axiosWithAuth.get<IRegistry[]>(url);
      return response.data;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch registries:', error);
      }
      
      throw error;
    }
  }
}

export const registryService = new RegistryService();


