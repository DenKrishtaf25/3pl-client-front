import { axiosWithAuth } from '../api/interceptors';
import { IClient, IPaginatedResponse, IStockQueryParams } from '../types/auth.types';

export interface IStock {
  id: string;
  warehouse: string;
  nomenclature: string;
  article: string;
  quantity: number;
  counterparty?: string;
  clientTIN: string;
  createdAt?: string;
  updatedAt?: string;
  client?: IClient;
}

export interface IStockMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
}

class StockService {
  private BASE_URL = '/stocks';

  /**
   * Получает Stock с пагинацией, поиском и сортировкой
   * @param params - параметры запроса (поиск, пагинация, сортировка, фильтр по клиенту)
   */
  async getPaginated(params?: IStockQueryParams): Promise<IPaginatedResponse<IStock>> {
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
      if (params?.warehouse) {
        queryParams.append('warehouse', params.warehouse);
      }
      if (params?.nomenclature) {
        queryParams.append('nomenclature', params.nomenclature);
      }
      if (params?.article) {
        queryParams.append('article', params.article);
      }
      if (params?.counterparty) {
        queryParams.append('counterparty', params.counterparty);
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await axiosWithAuth.get<IPaginatedResponse<IStock> | IStock[]>(url);
      
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
      
      return response.data as IPaginatedResponse<IStock>;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch stocks:', error);
      }
      
      throw error;
    }
  }

  /**
   * Получает Stock для выбранных клиентов (обратная совместимость)
   * @param clientTINs - массив ИНН клиентов (опционально)
   */
  async getStocks(clientTINs?: string[]) {
    try {
      let url = this.BASE_URL;
      
      if (clientTINs && clientTINs.length > 0) {
        // Формируем параметр clientTIN=1234567890,0987654321
        const tinsParam = clientTINs.join(',');
        url = `${this.BASE_URL}?clientTIN=${tinsParam}`;
      }
      
      const response = await axiosWithAuth.get<IStock[]>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch stocks:', error);
      throw error;
    }
  }

  /**
   * Получает Stock для одного клиента
   */
  async getStocksByTIN(clientTIN: string) {
    const response = await axiosWithAuth.get<IStock[]>(`${this.BASE_URL}?clientTIN=${clientTIN}`);
    return response.data;
  }

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IStockMeta> {
    try {
      const response = await axiosWithAuth.get<IStockMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }
}

export const stockService = new StockService();

