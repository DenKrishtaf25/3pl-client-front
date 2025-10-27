import { IInventoryRequest } from '../types/inventory.types';

class BitrixService {
  private BASE_URL = 'https://pec3pl.bitrix24.ru/rest/668/up4c52kyrmo5w3zv';
  
  /**
   * Создает заявку на инвентаризацию в Битрикс24 как задачу
   */
  async createInventoryRequest(data: IInventoryRequest) {
    try {
      console.log('Creating inventory request in Bitrix24:', data);
      
      // Подготавливаем данные для Битрикс24 (задача) - с дополнительными полями
      const bitrixData = {
        fields: {
          TITLE: `Заявка на инвентаризацию - ${data.companyName}`,
          DESCRIPTION: this.formatDescription(data),
          RESPONSIBLE_ID: 668, // Исполнитель задачи
          CREATED_BY: 668, // Создатель задачи
          GROUP_ID: 0 // Корневая группа
        }
      };

      console.log('Sending data to Bitrix24:', JSON.stringify(bitrixData, null, 2));

      const response = await fetch(`${this.BASE_URL}/tasks.task.add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Bitrix24 API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }

      const result = await response.json();
      console.log('Bitrix24 response:', result);
      
      if (result.error) {
        throw new Error(`Bitrix24 error: ${result.error_description || result.error}`);
      }

      return result.result;
    } catch (error: any) {
      console.error('Failed to create inventory request in Bitrix24:', error);
      throw new Error(`Ошибка при создании заявки в Битрикс24: ${error.message}`);
    }
  }

  /**
   * Получает список задач из Битрикс24
   */
  async getTasks() {
    try {
      const response = await fetch(`${this.BASE_URL}/tasks.task.list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          select: ['ID', 'TITLE', 'CREATED_DATE', 'STATUS', 'UF_CRM_TASK_INVENTORY_DATE'],
          filter: {
            'UF_CRM_TASK_INVENTORY_DATE': '!=null' // Только заявки на инвентаризацию
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
    } catch (error: any) {
      console.error('Failed to fetch tasks from Bitrix24:', error);
      throw new Error(`Ошибка при получении заявок из Битрикс24: ${error.message}`);
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
