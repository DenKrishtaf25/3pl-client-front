"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { registryService, IRegistry } from "@/services/registry.service";
import { IPaginationMeta } from "@/types/auth.types";
import Pagination from "./Pagination";
import Input from "../form/input/InputField";

export default function RegistryTable() {
  const { selectedClients } = useSelectedClient();
  const [registries, setRegistries] = useState<IRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и фильтры
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'orderNumber' | 'acceptanceDate' | 'unloadingDate'>('orderNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Фильтры по дате (временное решение на фронтенде)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Все загруженные данные (для фильтрации на фронте)
  const [allRegistries, setAllRegistries] = useState<IRegistry[]>([]);
  const [allMeta, setAllMeta] = useState<IPaginationMeta | null>(null);

  const loadRegistries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Если клиенты не выбраны, не делаем запрос
      if (selectedClients.length === 0) {
        setAllRegistries([]);
        setAllMeta(null);
        setLoading(false);
        return;
      }
      
      // Получаем ИНН выбранных клиентов
      const clientTINs = selectedClients.map(client => client.TIN);
      const clientTINParam = clientTINs.length > 0 ? clientTINs.join(',') : undefined;
      
      // Загружаем данные с пагинацией, поиском и сортировкой
      const response = await registryService.getPaginated({
        search: search || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
      });
      
      // Обработка пагинированного ответа
      if (response && 'data' in response && Array.isArray(response.data)) {
        // Сохраняем все данные для фильтрации на фронте
        setAllRegistries(response.data || []);
        setAllMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        // Fallback для старого API
        setAllRegistries(response || []);
        setAllMeta(null);
      } else {
        console.warn('Unexpected response format:', response);
        setAllRegistries([]);
        setAllMeta(null);
      }
    } catch (err: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to load registries:', err);
      }
      
      // Показываем понятное сообщение пользователю
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setAllRegistries([]);
      setAllMeta(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClients, search, page, limit, sortBy, sortOrder]);

  // Фильтрация по дате на фронтенде
  const filteredRegistries = useMemo(() => {
    let filtered = [...allRegistries];
    
    // Фильтр по дате приемки (acceptanceDate)
    if (startDate || endDate) {
      filtered = filtered.filter(registry => {
        const acceptanceDate = new Date(registry.acceptanceDate);
        acceptanceDate.setHours(0, 0, 0, 0);
        
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return acceptanceDate >= start && acceptanceDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return acceptanceDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return acceptanceDate <= end;
        }
        return true;
      });
    }
    
    return filtered;
  }, [allRegistries, startDate, endDate]);

  // Пагинация отфильтрованных данных
  const paginatedRegistries = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredRegistries.slice(start, end);
  }, [filteredRegistries, page, limit]);

  // Мета-информация для отфильтрованных данных
  const filteredMeta = useMemo(() => {
    if (!allMeta) return null;
    
    const total = filteredRegistries.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      ...allMeta,
      total,
      totalPages,
      page,
      limit,
    };
  }, [allMeta, filteredRegistries.length, page, limit]);

  // Обновляем отображаемые данные
  useEffect(() => {
    setRegistries(paginatedRegistries);
    setMeta(filteredMeta);
  }, [paginatedRegistries, filteredMeta]);

  useEffect(() => {
    loadRegistries();
  }, [loadRegistries]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Сбрасываем на первую страницу при поиске
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSort = (field: 'orderNumber' | 'acceptanceDate' | 'unloadingDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1);
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
                  Тип
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
                Выгрузка
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
                  Приемка
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
                  onClick={() => handleSort('unloadingDate')}
                  className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Отгрузка
                  {sortBy === 'unloadingDate' && (
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
                М.пл
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                М.фк
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                С.пл
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                С.фк
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
              ) : !registries || registries.length === 0 ? (
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
                registries.map((registry) => (
                  <TableRow key={registry.id}>
                    <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.branch}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.orderType}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.orderNumber}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.kisNumber}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDate(registry.unloadingDate)}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {registry.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 max-w-[200px] truncate">
                      {registry.counterparty}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDate(registry.acceptanceDate)}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(registry.shipmentPlan)}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.packagesPlanned}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.packagesActual}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.linesPlanned}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-center text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.linesActual}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

