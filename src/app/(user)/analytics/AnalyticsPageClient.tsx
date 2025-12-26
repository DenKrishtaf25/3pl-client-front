"use client";
import React, { useState, useEffect, useCallback } from "react";
import LineChartOne1, { IChartDataPoint } from "@/components/charts/line/LineChartOne1";
import LineChartOrders, { IOrdersChartDataPoint } from "@/components/charts/line/LineChartOrders";
import ComponentCard from "@/components/common/ComponentCard";
import { analyticsService, IAvailableClient } from "@/services/analytics.service";
import { analyticsOrdersService } from "@/services/analytics-orders.service";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { CheckLineIcon, ChevronDownIcon } from "@/icons";

export default function AnalyticsPageClient() {
  const [chartData, setChartData] = useState<IChartDataPoint[]>([]);
  const [ordersChartData, setOrdersChartData] = useState<IOrdersChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [availableClients, setAvailableClients] = useState<IAvailableClient[]>([]);
  const [selectedClientTINs, setSelectedClientTINs] = useState<string[]>([]);
  const [lastImportAt, setLastImportAt] = useState<string | null>(null);
  const [ordersLastImportAt, setOrdersLastImportAt] = useState<string | null>(null);
  
  // UI состояния
  const [isClientsDropdownOpen, setIsClientsDropdownOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  // Загрузка данных для ТС
  const loadChartData = useCallback(async (clientTINs?: string[], skipAutoSelect = false) => {
    try {
      setLoading(true);
      setError(null);

      // Если явно передан пустой массив клиентов (skipAutoSelect = true), очищаем данные
      if (skipAutoSelect && (!clientTINs || clientTINs.length === 0)) {
        setChartData([]);
        setLoading(false);
        return;
      }

      const params: {
        clientTIN?: string;
      } = {};

      if (clientTINs && clientTINs.length > 0) {
        params.clientTIN = clientTINs.join(',');
      }

      const response = await analyticsService.getChartData(params);
      
      setChartData(response.data);
      setAvailableClients(response.availableClients);
      setLastImportAt(response.lastImportAt);

      // Если клиенты не выбраны и не пропущена авто-выборка, выбираем всех доступных клиентов по умолчанию
      if (!skipAutoSelect && (!clientTINs || clientTINs.length === 0)) {
        const allClientTINs = response.availableClients.map(c => c.TIN);
        setSelectedClientTINs(allClientTINs);
        // Перезагружаем данные с выбранными клиентами
        if (allClientTINs.length > 0) {
          const paramsWithClients: { clientTIN?: string } = {
            clientTIN: allClientTINs.join(',')
          };
          const responseWithClients = await analyticsService.getChartData(paramsWithClients);
          setChartData(responseWithClients.data);
        }
      } else if (clientTINs && clientTINs.length > 0) {
        // Обновляем выбранные клиенты, если они были переданы
        setSelectedClientTINs(clientTINs);
      }
    } catch (err: unknown) {
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      if (!isNetworkError) {
        console.error('Failed to load chart data:', err);
      }
      
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка данных для заказов
  const loadOrdersChartData = useCallback(async (clientTINs?: string[], skipAutoSelect = false) => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      // Если явно передан пустой массив клиентов (skipAutoSelect = true), очищаем данные
      if (skipAutoSelect && (!clientTINs || clientTINs.length === 0)) {
        setOrdersChartData([]);
        setOrdersLoading(false);
        return;
      }

      const params: {
        clientTIN?: string;
      } = {};

      if (clientTINs && clientTINs.length > 0) {
        params.clientTIN = clientTINs.join(',');
      }

      const response = await analyticsOrdersService.getChartData(params);
      
      // Преобразуем данные из формата API в формат компонента графика
      const transformedData: IOrdersChartDataPoint[] = response.data.map(item => ({
        date: item.date,
        quantityByPlannedDate: item.quantityByPlannedDate,
        quantityByActualDate: item.quantityByActualDate,
      }));
      
      setOrdersChartData(transformedData);
      setOrdersLastImportAt(response.lastImportAt);

      // Если клиенты не выбраны и не пропущена авто-выборка, перезагружаем данные с выбранными клиентами
      if (!skipAutoSelect && (!clientTINs || clientTINs.length === 0) && response.availableClients && response.availableClients.length > 0) {
        const allClientTINs = response.availableClients.map(c => c.TIN);
        // Перезагружаем данные с выбранными клиентами
        if (allClientTINs.length > 0) {
          const paramsWithClients: { clientTIN?: string } = {
            clientTIN: allClientTINs.join(',')
          };
          const responseWithClients = await analyticsOrdersService.getChartData(paramsWithClients);
          const transformedDataWithClients: IOrdersChartDataPoint[] = responseWithClients.data.map(item => ({
            date: item.date,
            quantityByPlannedDate: item.quantityByPlannedDate,
            quantityByActualDate: item.quantityByActualDate,
          }));
          setOrdersChartData(transformedDataWithClients);
        }
      }
    } catch (err: unknown) {
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      if (!isNetworkError) {
        console.error('Failed to load orders chart data:', err);
      }
      
      if (isNetworkError) {
        setOrdersError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setOrdersError('Ошибка при загрузке данных заказов');
      }
      
      setOrdersChartData([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Первоначальная загрузка
  useEffect(() => {
    loadChartData();
    loadOrdersChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обработчик зума - не загружает новые данные, так как все данные уже загружены
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleZoom = useCallback((_dateFrom: string, _dateTo: string) => {
    // При зуме не загружаем новые данные, так как все данные уже загружены
    // ApexCharts сам обрабатывает зум на уже загруженных данных
    // Параметры _dateFrom и _dateTo не используются, но нужны для совместимости с LineChartOne1
  }, []);

  // Переключение выбора клиента
  const toggleClient = (clientTIN: string) => {
    setSelectedClientTINs(prev => {
      const isSelected = prev.includes(clientTIN);
      const allSelected = availableClients.length > 0 && prev.length === availableClients.length;
      let newSelected: string[];
      
      // Если все клиенты выбраны и пользователь кликает на одного, выбираем только этого клиента
      if (allSelected && isSelected) {
        newSelected = [clientTIN];
      } else if (isSelected) {
        // Если снимаем выбор и не все выбраны, убираем клиента
        newSelected = prev.filter(tin => tin !== clientTIN);
      } else {
        // При добавлении нового клиента просто добавляем его
        newSelected = [...prev, clientTIN];
      }
      
      // Загружаем данные с новыми клиентами для обоих графиков
      // Используем skipAutoSelect=true, чтобы не сбрасывать выбор после загрузки
      // Передаем пустой массив явно, чтобы очистить данные при снятии выбора
      loadChartData(newSelected.length > 0 ? newSelected : [], true);
      loadOrdersChartData(newSelected.length > 0 ? newSelected : [], true);
      
      return newSelected;
    });
  };

  // Выбор/снятие выбора всех клиентов
  const toggleAllClients = () => {
    const allSelected = availableClients.length > 0 && selectedClientTINs.length === availableClients.length;
    let newSelected: string[];
    
    if (allSelected) {
      // Если все выбраны, снимаем выбор со всех
      newSelected = [];
    } else {
      // Если не все выбраны, выбираем всех
      newSelected = availableClients.map(c => c.TIN);
    }
    
    setSelectedClientTINs(newSelected);
    
    // Загружаем данные с новыми клиентами для обоих графиков
    // Используем skipAutoSelect=true, чтобы не сбрасывать выбор после загрузки
    // Передаем пустой массив явно, чтобы очистить данные при снятии выбора
    loadChartData(newSelected.length > 0 ? newSelected : [], true);
    loadOrdersChartData(newSelected.length > 0 ? newSelected : [], true);
  };

  // Фильтрация клиентов по поисковому запросу
  const filteredClients = availableClients.filter(client => {
    if (!clientSearchQuery) return true;
    const query = clientSearchQuery.toLowerCase();
    return (
      client.companyName.toLowerCase().includes(query) ||
      client.TIN.toLowerCase().includes(query)
    );
  });

  // Проверка, выбраны ли все клиенты
  const allClientsSelected = availableClients.length > 0 && selectedClientTINs.length === availableClients.length;

  // Форматирование даты последнего обновления
  const formatLastImportDate = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading && chartData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и информация */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Фильтр по клиентам */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <button
                onClick={() => setIsClientsDropdownOpen(!isClientsDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-sm">
                  {selectedClientTINs.length === 0
                    ? "Выберите клиентов"
                    : allClientsSelected
                    ? "Все клиенты"
                    : selectedClientTINs.length === 1
                    ? availableClients.find(c => c.TIN === selectedClientTINs[0])?.companyName || "Клиент"
                    : `Выбрано: ${selectedClientTINs.length}`}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isClientsDropdownOpen && (
                <Dropdown
                  isOpen={isClientsDropdownOpen}
                  onClose={() => {
                    setIsClientsDropdownOpen(false);
                    setClientSearchQuery("");
                  }}
                  className="mt-2 min-w-[300px] left-0"
                >
                  {/* Поиск клиентов */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                    <input
                      type="text"
                      placeholder="Поиск по имени или ИНН..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {/* Чекбокс "Все клиенты" */}
                  <DropdownItem
                    onClick={() => {
                      toggleAllClients();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {allClientsSelected && (
                        <CheckLineIcon className="w-4 h-4 text-blue-500" />
                      )}
                      {!allClientsSelected && (
                        <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded" />
                      )}
                      <span className="font-medium">Все клиенты</span>
                    </div>
                  </DropdownItem>
                  
                  {/* Разделитель */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  {/* Список клиентов */}
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <DropdownItem
                        key={client.TIN}
                        onClick={() => {
                          toggleClient(client.TIN);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {selectedClientTINs.includes(client.TIN) && (
                            <CheckLineIcon className="w-4 h-4 text-blue-500" />
                          )}
                          {!selectedClientTINs.includes(client.TIN) && (
                            <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded" />
                          )}
                          <span>{client.companyName}</span>
                          <span className="text-xs text-gray-500">({client.TIN})</span>
                        </div>
                      </DropdownItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Клиенты не найдены
                    </div>
                  )}
                </Dropdown>
              )}
            </div>

            {/* Фильтры по датам */}
            {/* <div className="flex gap-2 items-center">
              <div className="relative">
                <DatePicker
                  selected={dateFrom}
                  onChange={(date) => setDateFrom(date)}
                  selectsStart
                  startDate={dateFrom}
                  endDate={dateTo}
                  placeholderText="Дата от"
                  dateFormat="dd.MM.yyyy"
                  locale={ru}
                  className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-full sm:w-auto"
                  open={isDateFromOpen}
                  onInputClick={() => setIsDateFromOpen(true)}
                  onClickOutside={() => setIsDateFromOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setIsDateFromOpen(!isDateFromOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
              </div>
              <span className="text-gray-500">—</span>
              <div className="relative">
                <DatePicker
                  selected={dateTo}
                  onChange={(date) => setDateTo(date)}
                  selectsEnd
                  startDate={dateFrom}
                  endDate={dateTo}
                  minDate={dateFrom || undefined}
                  placeholderText="Дата до"
                  dateFormat="dd.MM.yyyy"
                  locale={ru}
                  className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-full sm:w-auto"
                  open={isDateToOpen}
                  onInputClick={() => setIsDateToOpen(true)}
                  onClickOutside={() => setIsDateToOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => setIsDateToOpen(!isDateToOpen)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <CalendarDays className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={applyDateFilters}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Применить
              </button>
              {(dateFrom || dateTo) && (
                <button
                  onClick={resetDateFilters}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  Сбросить
                </button>
              )}
            </div> */}
          </div>

          {/* Дата последнего обновления */}
          <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
            {lastImportAt && (
              <div>
                ТС - Последнее обновление: {formatLastImportDate(lastImportAt)}
              </div>
            )}
            {ordersLastImportAt && (
              <div>
                Заказы - Последнее обновление: {formatLastImportDate(ordersLastImportAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">ТС: {error}</p>
        </div>
      )}
      {ordersError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">Заказы: {ordersError}</p>
        </div>
      )}

      {/* Графики */}
      <ComponentCard title="Количество ТС">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Нет данных для отображения
          </div>
        ) : (
          <LineChartOne1 data={chartData} onZoom={handleZoom} />
        )}
      </ComponentCard>

      <ComponentCard title="Количество заказов">
        {ordersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
          </div>
        ) : ordersChartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Нет данных для отображения
          </div>
        ) : (
          <LineChartOrders data={ordersChartData} onZoom={handleZoom} />
        )}
      </ComponentCard>
    </div>
  );
}

