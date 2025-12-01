import * as XLSX from 'xlsx';

/**
 * Экспортирует данные в Excel файл
 * @param data - массив объектов для экспорта
 * @param filename - имя файла (без расширения)
 * @param headers - массив заголовков колонок (опционально)
 */
export function exportToExcel<T extends Record<string, string | number | null | undefined>>(
  data: T[],
  filename: string,
  headers?: { [key: string]: string }
): void {
  if (!data || data.length === 0) {
    alert('Нет данных для экспорта');
    return;
  }

  // Преобразуем данные, заменяя ключи на заголовки если они указаны
  const formattedData = data.map((item) => {
    const formatted: Record<string, string | number | null | undefined> = {};
    Object.keys(item).forEach((key) => {
      const header = headers?.[key] || key;
      formatted[header] = item[key];
    });
    return formatted;
  });

  // Создаем рабочую книгу
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Автоматически подгоняем ширину колонок
  const maxWidth = 50;
  const colWidths = Object.keys(formattedData[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...formattedData.map((row) => {
        const value = row[key];
        return value ? String(value).length : 0;
      })
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  // Сохраняем файл
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

