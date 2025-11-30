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

      const response = await axiosWithAuth.get<IPaginatedResponse<IRegistry> | IRegistry[]>(url);
      
      // Получаем данные для обработки
      const responseData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as IPaginatedResponse<IRegistry>)?.data;
      
      // Логирование для проверки фильтра по дате
      if (params?.dateField && (params?.dateFrom || params?.dateTo) && responseData && responseData.length > 0) {
        const dateFieldName = params.dateField;
        
        // Функция для получения даты в формате YYYY-MM-DD из любой даты
        const getDateString = (date: Date | string | null): string | null => {
          if (!date) return null;
          const d = typeof date === 'string' ? new Date(date) : date;
          return d.toISOString().split('T')[0];
        };
        
        const dateFromStr = params.dateFrom || null;
        const dateToStr = params.dateTo || null;
        
        console.log('📅 Фильтр по дате:', {
          поле: dateFieldName,
          с: dateFromStr || 'не указано',
          по: dateToStr || 'не указано',
          всего_записей: responseData.length,
        });
        
        // Проверяем ВСЕ записи и выводим детальную информацию
        const allDatesInfo = responseData.map((item: IRegistry, index: number) => {
          const rawValue = item[dateFieldName];
          const itemDateStr = getDateString(rawValue);
          const itemDate = rawValue ? new Date(rawValue) : null;
          const isValid = itemDateStr && (
            (!dateFromStr || itemDateStr >= dateFromStr) && 
            (!dateToStr || itemDateStr <= dateToStr)
          );
          return {
            индекс: index,
            orderNumber: item.orderNumber,
            сырое_значение: rawValue,
            дата_YYYY_MM_DD: itemDateStr || 'нет даты',
            полная_дата_ISO: itemDate ? itemDate.toISOString() : 'нет',
            соответствует: isValid ? '✅' : '❌',
          };
        });
        
        console.log('📋 Все записи с датами:', allDatesInfo);
        
        // Проверяем все записи (сравниваем только даты без времени)
        const invalidDates = responseData.filter((item: IRegistry) => {
          const itemDateStr = getDateString(item[dateFieldName]);
          if (!itemDateStr) return true;
          if (dateFromStr && itemDateStr < dateFromStr) return true;
          if (dateToStr && itemDateStr > dateToStr) return true;
          return false;
        });
        
        if (invalidDates.length > 0) {
          console.warn(`⚠️ Найдено ${invalidDates.length} записей вне диапазона фильтра!`);
          console.warn('Все несоответствующие записи:', invalidDates.map((item: IRegistry) => ({
            orderNumber: item.orderNumber,
            сырое_значение: item[dateFieldName],
            дата_YYYY_MM_DD: getDateString(item[dateFieldName]) || 'нет даты',
            полная_дата_ISO: item[dateFieldName] ? new Date(item[dateFieldName]).toISOString() : 'нет',
          })));
        } else {
          console.log('✅ Все записи соответствуют фильтру по дате');
        }
      }
      
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


