import { axiosWithAuth } from '../api/interceptors';

interface IComplaintEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  description: string;
}

class EmailService {
  /**
   * Отправляет финансовую претензию на email
   */
  async sendFinancialComplaint(data: IComplaintEmailData) {
    try {
      const recipientEmail = process.env.NEXT_PUBLIC_COMPLAINT_EMAIL || 'dkrishtaf@mail.ru';
      
      const response = await axiosWithAuth.post('/complaints/send-email', {
        to: recipientEmail,
        subject: `Финансовая претензия от ${data.firstName} ${data.lastName}`,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          position: data.position,
          description: data.description
        }
      });

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to send complaint email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при отправке претензии на email: ${errorMessage}`);
    }
  }
}

export const emailService = new EmailService();

