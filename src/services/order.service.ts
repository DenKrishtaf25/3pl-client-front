import { axiosWithAuth } from '../api/interceptors';
import { IClient, IPaginatedResponse, IOrderQueryParams } from '../types/auth.types';

export interface IOrder {
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

class OrderService {
  private BASE_URL = '/orders';

  /**
   * Получает Order с пагинацией, поиском и сортировкой
   * @param params - параметры запроса (поиск, пагинация, сортировка, фильтр по клиенту)
   */
  async getPaginated(params?: IOrderQueryParams): Promise<IPaginatedResponse<IOrder>> {
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
      if (params?.dateField) {
        queryParams.append('dateField', params.dateField);
      }
      if (params?.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      if (params?.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await axiosWithAuth.get<IPaginatedResponse<IOrder> | IOrder[]>(url);
      
      // Получаем данные для обработки
      const responseData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as IPaginatedResponse<IOrder>)?.data;
      
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
      
      return response.data as IPaginatedResponse<IOrder>;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch orders:', error);
      }
      
      throw error;
    }
  }

  /**
   * Получает Order для выбранных клиентов (обратная совместимость)
   * @param clientTINs - массив ИНН клиентов (опционально)
   */
  async getOrders(clientTINs: string[] = []) {
    try {
      let url = this.BASE_URL;
      if (clientTINs.length > 0) {
        url += `?clientTIN=${clientTINs.join(',')}`;
      }
      const response = await axiosWithAuth.get<IOrder[]>(url);
      return response.data;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch orders:', error);
      }
      
      throw error;
    }
  }
}

export const orderService = new OrderService();

