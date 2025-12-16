import { axiosWithAuth } from '../api/interceptors';

export interface IAnalyticsOrdersChartData {
  date: string; // "YYYY-MM-DD"
  quantityByPlannedDate: number; // По плановой дате
  quantityByActualDate: number; // По фактической дате
}

export interface IAvailableClient {
  TIN: string;
  companyName: string;
}

export interface IAnalyticsOrdersChartResponse {
  data: IAnalyticsOrdersChartData[];
  defaultClientTIN: string;
  availableClients: IAvailableClient[];
  lastImportAt: string; // ISO date string
}

export interface IAnalyticsOrdersMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
}

export interface IAnalyticsOrdersChartParams {
  clientTIN?: string; // Может быть несколько через запятую
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
}

class AnalyticsOrdersService {
  private BASE_URL = '/analytic-orders';

  /**
   * Получает данные для графика аналитики заказов
   * @param params - параметры запроса (clientTIN, dateFrom, dateTo)
   */
  async getChartData(params?: IAnalyticsOrdersChartParams): Promise<IAnalyticsOrdersChartResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.clientTIN) {
        queryParams.append('clientTIN', params.clientTIN);
      }
      if (params?.dateFrom) {
        queryParams.append('dateFrom', params.dateFrom);
      }
      if (params?.dateTo) {
        queryParams.append('dateTo', params.dateTo);
      }

      const url = queryParams.toString() 
        ? `${this.BASE_URL}/chart?${queryParams.toString()}`
        : `${this.BASE_URL}/chart`;

      const response = await axiosWithAuth.get<IAnalyticsOrdersChartResponse>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch analytics orders chart data:', error);
      throw error;
    }
  }

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IAnalyticsOrdersMeta> {
    try {
      const response = await axiosWithAuth.get<IAnalyticsOrdersMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }
}

export const analyticsOrdersService = new AnalyticsOrdersService();

