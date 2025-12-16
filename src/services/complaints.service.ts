import { axiosWithAuth } from '../api/interceptors';
import { IClient, IPaginatedResponse, IComplaintQueryParams } from '../types/auth.types';

export interface IComplaint {
  id: string;
  branch: string;
  client: string;
  creationDate: string;
  complaintNumber: string;
  complaintType: string;
  status: string;
  confirmation: boolean;
  deadline?: string | null;
  completionDate?: string | null;
  clientTIN: string;
  createdAt?: string;
  updatedAt?: string;
  clientRelation?: IClient;
}

export interface IComplaintMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
}

export interface IComplaintStatusStat {
  status: string;
  count: number;
  confirmedCount: number;
  unconfirmedCount: number;
}

class ComplaintsService {
  private BASE_URL = '/complaints';

  /**
   * Получает Complaint с пагинацией, поиском и сортировкой
   * @param params - параметры запроса (поиск, пагинация, сортировка, фильтры)
   */
  async getPaginated(params?: IComplaintQueryParams): Promise<IPaginatedResponse<IComplaint>> {
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
      if (params?.complaint_type) {
        queryParams.append('complaint_type', params.complaint_type);
      }
      if (params?.confirmation !== undefined) {
        queryParams.append('confirmation', params.confirmation.toString());
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}?${queryParams.toString()}`
        : this.BASE_URL;

      const response = await axiosWithAuth.get<IPaginatedResponse<IComplaint> | IComplaint[]>(url);
      
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
      
      return response.data as IPaginatedResponse<IComplaint>;
    } catch (error: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = error && typeof error === 'object' && 'code' in error && 
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to fetch complaints:', error);
      }
      
      throw error;
    }
  }

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IComplaintMeta> {
    try {
      const response = await axiosWithAuth.get<IComplaintMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по статусам
   */
  async getStatusStats(): Promise<IComplaintStatusStat[]> {
    try {
      const response = await axiosWithAuth.get<IComplaintStatusStat[]>(`${this.BASE_URL}/stats/status`);
      return response.data;
    } catch (error: unknown) {
      // Проверяем различные форматы ошибок Axios
      const isNetworkError = error && typeof error === 'object' && 
        (('code' in error && (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED')) ||
         ('message' in error && typeof error.message === 'string' && 
          (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED'))));
      
      if (!isNetworkError) {
        console.error('Failed to fetch status stats:', error);
      }
      
      throw error;
    }
  }
}

export const complaintsService = new ComplaintsService();

