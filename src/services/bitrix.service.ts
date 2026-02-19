import { IInventoryRequest } from '../types/inventory.types';

interface BitrixTaskData {
  fields: {
    TITLE: string;
    DESCRIPTION: string;
    RESPONSIBLE_ID?: number;
    CREATED_BY?: number;
    GROUP_ID: number;
    UF_TASK_WEBDAV_FILES?: number[];
  };
}

class BitrixService {
  private BASE_URL = 'https://pec3pl.bitrix24.ru/rest/668/up4c52kyrmo5w3zv';
  
  /**
   * Создает заявку на инвентаризацию в Битрикс24 как задачу
   */
  async createInventoryRequest(data: IInventoryRequest) {
    try {
      // Подготавливаем данные для Битрикс24 (задача)
      const bitrixData = {
        fields: {
          TITLE: `Заявка на инвентаризацию - ${data.companyName}`,
          DESCRIPTION: this.formatDescription(data),
          RESPONSIBLE_ID: 11,
          CREATED_BY: 668,
          GROUP_ID: 115 // Группа для задач инвентаризации
        }
      };

      const response = await fetch(`${this.BASE_URL}/tasks.task.add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: unknown) {
      console.error('Failed to create inventory request in Bitrix24:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при создании заявки в Битрикс24: ${errorMessage}`);
    }
  }

  /**
   * Получает список задач текущего пользователя из Битрикс24
   */
  async getTasks() {
    try {
      const response = await fetch(`${this.BASE_URL}/tasks.task.list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          select: ['ID', 'TITLE', 'CREATED_DATE', 'STATUS', 'DESCRIPTION', 'RESPONSIBLE_ID', 'CREATED_BY'],
          order: {
            'CREATED_DATE': 'DESC'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: unknown) {
      console.error('Failed to fetch tasks from Bitrix24:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при получении заявок из Битрикс24: ${errorMessage}`);
    }
  }

  /**
   * Получает все задачи из Битрикс24 (для тестирования)
   */
  async getAllTasks() {
    try {
      const response = await fetch(`${this.BASE_URL}/tasks.task.list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          select: ['ID', 'TITLE', 'CREATED_DATE', 'STATUS', 'DESCRIPTION', 'RESPONSIBLE_ID', 'CREATED_BY'],
          order: {
            'CREATED_DATE': 'DESC'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: unknown) {
      console.error('Failed to fetch all tasks from Bitrix24:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при получении всех задач из Битрикс24: ${errorMessage}`);
    }
  }

  /**
   * Создает финансовую претензию в Битрикс24 как задачу
   */
  async createFinancialComplaint(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    description: string;
    file?: File;
  }) {
    try {
      let fileId: number | undefined;

      // Если есть файл, сначала загружаем его
      if (data.file) {
        fileId = await this.uploadFile(data.file);
      }

      // Подготавливаем данные для Битрикс24 (задача)
      const bitrixData: BitrixTaskData = {
        fields: {
          TITLE: `Финансовая претензия - ${data.firstName} ${data.lastName}`,
          DESCRIPTION: this.formatComplaintDescription(data),
          RESPONSIBLE_ID: 11,
          CREATED_BY: 668,
          GROUP_ID: 115, // Группа для задач претензий
          ...(fileId && { UF_TASK_WEBDAV_FILES: [fileId] })
        }
      };

      const response = await fetch(`${this.BASE_URL}/tasks.task.add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: unknown) {
      console.error('Failed to create financial complaint in Bitrix24:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при создании претензии в Битрикс24: ${errorMessage}`);
    }
  }

  /**
   * Загружает файл в Битрикс24 и возвращает его ID
   */
  private async uploadFile(file: File): Promise<number> {
    try {
      // Конвертируем файл в base64
      const base64 = await this.fileToBase64(file);

      // Загружаем файл в Битрикс24
      const response = await fetch(`${this.BASE_URL}/disk.folder.uploadfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'shared_files', // Папка для общих файлов
          data: {
            NAME: file.name
          },
          fileContent: base64
        })
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result.ID;
    } catch (error: unknown) {
      console.error('Failed to upload file to Bitrix24:', error);
      // Если не удалось загрузить файл, продолжаем без него
      console.warn('Продолжаем создание претензии без файла');
      throw error;
    }
  }

  /**
   * Конвертирует файл в base64 строку
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // Убираем префикс data:...
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Форматирует описание заявки для Битрикс24
   */
  private formatDescription(data: IInventoryRequest): string {
    return `
Заявка на проведение инвентаризации

Компания: ${data.companyName}
ИНН: ${data.tin}
Дата инвентаризации: ${new Date(data.inventoryDate).toLocaleDateString('ru-RU')}
Склад: ${data.warehouse}

Контактная информация:
Контактное лицо: ${data.contactPerson}
Телефон: ${data.phone}
Email: ${data.email}

${data.comment ? `Комментарий: ${data.comment}` : ''}

Создано через веб-интерфейс ПЭК 3PL
    `.trim();
  }

  /**
   * Форматирует описание финансовой претензии для Битрикс24
   */
  private formatComplaintDescription(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    description: string;
  }): string {
    return `
Финансовая претензия

Данные отправителя:
Имя: ${data.firstName}
Фамилия: ${data.lastName}
Должность: ${data.position}
Почта: ${data.email}
Телефон: ${data.phone}

Описание претензии:
${data.description}

Создано через веб-интерфейс ПЭК 3PL
    `.trim();
  }

  /**
   * Создает задачу в Битрикс24 с данными для отправки письма новому пользователю
   */
  async createUserCreationTask(data: {
    email: string;
    name: string;
    login: string;
    password: string;
  }) {
    try {
      // Форматируем описание с данными пользователя
      const description = this.formatUserCreationDescription(data);

      // Подготавливаем данные для Битрикс24 (задача)
      const bitrixData: BitrixTaskData = {
        fields: {
          TITLE: `Создание пользователя - ${data.name || data.email}`,
          DESCRIPTION: description,
          RESPONSIBLE_ID: 668,
          CREATED_BY: 668,
          GROUP_ID: 196 // Группа для задач создания пользователей
        }
      };

      const response = await fetch(`${this.BASE_URL}/tasks.task.add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      if (!response.ok) {
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: unknown) {
      console.error('Failed to create user creation task in Bitrix24:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      throw new Error(`Ошибка при создании задачи в Битрикс24: ${errorMessage}`);
    }
  }

  /**
   * Форматирует описание задачи создания пользователя для Битрикс24
   */
  private formatUserCreationDescription(data: {
    email: string;
    name: string;
    login: string;
    password: string;
  }): string {
    return `
Данные для отправки письма новому пользователю

${data.email}
${data.name}
${data.login}
${data.password}

Создано через веб-интерфейс ПЭК 3PL
    `.trim();
  }
}

export const bitrixService = new BitrixService();
