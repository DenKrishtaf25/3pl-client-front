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
  vehicleNumber?: string;
  driverName?: string;
  processingType?: string;
  departureDate?: string;
  clientTIN: string;
  createdAt?: string;
  updatedAt?: string;
  client?: IClient;
}

export interface IRegistryMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
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
      // Новые фильтры по датам
      if (params?.shipmentPlanFrom) {
        queryParams.append('shipmentPlanFrom', params.shipmentPlanFrom);
      }
      if (params?.shipmentPlanTo) {
        queryParams.append('shipmentPlanTo', params.shipmentPlanTo);
      }
      if (params?.unloadingDateFrom) {
        queryParams.append('unloadingDateFrom', params.unloadingDateFrom);
      }
      if (params?.unloadingDateTo) {
        queryParams.append('unloadingDateTo', params.unloadingDateTo);
      }
      if (params?.departureDateFrom) {
        queryParams.append('departureDateFrom', params.departureDateFrom);
      }
      if (params?.departureDateTo) {
        queryParams.append('departureDateTo', params.departureDateTo);
      }
      if (params?.branch) {
        queryParams.append('branch', params.branch);
      }
      if (params?.counterparty) {
        queryParams.append('counterparty', params.counterparty);
      }
      if (params?.vehicleNumber) {
        queryParams.append('vehicleNumber', params.vehicleNumber);
      }
      if (params?.driverName) {
        queryParams.append('driverName', params.driverName);
      }
      if (params?.orderNumber) {
        queryParams.append('orderNumber', params.orderNumber);
      }
      if (params?.orderType) {
        queryParams.append('orderType', params.orderType);
      }
      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.processingType) {
        queryParams.append('processingType', params.processingType);
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

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IRegistryMeta> {
    try {
      const response = await axiosWithAuth.get<IRegistryMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }
}

export const registryService = new RegistryService();


