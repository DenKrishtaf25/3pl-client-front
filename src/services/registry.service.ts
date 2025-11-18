import { axiosWithAuth } from '../api/interceptors';
import { IClient } from '../types/auth.types';

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

  async getRegistries(clientTINs: string[] = []) {
    try {
      let url = this.BASE_URL;
      if (clientTINs.length > 0) {
        url += `?clientTIN=${clientTINs.join(',')}`;
      }
      const response = await axiosWithAuth.get<IRegistry[]>(url);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch registries:', error);
      throw error;
    }
  }
}

export const registryService = new RegistryService();


