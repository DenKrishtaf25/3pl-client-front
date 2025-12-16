"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { complaintsService, IComplaintStatusStat } from "@/services/complaints.service";
import ComplaintsDonutChart from "../charts/ComplaintsDonutChart";

export default function ComplaintsStatusStatsTable() {
  const [stats, setStats] = useState<IComplaintStatusStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'count' | 'confirmedCount' | 'unconfirmedCount' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartViewMode, setChartViewMode] = useState<'count' | 'confirmedCount' | 'unconfirmedCount'>('count');

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await complaintsService.getStatusStats();
      
      // Сортируем данные если нужно
      const sortedData = [...data];
      if (sortBy) {
        sortedData.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          const comparison = aValue - bValue;
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      }
      
      setStats(sortedData || []);
    } catch (err: unknown) {
      // Проверяем различные форматы ошибок Axios
      let isNetworkError = false;
      if (err && typeof err === 'object') {
        // Проверяем прямое свойство code
        if ('code' in err && (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED')) {
          isNetworkError = true;
        }
        // Проверяем AxiosError структуру
        else if ('message' in err && typeof err.message === 'string' && 
                 (err.message.includes('Network Error') || err.message.includes('ERR_CONNECTION_REFUSED'))) {
          isNetworkError = true;
        }
      }
      
      if (!isNetworkError) {
        console.error('Failed to load status stats:', err);
      }
      
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSort = (field: 'count' | 'confirmedCount' | 'unconfirmedCount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCount = (count: number) => {
    return new Intl.NumberFormat('ru-RU').format(count);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Таблица - 60% ширины */}
      <div className="w-full lg:w-[60%] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[600px]">
            <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Статусы
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('count')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Количество
                    {sortBy === 'count' && (
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
                    onClick={() => handleSort('confirmedCount')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Количество Подтверждено
                    {sortBy === 'confirmedCount' && (
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
                    onClick={() => handleSort('unconfirmedCount')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Количество Неподтверждено
                    {sortBy === 'unconfirmedCount' && (
                      <span className="text-brand-500">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </TableCell>
              </TableRow>
            </TableHeader>

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
              ) : !stats || stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">Нет данных</div>
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((item, index) => (
                  <TableRow key={`${item.status}-${index}`}>
                    <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatCount(item.count)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatCount(item.confirmedCount)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatCount(item.unconfirmedCount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Диаграмма - 40% ширины */}
      <div className="w-full lg:w-[40%] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90 mb-4">
            Распределение по статусам
          </h3>
          {/* Переключение между типами */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            <button
              onClick={() => setChartViewMode('count')}
              className={`px-2 py-2 font-medium flex-1 rounded-md text-theme-xs transition-colors ${
                chartViewMode === 'count'
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Всего
            </button>
            <button
              onClick={() => setChartViewMode('confirmedCount')}
              className={`px-2 py-2 font-medium flex-1 rounded-md text-theme-xs transition-colors ${
                chartViewMode === 'confirmedCount'
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Подтверждено
            </button>
            <button
              onClick={() => setChartViewMode('unconfirmedCount')}
              className={`px-2 py-2 font-medium flex-1 rounded-md text-theme-xs transition-colors ${
                chartViewMode === 'unconfirmedCount'
                  ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Неподтверждено
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Загрузка данных...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[350px]">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="flex items-center justify-center h-[350px]">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Нет данных</div>
          </div>
        ) : (
          <ComplaintsDonutChart data={stats} viewMode={chartViewMode} />
        )}
      </div>
    </div>
  );
}

