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
import { stockService, IStock } from "@/services/stock.service";
import { IPaginationMeta } from "@/types/auth.types";
import Pagination from "./Pagination";
import Input from "../form/input/InputField";
import { exportToExcel } from "@/utils/excelExport";

interface BasicTableOneProps {
  onExportReady?: (exportFn: () => void) => void;
}

export default function BasicTableOne({ onExportReady }: BasicTableOneProps = {}) {
  const { selectedClients } = useSelectedClient();
  const [stocks, setStocks] = useState<IStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и фильтры
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'article' | 'quantity'>('article');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Если клиенты не выбраны, не делаем запрос
      if (selectedClients.length === 0) {
        setStocks([]);
        setMeta(null);
        setLoading(false);
        return;
      }
      
      // Получаем ИНН выбранных клиентов
      const clientTINs = selectedClients.map(client => client.TIN);
      const clientTINParam = clientTINs.length > 0 ? clientTINs.join(',') : undefined;
      
      // Загружаем данные с пагинацией, поиском и сортировкой
      const response = await stockService.getPaginated({
        search: search || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
      });
      
      // Обработка пагинированного ответа
      if (response && 'data' in response && Array.isArray(response.data)) {
        setStocks(response.data || []);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        // Fallback для старого API
        setStocks(response || []);
        setMeta(null);
      } else {
        console.warn('Unexpected response format:', response);
        setStocks([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      // Проверяем, является ли это ошибкой сети (бэкенд не запущен)
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      // Логируем только если это не ошибка сети (чтобы не засорять консоль)
      if (!isNetworkError) {
        console.error('Failed to load stocks:', err);
      }
      
      // Показываем понятное сообщение пользователю
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setStocks([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [selectedClients, search, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Сбрасываем на первую страницу при поиске
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExport = useCallback(() => {
    if (stocks.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    // Форматируем данные для экспорта
    const exportData = stocks.map((stock) => ({
      'Склад': stock.warehouse,
      'Номенклатура': stock.nomenclature,
      'Артикул': stock.article,
      'Остаток': stock.quantity,
    }));

    exportToExcel(exportData, `Товарный_запас_${new Date().toISOString().split('T')[0]}`);
  }, [stocks]);

  const handleSort = (field: 'article' | 'quantity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Передаем функцию экспорта наружу
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport);
    }
  }, [onExportReady, handleExport]);

  return (
    <div className="space-y-4">
      {/* Панель поиска и фильтров */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Поиск по складу или номенклатуре..."
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
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Склад
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Номеклатура
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('article')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Артикул
                      {sortBy === 'article' && (
                        <span className="text-brand-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('quantity')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Остаток
                      {sortBy === 'quantity' && (
                        <span className="text-brand-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : !stocks || stocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-4 py-8 text-center">
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
                  stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.warehouse}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                        {stock.nomenclature}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {stock.article}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {stock.quantity}
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
