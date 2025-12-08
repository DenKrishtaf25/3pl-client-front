import { axiosWithAuth } from '../api/interceptors';

export interface IAnalyticsChartData {
  date: string; // "YYYY-MM-DD"
  quantityByRequest: number; // По заявке
  quantityByPlan: number; // По плану
  quantityByFact: number; // По факту
  quantityByDeparture: number; // Убытие
}

export interface IAvailableClient {
  TIN: string;
  companyName: string;
}

export interface IAnalyticsChartResponse {
  data: IAnalyticsChartData[];
  defaultClientTIN: string;
  availableClients: IAvailableClient[];
  lastImportAt: string; // ISO date string
}

export interface IAnalyticsMeta {
  lastImportAt: string;
  recordsImported: number;
  recordsUpdated: number;
  recordsDeleted: number;
  recordsSkipped: number;
  errors: number;
}

export interface IAnalyticsChartParams {
  clientTIN?: string; // Может быть несколько через запятую
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
}

class AnalyticsService {
  private BASE_URL = '/analytics';

  /**
   * Получает данные для графика аналитики
   * @param params - параметры запроса (clientTIN, dateFrom, dateTo)
   */
  async getChartData(params?: IAnalyticsChartParams): Promise<IAnalyticsChartResponse> {
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

      const response = await axiosWithAuth.get<IAnalyticsChartResponse>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch analytics chart data:', error);
      throw error;
    }
  }

  /**
   * Получает метаданные последнего импорта
   */
  async getLastImportMeta(): Promise<IAnalyticsMeta> {
    try {
      const response = await axiosWithAuth.get<IAnalyticsMeta>(`${this.BASE_URL}/meta/last-import`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch last import meta:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

