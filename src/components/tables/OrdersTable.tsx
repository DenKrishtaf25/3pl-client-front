"use client";
import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSelectedClient } from "@/context/ClientContext";
import { orderService, IOrder } from "@/services/order.service";
import { IPaginationMeta, IOrderQueryParams } from "@/types/auth.types";
import Pagination from "./Pagination";
import Input from "../form/input/InputField";
import { exportToExcel } from "@/utils/excelExport";

interface OrdersTableProps {
  onExportReady?: (exportFn: () => void) => void;
}

export default function OrdersTable({ onExportReady }: OrdersTableProps = {}) {
  const { selectedClients } = useSelectedClient();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и фильтры
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'orderNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate'>('orderNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Фильтры по дате
  const [dateField, setDateField] = useState<'acceptanceDate' | 'exportDate' | 'shipmentDate'>('acceptanceDate');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Если клиенты не выбраны, не делаем запрос
      if (selectedClients.length === 0) {
        setOrders([]);
        setMeta(null);
        setLoading(false);
        return;
      }
      
      // Получаем ИНН выбранных клиентов
      const clientTINs = selectedClients.map(client => client.TIN);
      const clientTINParam = clientTINs.length > 0 ? clientTINs.join(',') : undefined;
      
      // Формируем параметры запроса
      const requestParams: IOrderQueryParams = {
        search: search || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
      };
      
      // Добавляем фильтры по дате, если они выбраны (формат ISO: YYYY-MM-DD)
      // Используем локальную дату, а не UTC, чтобы избежать сдвига на день назад
      if (startDate || endDate) {
        requestParams.dateField = dateField;
        if (startDate) {
          const year = startDate.getFullYear();
          const month = String(startDate.getMonth() + 1).padStart(2, '0');
          const day = String(startDate.getDate()).padStart(2, '0');
          requestParams.dateFrom = `${year}-${month}-${day}`;
        }
        if (endDate) {
          // Нормализуем endDate к началу дня в локальном времени, чтобы избежать проблем с часовыми поясами
          const normalizedEndDate = new Date(endDate);
          normalizedEndDate.setHours(0, 0, 0, 0);
          const year = normalizedEndDate.getFullYear();
          const month = String(normalizedEndDate.getMonth() + 1).padStart(2, '0');
          const day = String(normalizedEndDate.getDate()).padStart(2, '0');
          requestParams.dateTo = `${year}-${month}-${day}`;
        }
      }
      
      // Загружаем данные с пагинацией, поиском, сортировкой и фильтрами по дате
      const response = await orderService.getPaginated(requestParams);
      
      // Обработка пагинированного ответа
      if (response && 'data' in response && Array.isArray(response.data)) {
        setOrders(response.data || []);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        // Fallback для старого API
        setOrders(response || []);
        setMeta(null);
      } else {
        console.warn('Unexpected response format:', response);
        setOrders([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to load orders:', err);
      }
      
      // Показываем понятное сообщение пользователю
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setOrders([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClients, search, page, limit, sortBy, sortOrder, dateField, startDate, endDate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Используем UTC методы, чтобы избежать сдвига даты из-за часового пояса
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Используем UTC методы для даты, но локальное время для времени
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  const handleExport = useCallback(() => {
    if (orders.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    // Форматируем данные для экспорта
    const exportData = orders.map((order) => ({
      'Филиал': order.branch,
      'Тип': order.orderType,
      '№ заказа': order.orderNumber,
      '№ КИС': order.kisNumber || '',
      'Дата выгрузки': formatDate(order.exportDate),
      'Статус': order.status,
      'Контрагент': order.counterparty,
      'Дата приемки': formatDate(order.acceptanceDate),
      'Дата отгрузки': formatDateTime(order.shipmentDate),
      'Упаковок план': order.packagesPlanned,
      'Упаковок факт': order.packagesActual,
      'Строк план': order.linesPlanned,
      'Строк факт': order.linesActual,
    }));

    exportToExcel(exportData, `Заказы_${new Date().toISOString().split('T')[0]}`);
  }, [orders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Передаем функцию экспорта наружу
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport);
    }
  }, [onExportReady, handleExport]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Сбрасываем на первую страницу при поиске
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSort = (field: 'orderNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1); // Сбрасываем на первую страницу при очистке фильтра
  };

  return (
    <div className="space-y-4">
      {/* Панель поиска и фильтров */}
      <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] p-4 rounded-t-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Поиск по филиалу или контрагенту..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Лимит:
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
          >
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            </select>
          </div>
        </div>
        
        {/* Фильтры по дате */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Поле для фильтрации</label>
            <select
              value={dateField}
              onChange={(e) => {
                setDateField(e.target.value as 'acceptanceDate' | 'exportDate' | 'shipmentDate');
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white"
            >
              <option value="acceptanceDate">Дата приемки</option>
              <option value="exportDate">Дата выгрузки</option>
              <option value="shipmentDate">Дата отгрузки</option>
            </select>
          </div>
          
          <div className="flex flex-col relative">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Дата с</label>
            <CalendarDays className="w-4 h-4 absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
            <DatePicker
              selected={startDate || undefined}
              onChange={(date) => {
                setStartDate(date);
                setPage(1);
              }}
              selectsStart
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              placeholderText="Выберите дату"
              dateFormat="dd.MM.yyyy"
              locale={ru}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Дата по</label>
            <CalendarDays className="w-4 h-4 absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
            <DatePicker
              selected={endDate || undefined}
              onChange={(date) => {
                setEndDate(date);
                setPage(1);
              }}
              selectsEnd
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              minDate={startDate || undefined}
              placeholderText="Выберите дату"
              dateFormat="dd.MM.yyyy"
              locale={ru}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleClearDateFilter}
              className="flex gap-1 items-center px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
              Очистить
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    Филиал
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    Тип заказа
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('orderNumber')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      № заказа
                      {sortBy === 'orderNumber' && (
                        <span className="text-brand-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  № КИС
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('exportDate')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Дата выгрузки
                    {sortBy === 'exportDate' && (
                      <span className="text-brand-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Статус
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Контрагент
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('acceptanceDate')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Дата приемки
                    {sortBy === 'acceptanceDate' && (
                      <span className="text-brand-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('shipmentDate')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Дата отгрузки
                    {sortBy === 'shipmentDate' && (
                      <span className="text-brand-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Упаковок план
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Упаковок факт
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Строк план
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Строк факт
                </TableCell>
              </TableRow>
            </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={13} className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : !orders || orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {selectedClients.length === 0 
                          ? 'Выберите клиентов для отображения данных' 
                          : search
                          ? 'Ничего не найдено по вашему запросу'
                          : 'Нет данных по выбранным клиентам'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.branch}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.orderType}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.orderNumber}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.kisNumber}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatDate(order.exportDate)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {order.status}
                        </span>
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 max-w-[200px] truncate">
                        {order.counterparty}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatDate(order.acceptanceDate)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatDateTime(order.shipmentDate)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.packagesPlanned}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.packagesActual}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.linesPlanned}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {order.linesActual}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Пагинация */}
      {meta && meta.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Показано {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} из {meta.total}
          </div>
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

