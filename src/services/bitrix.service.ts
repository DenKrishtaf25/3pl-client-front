import { IInventoryRequest } from '../types/inventory.types';

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
          RESPONSIBLE_ID: 668,
          CREATED_BY: 668,
          GROUP_ID: 0
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
}

export const bitrixService = new BitrixService();
