import { IUser } from '@/types/auth.types';
import { axiosWithAuth } from '../api/interceptors';

interface IProfileResponse {
  user: IUser;
}

class UserService {
  private BASE_URL = '/user';

  async getProfile() {
    const response = await axiosWithAuth.get<IProfileResponse>(`${this.BASE_URL}/profile`);
    return response.data.user;
  }

  async updateProfile(data: Partial<IUser>) {
    const response = await axiosWithAuth.put<IProfileResponse>(`${this.BASE_URL}/profile`, data);
    return response.data.user;
  }
}

export const userService = new UserService();
