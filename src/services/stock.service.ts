import { axiosWithAuth } from '../api/interceptors';

export interface IStock {
  id: string;
  warehouse: string;
  nomenclature: string;
  article: string;
  quantity: number;
  clientTIN: string;
  createdAt?: string;
  updatedAt?: string;
  client?: any;
}

class StockService {
  private BASE_URL = '/stocks';

  /**
   * Получает Stock для выбранных клиентов
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
    } catch (error: any) {
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
}

export const stockService = new StockService();

