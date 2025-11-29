"use client";
import React, { useState, useEffect, useCallback } from "react";
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

  const loadRegistries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        setRegistries(response.data || []);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        // Fallback для старого API
        setRegistries(response || []);
        setMeta(null);
      } else {
        console.warn('Unexpected response format:', response);
        setRegistries([]);
        setMeta(null);
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
      
      setRegistries([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClients, search, page, limit, sortBy, sortOrder]);

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

  return (
    <div className="space-y-4">
      {/* Панель поиска и фильтров */}
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

