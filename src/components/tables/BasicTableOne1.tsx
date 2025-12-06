"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { exportToExcel } from "@/utils/excelExport";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CheckLineIcon, TrashBinIcon, ChevronDownIcon } from "@/icons";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'article' | 'quantity'>('article');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Новые фильтры
  const [warehouse, setWarehouse] = useState('');
  const [nomenclature, setNomenclature] = useState('');
  const [article, setArticle] = useState('');
  const [warehouseInput, setWarehouseInput] = useState('');
  const [nomenclatureInput, setNomenclatureInput] = useState('');
  const [articleInput, setArticleInput] = useState('');
  
  // UI состояния для фильтров
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [activeFilterInput, setActiveFilterInput] = useState<'warehouse' | 'nomenclature' | 'article' | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);

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
      const queryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
        warehouse: warehouse || undefined,
        nomenclature: nomenclature || undefined,
        article: article || undefined,
      };
      
      const response = await stockService.getPaginated(queryParams);
      
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
  }, [selectedClients, page, limit, sortBy, sortOrder, warehouse, nomenclature, article]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Обработчики для фильтров
  const handleFilterSelect = (filterType: 'warehouse' | 'nomenclature' | 'article') => {
    setActiveFilterInput(filterType);
    setIsFiltersDropdownOpen(false);
  };

  const handleFilterInputChange = (filterType: 'warehouse' | 'nomenclature' | 'article', value: string) => {
    if (filterType === 'warehouse') {
      setWarehouseInput(value);
    } else if (filterType === 'nomenclature') {
      setNomenclatureInput(value);
    } else if (filterType === 'article') {
      setArticleInput(value);
    }
  };

  const handleApplyFilter = (filterType: 'warehouse' | 'nomenclature' | 'article') => {
    const value = filterType === 'warehouse' 
      ? warehouseInput.trim() 
      : filterType === 'nomenclature'
      ? nomenclatureInput.trim()
      : articleInput.trim();
    
    console.log('handleApplyFilter:', { filterType, value });
    
    if (value) {
      console.log('Setting filter:', filterType, '=', value);
      if (filterType === 'warehouse') {
        setWarehouse(value);
        setWarehouseInput('');
      } else if (filterType === 'nomenclature') {
        setNomenclature(value);
        setNomenclatureInput('');
      } else if (filterType === 'article') {
        setArticle(value);
        setArticleInput('');
      }
      setPage(1);
      setActiveFilterInput(null);
    }
  };

  const handleFilterInputBlur = (filterType: 'warehouse' | 'nomenclature' | 'article') => {
    // При blur проверяем, есть ли значение
    const value = filterType === 'warehouse' 
      ? warehouseInput.trim() 
      : filterType === 'nomenclature'
      ? nomenclatureInput.trim()
      : articleInput.trim();
    
    // Если значение пустое, скрываем инпут
    if (!value) {
      if (filterType === 'warehouse') {
        setWarehouseInput('');
      } else if (filterType === 'nomenclature') {
        setNomenclatureInput('');
      } else if (filterType === 'article') {
        setArticleInput('');
      }
      setActiveFilterInput(null);
    }
  };

  const handleEditFilter = (filterType: 'warehouse' | 'nomenclature' | 'article') => {
    // При клике на чипс открываем инпут для редактирования
    setActiveFilterInput(filterType);
    // Заполняем инпут текущим значением фильтра
    if (filterType === 'warehouse') {
      setWarehouseInput(warehouse);
    } else if (filterType === 'nomenclature') {
      setNomenclatureInput(nomenclature);
    } else if (filterType === 'article') {
      setArticleInput(article);
    }
  };

  const handleRemoveFilter = (filterType: 'warehouse' | 'nomenclature' | 'article') => {
    if (filterType === 'warehouse') {
      setWarehouse('');
      setWarehouseInput('');
    } else if (filterType === 'nomenclature') {
      setNomenclature('');
      setNomenclatureInput('');
    } else if (filterType === 'article') {
      setArticle('');
      setArticleInput('');
    }
    setPage(1);
  };

  const handleResetAllFilters = () => {
    setWarehouse('');
    setWarehouseInput('');
    setNomenclature('');
    setNomenclatureInput('');
    setArticle('');
    setArticleInput('');
    setActiveFilterInput(null);
    setPage(1);
  };

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = [warehouse, nomenclature, article].filter(Boolean).length;

  // Закрытие выпадающего списка при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersDropdownRef.current &&
        !filtersDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFiltersDropdownOpen(false);
      }
      if (
        limitDropdownRef.current &&
        !limitDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLimitDropdownOpen(false);
      }
    };

    if (isFiltersDropdownOpen || isLimitDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFiltersDropdownOpen, isLimitDropdownOpen]);

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

  const getFilterLabel = (type: 'warehouse' | 'nomenclature' | 'article') => {
    switch (type) {
      case 'warehouse':
        return 'Склад';
      case 'nomenclature':
        return 'Номенклатура';
      case 'article':
        return 'Артикул';
    }
  };

  return (
    <div className="space-y-4">
      {/* Панель поиска и фильтров */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative" ref={filtersDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFiltersDropdownOpen(!isFiltersDropdownOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.29004 5.90393H17.7067"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.7075 14.0961H2.29085"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                    fill="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                    fill="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Фильтры
              </button>
              {isFiltersDropdownOpen && (
                <Dropdown
                  isOpen={isFiltersDropdownOpen}
                  onClose={() => setIsFiltersDropdownOpen(false)}
                  className="w-48 p-2 mt-1 left-0"
                >
                  {!warehouse && activeFilterInput !== 'warehouse' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('warehouse')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Склад
                    </DropdownItem>
                  )}
                  {!nomenclature && activeFilterInput !== 'nomenclature' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('nomenclature')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Номенклатура
                    </DropdownItem>
                  )}
                  {!article && activeFilterInput !== 'article' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('article')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Артикул
                    </DropdownItem>
                  )}
                </Dropdown>
              )}
            </div>
            
            {/* Кнопка "Сбросить" - показывается если больше одного фильтра */}
            {activeFiltersCount > 1 && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Сбросить все фильтры"
              >
                <TrashBinIcon className="w-4 h-4" />
                Сбросить
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Лимит:
            </label>
            <div className="relative" ref={limitDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLimitDropdownOpen(!isLimitDropdownOpen)}
                className="inline-flex items-center justify-between h-9 w-18 rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-theme-xs bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-800 dark:text-white/90 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800"
              >
                <span>{limit}</span>
                <ChevronDownIcon className="text-gray-500 dark:text-gray-400" />
              </button>
              {isLimitDropdownOpen && (
                <Dropdown
                  isOpen={isLimitDropdownOpen}
                  onClose={() => setIsLimitDropdownOpen(false)}
                  className="w-24 p-1 mt-1 left-0"
                >
                  <DropdownItem
                    onItemClick={() => {
                      setLimit(20);
                      setPage(1);
                      setIsLimitDropdownOpen(false);
                    }}
                    className={`flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200 px-3 py-2 ${
                      limit === 20 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    20
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={() => {
                      setLimit(30);
                      setPage(1);
                      setIsLimitDropdownOpen(false);
                    }}
                    className={`flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200 px-3 py-2 ${
                      limit === 30 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    30
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={() => {
                      setLimit(50);
                      setPage(1);
                      setIsLimitDropdownOpen(false);
                    }}
                    className={`flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200 px-3 py-2 ${
                      limit === 50 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    50
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>
        </div>

        {/* Инпут для активного фильтра - над чипсами */}
        {activeFilterInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Поиск в поле ${getFilterLabel(activeFilterInput).toLowerCase()}`}
              value={
                activeFilterInput === 'warehouse'
                  ? warehouseInput
                  : activeFilterInput === 'nomenclature'
                  ? nomenclatureInput
                  : articleInput
              }
              onChange={(e) => handleFilterInputChange(activeFilterInput, e.target.value)}
              onBlur={() => handleFilterInputBlur(activeFilterInput)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilter(activeFilterInput);
                }
              }}
              className="h-11 w-80 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 dark:focus:border-brand-800"
              autoFocus
            />
            <button
              type="button"
              onClick={() => handleApplyFilter(activeFilterInput)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                activeFilterInput === 'warehouse'
                  ? !warehouseInput.trim()
                  : activeFilterInput === 'nomenclature'
                  ? !nomenclatureInput.trim()
                  : !articleInput.trim()
              }
              aria-label="Применить фильтр"
            >
              <CheckLineIcon />
            </button>
          </div>
        )}

        {/* Фильтры с чипсами */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Чипсы с примененными фильтрами */}
          {warehouse && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('warehouse')}
            >
              <span>Склад: {warehouse}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('warehouse');
                }}
                className="hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                aria-label="Удалить фильтр"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {nomenclature && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('nomenclature')}
            >
              <span>Номенклатура: {nomenclature}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('nomenclature');
                }}
                className="hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                aria-label="Удалить фильтр"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {article && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('article')}
            >
              <span>Артикул: {article}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('article');
                }}
                className="hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                aria-label="Удалить фильтр"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
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
                          : (warehouse || nomenclature || article)
                          ? 'Ничего не найдено по выбранным фильтрам'
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
