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
  async sendFinancialComplaint(data: IComplaintEmailData, file?: File) {
    try {
      const recipientEmail = process.env.NEXT_PUBLIC_COMPLAINT_EMAIL || 'claims-3pl@pecom.ru';
      
      // Если есть файл, отправляем через FormData
      if (file) {
        const formData = new FormData();
        formData.append('to', recipientEmail);
        formData.append('subject', `Финансовая претензия от ${data.firstName} ${data.lastName}`);
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('position', data.position);
        formData.append('description', data.description);
        formData.append('file', file);

        const response = await axiosWithAuth.post('/complaints/send-email', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      } else {
        // Без файла отправляем как JSON
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
      }
    } catch (error: unknown) {
      console.error('Failed to send complaint email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при отправке претензии на email: ${errorMessage}`);
    }
  }
}

export const emailService = new EmailService();

