import { axiosWithAuth } from '../api/interceptors';
import { IClient, IPaginatedResponse, IFinanceQueryParams } from '../types/auth.types';

export interface IFinance {
  id: string;
  branch: string;
  status: string;
  date: string;
  amount: number;
  orderNumber?: string;
  description?: string;
  clientTIN?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: IClient;
}

export interface IFinanceMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
}

class FinanceService {
  private BASE_URL = '/finance';

  /**
   * Получает Finance с пагинацией, поиском и сортировкой
   * @param params - параметры запроса (поиск, пагинация, сортировка, фильтры)
   */
  async getPaginated(params?: IFinanceQueryParams): Promise<IPaginatedResponse<IFinance>> {
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
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      if (params?.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }
      if (params?.amountFrom) {
        queryParams.append('amountFrom', params.amountFrom.toString());
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await axiosWithAuth.get<IPaginatedResponse<IFinance> | IFinance[]>(url);
      
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
      
      return response.data as IPaginatedResponse<IFinance>;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch finance:', error);
      }
      
      throw error;
    }
  }

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IFinanceMeta> {
    try {
      const response = await axiosWithAuth.get<IFinanceMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }
}

export const financeService = new FinanceService();

