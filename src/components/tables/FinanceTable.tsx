"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./RegistryTableDatePicker.css";
import { ru } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { financeService, IFinance } from "@/services/finance.service";
import { IPaginationMeta, IFinanceQueryParams } from "@/types/auth.types";
import Pagination from "./Pagination";
import { exportToExcel } from "@/utils/excelExport";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CheckLineIcon, TrashBinIcon, ChevronDownIcon } from "@/icons";

type FilterType = 'branch' | 'status' | 'date' | 'amountFrom' | 'completionDate' | 'closingDate';

interface FinanceTableProps {
  onExportReady?: (exportFn: () => void | Promise<void>) => void;
}

export default function FinanceTable({ onExportReady }: FinanceTableProps = {}) {
  const [finance, setFinance] = useState<IFinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и сортировка
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'completionDate' | 'closingDate'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Фильтры по колонкам
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  
  // Фильтры по датам (применённые значения)
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [completionDateFrom, setCompletionDateFrom] = useState<Date | null>(null);
  const [completionDateTo, setCompletionDateTo] = useState<Date | null>(null);
  const [closingDateFrom, setClosingDateFrom] = useState<Date | null>(null);
  const [closingDateTo, setClosingDateTo] = useState<Date | null>(null);
  
  // Input состояния для фильтров (текстовые)
  const [branchInput, setBranchInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [amountFromInput, setAmountFromInput] = useState('');
  
  // Input состояния для фильтров по датам (временные, до применения)
  const [dateFromInput, setDateFromInput] = useState<Date | null>(null);
  const [dateToInput, setDateToInput] = useState<Date | null>(null);
  const [completionDateFromInput, setCompletionDateFromInput] = useState<Date | null>(null);
  const [completionDateToInput, setCompletionDateToInput] = useState<Date | null>(null);
  const [closingDateFromInput, setClosingDateFromInput] = useState<Date | null>(null);
  const [closingDateToInput, setClosingDateToInput] = useState<Date | null>(null);
  
  // UI состояния для фильтров
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [activeFilterInput, setActiveFilterInput] = useState<FilterType | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);
  
  // Состояние для хранения всех уникальных статусов
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  // Функция для форматирования даты в ISO формат
  const formatDateToISO = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadFinance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Формируем параметры запроса
      const requestParams: IFinanceQueryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        branch: branch || undefined,
        status: status || undefined,
        amountFrom: amountFrom ? parseFloat(amountFrom) : undefined,
      };
      
      // Добавляем фильтры по датам
      if (dateFrom) {
        requestParams.dateFrom = formatDateToISO(dateFrom);
      }
      if (dateTo) {
        requestParams.dateTo = formatDateToISO(dateTo);
      }
      if (completionDateFrom) {
        requestParams.completionDateFrom = formatDateToISO(completionDateFrom);
      }
      if (completionDateTo) {
        requestParams.completionDateTo = formatDateToISO(completionDateTo);
      }
      if (closingDateFrom) {
        requestParams.closingDateFrom = formatDateToISO(closingDateFrom);
      }
      if (closingDateTo) {
        requestParams.closingDateTo = formatDateToISO(closingDateTo);
      }
      
      // Загружаем данные
      const response = await financeService.getPaginated(requestParams);
      
      // Обработка пагинированного ответа
      if (response && 'data' in response && Array.isArray(response.data)) {
        setFinance(response.data || []);
        setMeta(response.meta || null);
      } else if (Array.isArray(response)) {
        // Fallback для старого API
        setFinance(response || []);
        setMeta(null);
      } else {
        console.warn('Unexpected response format:', response);
        setFinance([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      if (!isNetworkError) {
        console.error('Failed to load finance:', err);
      }
      
      if (isNetworkError) {
        setError('Сервер недоступен. Убедитесь, что бэкенд запущен.');
      } else {
        setError('Ошибка при загрузке данных');
      }
      
      setFinance([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, branch, status, amountFrom, dateFrom, dateTo, completionDateFrom, completionDateTo, closingDateFrom, closingDateTo]);

  useEffect(() => {
    loadFinance();
  }, [loadFinance]);

  // Функция для загрузки всех уникальных статусов
  const loadAllStatuses = useCallback(async () => {
    try {
      setLoadingStatuses(true);
      
      // Загружаем все данные с большим лимитом для получения всех статусов
      const requestParams: IFinanceQueryParams = {
        page: 1,
        limit: 10000, // Большой лимит для получения всех данных
      };
      
      const response = await financeService.getPaginated(requestParams);
      
      // Извлекаем уникальные статусы
      const allFinance = response && 'data' in response && Array.isArray(response.data) 
        ? response.data 
        : [];
      
      const uniqueStatuses = Array.from(
        new Set(
          allFinance
            .map(item => item.status)
            .filter((status): status is string => Boolean(status))
        )
      ).sort();
      
      setAllStatuses(uniqueStatuses);
    } catch (err) {
      console.error('Failed to load statuses:', err);
      setAllStatuses([]);
    } finally {
      setLoadingStatuses(false);
    }
  }, []);

  // Загружаем статусы при открытии фильтра статуса
  useEffect(() => {
    if (activeFilterInput === 'status' && allStatuses.length === 0 && !loadingStatuses) {
      loadAllStatuses();
    }
  }, [activeFilterInput, allStatuses.length, loadingStatuses, loadAllStatuses]);

  // Обработчики для фильтров
  const handleFilterSelect = (filterType: FilterType) => {
    setActiveFilterInput(filterType);
    setIsFiltersDropdownOpen(false);
  };

  const handleFilterInputChange = (filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'branch':
        setBranchInput(value);
        break;
      case 'status':
        setStatusInput(value);
        break;
      case 'amountFrom':
        setAmountFromInput(value);
        break;
    }
  };

  const getFilterInputValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branchInput;
      case 'status':
        return statusInput;
      case 'amountFrom':
        return amountFromInput;
      case 'date':
        return '';
      default:
        return '';
    }
  };

  const getFilterValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branch;
      case 'status':
        return status;
      case 'amountFrom':
        return amountFrom;
      case 'date':
        return '';
      default:
        return '';
    }
  };

  const setFilterValue = (filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'branch':
        setBranch(value);
        setBranchInput('');
        break;
      case 'status':
        setStatus(value);
        setStatusInput('');
        break;
      case 'amountFrom':
        setAmountFrom(value);
        setAmountFromInput('');
        break;
    }
  };

  const handleApplyFilter = (filterType: FilterType) => {
    if (filterType === 'date') {
      // Применение фильтров по датам
      if (dateFromInput || dateToInput) {
        setDateFrom(dateFromInput);
        setDateTo(dateToInput);
        setDateFromInput(null);
        setDateToInput(null);
        setPage(1);
        setActiveFilterInput(null);
      }
    } else if (filterType === 'completionDate') {
      // Применение фильтров по дате завершения
      if (completionDateFromInput || completionDateToInput) {
        setCompletionDateFrom(completionDateFromInput);
        setCompletionDateTo(completionDateToInput);
        setCompletionDateFromInput(null);
        setCompletionDateToInput(null);
        setPage(1);
        setActiveFilterInput(null);
      }
    } else if (filterType === 'closingDate') {
      // Применение фильтров по дате закрытия
      if (closingDateFromInput || closingDateToInput) {
        setClosingDateFrom(closingDateFromInput);
        setClosingDateTo(closingDateToInput);
        setClosingDateFromInput(null);
        setClosingDateToInput(null);
        setPage(1);
        setActiveFilterInput(null);
      }
    } else {
      // Применение текстовых фильтров
      const value = getFilterInputValue(filterType).trim();
      
      if (value) {
        setFilterValue(filterType, value);
        setPage(1);
        setActiveFilterInput(null);
      }
    }
  };

  const handleFilterInputBlur = (filterType: FilterType) => {
    if (filterType !== 'date' && filterType !== 'completionDate' && filterType !== 'closingDate') {
      const value = getFilterInputValue(filterType).trim();
      
      if (!value) {
        setActiveFilterInput(null);
      }
    }
  };

  const handleEditFilter = (filterType: FilterType) => {
    setActiveFilterInput(filterType);
    
    if (filterType === 'date') {
      // Для дат загружаем текущие применённые значения в input
      setDateFromInput(dateFrom);
      setDateToInput(dateTo);
    } else if (filterType === 'completionDate') {
      setCompletionDateFromInput(completionDateFrom);
      setCompletionDateToInput(completionDateTo);
    } else if (filterType === 'closingDate') {
      setClosingDateFromInput(closingDateFrom);
      setClosingDateToInput(closingDateTo);
    } else {
      // Для текстовых фильтров (кроме статуса, который использует чипсы)
      if (filterType !== 'status') {
        const currentValue = getFilterValue(filterType);
        switch (filterType) {
          case 'branch':
            setBranchInput(currentValue);
            break;
          case 'amountFrom':
            setAmountFromInput(currentValue);
            break;
        }
      }
    }
  };

  const handleRemoveFilter = (filterType: FilterType) => {
    if (filterType === 'date') {
      setDateFrom(null);
      setDateTo(null);
    } else if (filterType === 'completionDate') {
      setCompletionDateFrom(null);
      setCompletionDateTo(null);
    } else if (filterType === 'closingDate') {
      setClosingDateFrom(null);
      setClosingDateTo(null);
    } else {
      setFilterValue(filterType, '');
    }
    setPage(1);
  };

  const handleResetAllFilters = () => {
    setBranch('');
    setBranchInput('');
    setStatus('');
    setStatusInput('');
    setAmountFrom('');
    setAmountFromInput('');
    setDateFrom(null);
    setDateTo(null);
    setDateFromInput(null);
    setDateToInput(null);
    setCompletionDateFrom(null);
    setCompletionDateTo(null);
    setCompletionDateFromInput(null);
    setCompletionDateToInput(null);
    setClosingDateFrom(null);
    setClosingDateTo(null);
    setClosingDateFromInput(null);
    setClosingDateToInput(null);
    setActiveFilterInput(null);
    setPage(1);
  };

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = [
    branch, 
    status, 
    amountFrom,
    dateFrom || dateTo ? 'date' : null,
    completionDateFrom || completionDateTo ? 'completionDate' : null,
    closingDateFrom || closingDateTo ? 'closingDate' : null
  ].filter(Boolean).length;

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForChip = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Функция для капитализации первой буквы статуса
  const capitalizeStatus = (status: string): string => {
    if (!status) return status;
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handleExport = useCallback(async () => {
    try {
      // Формируем параметры запроса с очень большим limit для получения всех данных
      const requestParams: IFinanceQueryParams = {
        page: 1,
        limit: 100000, // Очень большое число для получения всех данных
        sortBy,
        sortOrder,
        branch: branch || undefined,
        status: status || undefined,
        amountFrom: amountFrom ? parseFloat(amountFrom) : undefined,
      };
      
      // Добавляем фильтры по датам
      if (dateFrom) {
        requestParams.dateFrom = formatDateToISO(dateFrom);
      }
      if (dateTo) {
        requestParams.dateTo = formatDateToISO(dateTo);
      }
      if (completionDateFrom) {
        requestParams.completionDateFrom = formatDateToISO(completionDateFrom);
      }
      if (completionDateTo) {
        requestParams.completionDateTo = formatDateToISO(completionDateTo);
      }
      if (closingDateFrom) {
        requestParams.closingDateFrom = formatDateToISO(closingDateFrom);
      }
      if (closingDateTo) {
        requestParams.closingDateTo = formatDateToISO(closingDateTo);
      }
      
      // Загружаем все данные одним запросом
      const response = await financeService.getPaginated(requestParams);
      
      // Получаем все данные из ответа
      const allFinance = response && 'data' in response && Array.isArray(response.data) 
        ? response.data 
        : [];
      
      if (allFinance.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }

      // Форматируем данные для экспорта
      const exportData = allFinance.map((item) => ({
        'Филиал': item.branch,
        'Статус': capitalizeStatus(item.status),
        'Дата создания': formatDate(item.date),
        'Сумма': item.amount,
        '№ заказа': item.orderNumber || '',
        'Описание': item.description || '',
        'Дата завершения': item.completionDate ? formatDate(item.completionDate) : '',
        'Плановый срок закрытия': item.closingDate ? formatDate(item.closingDate) : '',
      }));

      exportToExcel(exportData, `Финансы_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Ошибка при загрузке данных для экспорта');
    }
  }, [sortBy, sortOrder, branch, status, amountFrom, dateFrom, dateTo, completionDateFrom, completionDateTo, closingDateFrom, closingDateTo]);

  // Передаем функцию экспорта наружу
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport);
    }
  }, [onExportReady, handleExport]);

  const handleSort = (field: 'date' | 'amount' | 'completionDate' | 'closingDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getFilterLabel = (type: FilterType): string => {
    switch (type) {
      case 'branch':
        return 'Филиал';
      case 'status':
        return 'Статус';
      case 'date':
        return 'Дата создания';
      case 'amountFrom':
        return 'Сумма от';
      case 'completionDate':
        return 'Дата завершения';
      case 'closingDate':
        return 'Плановый срок закрытия';
    }
  };

  const hasFilter = (filterType: FilterType): boolean => {
    if (filterType === 'date') {
      return !!(dateFrom || dateTo);
    }
    if (filterType === 'completionDate') {
      return !!(completionDateFrom || completionDateTo);
    }
    if (filterType === 'closingDate') {
      return !!(closingDateFrom || closingDateTo);
    }
    return !!getFilterValue(filterType);
  };

  const isDateFilter = (filterType: FilterType): boolean => {
    return filterType === 'date' || filterType === 'completionDate' || filterType === 'closingDate';
  };

  return (
    <div className="space-y-4">
      {/* Панель фильтров */}
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
                  {!hasFilter('branch') && activeFilterInput !== 'branch' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('branch')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Филиал
                    </DropdownItem>
                  )}
                  {!hasFilter('status') && activeFilterInput !== 'status' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('status')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Статус
                    </DropdownItem>
                  )}
                  {!hasFilter('date') && activeFilterInput !== 'date' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('date')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Дата создания
                    </DropdownItem>
                  )}
                  {!hasFilter('amountFrom') && activeFilterInput !== 'amountFrom' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('amountFrom')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Сумма от
                    </DropdownItem>
                  )}
                  {!hasFilter('completionDate') && activeFilterInput !== 'completionDate' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('completionDate')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Дата завершения
                    </DropdownItem>
                  )}
                  {!hasFilter('closingDate') && activeFilterInput !== 'closingDate' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('closingDate')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Плановый срок закрытия
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
            {isDateFilter(activeFilterInput) ? (
              // UI для фильтров по датам
              <div className="flex items-center gap-2">
                <div className="relative">
                  <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                  <DatePicker
                    selected={
                      activeFilterInput === 'date' ? dateFromInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateFromInput || undefined :
                      closingDateFromInput || undefined
                    }
                    onChange={(date) => {
                      if (activeFilterInput === 'date') {
                        setDateFromInput(date);
                      } else if (activeFilterInput === 'completionDate') {
                        setCompletionDateFromInput(date);
                      } else {
                        setClosingDateFromInput(date);
                      }
                    }}
                    selectsStart
                    startDate={
                      activeFilterInput === 'date' ? dateFromInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateFromInput || undefined :
                      closingDateFromInput || undefined
                    }
                    endDate={
                      activeFilterInput === 'date' ? dateToInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateToInput || undefined :
                      closingDateToInput || undefined
                    }
                    placeholderText="С"
                    dateFormat="dd.MM.yyyy"
                    locale={ru}
                    className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <span className="text-gray-500 dark:text-gray-400">—</span>
                <div className="relative">
                  <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                  <DatePicker
                    selected={
                      activeFilterInput === 'date' ? dateToInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateToInput || undefined :
                      closingDateToInput || undefined
                    }
                    onChange={(date) => {
                      if (activeFilterInput === 'date') {
                        setDateToInput(date);
                      } else if (activeFilterInput === 'completionDate') {
                        setCompletionDateToInput(date);
                      } else {
                        setClosingDateToInput(date);
                      }
                    }}
                    selectsEnd
                    startDate={
                      activeFilterInput === 'date' ? dateFromInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateFromInput || undefined :
                      closingDateFromInput || undefined
                    }
                    endDate={
                      activeFilterInput === 'date' ? dateToInput || undefined :
                      activeFilterInput === 'completionDate' ? completionDateToInput || undefined :
                      closingDateToInput || undefined
                    }
                    placeholderText="До"
                    dateFormat="dd.MM.yyyy"
                    locale={ru}
                    className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyFilter(activeFilterInput)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    activeFilterInput === 'date' ? (!dateFromInput && !dateToInput) :
                    activeFilterInput === 'completionDate' ? (!completionDateFromInput && !completionDateToInput) :
                    (!closingDateFromInput && !closingDateToInput)
                  }
                  aria-label="Применить фильтр"
                >
                  <CheckLineIcon />
                </button>
              </div>
            ) : activeFilterInput === 'status' ? (
              // UI для фильтра статуса - список чипсов
              <div className="flex flex-wrap items-center gap-2">
                {loadingStatuses ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Загрузка статусов...</div>
                ) : allStatuses.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Нет доступных статусов</div>
                ) : (
                  allStatuses.map((statusValue) => (
                    <button
                      key={statusValue}
                      type="button"
                      onClick={() => {
                        setStatus(statusValue);
                        setStatusInput('');
                        setPage(1);
                        setActiveFilterInput(null);
                      }}
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        status === statusValue
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {capitalizeStatus(statusValue)}
                    </button>
                  ))
                )}
              </div>
            ) : (
              // UI для текстовых фильтров
              <>
                <input
                  type={activeFilterInput === 'amountFrom' ? 'number' : 'text'}
                  placeholder={`Поиск в поле ${getFilterLabel(activeFilterInput).toLowerCase()}`}
                  value={getFilterInputValue(activeFilterInput)}
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
                  disabled={!getFilterInputValue(activeFilterInput).trim()}
                  aria-label="Применить фильтр"
                >
                  <CheckLineIcon />
                </button>
              </>
            )}
          </div>
        )}

        {/* Фильтры с чипсами */}
        <div className="flex flex-wrap items-center gap-2">
          {branch && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('branch')}
            >
              <span>Филиал: {branch}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('branch');
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
          {status && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('status')}
            >
              <span>Статус: {capitalizeStatus(status)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('status');
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
          {amountFrom && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('amountFrom')}
            >
              <span>Сумма от: {formatAmount(parseFloat(amountFrom))}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('amountFrom');
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
          {hasFilter('date') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('date')}
            >
              <span>
                Дата создания: {dateFrom && formatDateForChip(dateFrom)}
                {dateFrom && dateTo && ' — '}
                {dateTo && formatDateForChip(dateTo)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('date');
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
          {hasFilter('completionDate') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('completionDate')}
            >
              <span>
                Дата завершения: {completionDateFrom && formatDateForChip(completionDateFrom)}
                {completionDateFrom && completionDateTo && ' — '}
                {completionDateTo && formatDateForChip(completionDateTo)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('completionDate');
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
          {hasFilter('closingDate') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('closingDate')}
            >
              <span>
                Плановый срок закрытия: {closingDateFrom && formatDateForChip(closingDateFrom)}
                {closingDateFrom && closingDateTo && ' — '}
                {closingDateTo && formatDateForChip(closingDateTo)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('closingDate');
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
          <div className="min-w-[1000px]">
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
                    Статус
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Дата создания
                      {sortBy === 'date' && (
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
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Сумма
                      {sortBy === 'amount' && (
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
                    № заказа
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Описание
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => handleSort('closingDate')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Плановый срок закрытия
                      {sortBy === 'closingDate' && (
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
                      onClick={() => handleSort('completionDate')}
                      className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Дата завершения
                      {sortBy === 'completionDate' && (
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
                    <TableCell colSpan={8} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-4 py-8 text-center">
                      <div className="text-red-600 dark:text-red-400">{error}</div>
                    </TableCell>
                  </TableRow>
                ) : !finance || finance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-4 py-8 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        {(branch || status || amountFrom || dateFrom || dateTo || completionDateFrom || completionDateTo || closingDateFrom || closingDateTo)
                          ? 'Ничего не найдено по выбранным фильтрам'
                          : 'Нет данных'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  finance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {item.branch}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {capitalizeStatus(item.status)}
                        </span>
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatDate(item.date)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatAmount(item.amount)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {item.orderNumber || '-'}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 max-w-[200px] truncate">
                        {item.description || '-'}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {item.closingDate ? formatDate(item.closingDate) : '-'}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {item.completionDate ? formatDate(item.completionDate) : '-'}
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

