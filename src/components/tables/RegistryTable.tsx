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
import { registryService, IRegistry } from "@/services/registry.service";
import { IPaginationMeta, IRegistryQueryParams } from "@/types/auth.types";
import Pagination from "./Pagination";
import { exportToExcel } from "@/utils/excelExport";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CheckLineIcon, TrashBinIcon, ChevronDownIcon } from "@/icons";
import RussianLicensePlate from "../common/RussianLicensePlate";

type FilterType = 'branch' | 'counterparty' | 'vehicleNumber' | 'driverName' | 'orderNumber' | 'orderType' | 'status' | 'processingType';

interface RegistryTableProps {
  onExportReady?: (exportFn: () => void) => void;
}

export default function RegistryTable({ onExportReady }: RegistryTableProps = {}) {
  const { selectedClients } = useSelectedClient();
  const [registries, setRegistries] = useState<IRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и сортировка
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'orderNumber' | 'acceptanceDate' | 'unloadingDate' | 'shipmentPlan'>('orderNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Фильтры по колонкам
  const [branch, setBranch] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderType, setOrderType] = useState('');
  const [status, setStatus] = useState('');
  const [processingType, setProcessingType] = useState('');
  
  // Input состояния для фильтров
  const [branchInput, setBranchInput] = useState('');
  const [counterpartyInput, setCounterpartyInput] = useState('');
  const [vehicleNumberInput, setVehicleNumberInput] = useState('');
  const [driverNameInput, setDriverNameInput] = useState('');
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [orderTypeInput, setOrderTypeInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [processingTypeInput, setProcessingTypeInput] = useState('');
  
  // UI состояния для фильтров
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [activeFilterInput, setActiveFilterInput] = useState<FilterType | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);

  const loadRegistries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Если клиенты не выбраны, не делаем запрос
      if (selectedClients.length === 0) {
        setRegistries([]);
        setMeta(null);
        setLoading(false);
        return;
      }
      
      // Получаем ИНН выбранных клиентов
      const clientTINs = selectedClients.map(client => client.TIN);
      const clientTINParam = clientTINs.length > 0 ? clientTINs.join(',') : undefined;
      
      // Формируем параметры запроса
      const requestParams: IRegistryQueryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
        branch: branch || undefined,
        counterparty: counterparty || undefined,
        vehicleNumber: vehicleNumber || undefined,
        driverName: driverName || undefined,
        orderNumber: orderNumber || undefined,
        orderType: orderType || undefined,
        status: status || undefined,
        processingType: processingType || undefined,
      };
      
      // Загружаем данные
      const response = await registryService.getPaginated(requestParams);
      
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
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      if (!isNetworkError) {
        console.error('Failed to load registries:', err);
      }
      
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
  }, [selectedClients, page, limit, sortBy, sortOrder, branch, counterparty, vehicleNumber, driverName, orderNumber, orderType, status, processingType]);

  useEffect(() => {
    loadRegistries();
  }, [loadRegistries]);

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
      case 'counterparty':
        setCounterpartyInput(value);
        break;
      case 'vehicleNumber':
        setVehicleNumberInput(value);
        break;
      case 'driverName':
        setDriverNameInput(value);
        break;
      case 'orderNumber':
        setOrderNumberInput(value);
        break;
      case 'orderType':
        setOrderTypeInput(value);
        break;
      case 'status':
        setStatusInput(value);
        break;
      case 'processingType':
        setProcessingTypeInput(value);
        break;
    }
  };

  const getFilterInputValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branchInput;
      case 'counterparty':
        return counterpartyInput;
      case 'vehicleNumber':
        return vehicleNumberInput;
      case 'driverName':
        return driverNameInput;
      case 'orderNumber':
        return orderNumberInput;
      case 'orderType':
        return orderTypeInput;
      case 'status':
        return statusInput;
      case 'processingType':
        return processingTypeInput;
    }
  };

  const getFilterValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branch;
      case 'counterparty':
        return counterparty;
      case 'vehicleNumber':
        return vehicleNumber;
      case 'driverName':
        return driverName;
      case 'orderNumber':
        return orderNumber;
      case 'orderType':
        return orderType;
      case 'status':
        return status;
      case 'processingType':
        return processingType;
    }
  };

  const setFilterValue = (filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'branch':
        setBranch(value);
        setBranchInput('');
        break;
      case 'counterparty':
        setCounterparty(value);
        setCounterpartyInput('');
        break;
      case 'vehicleNumber':
        setVehicleNumber(value);
        setVehicleNumberInput('');
        break;
      case 'driverName':
        setDriverName(value);
        setDriverNameInput('');
        break;
      case 'orderNumber':
        setOrderNumber(value);
        setOrderNumberInput('');
        break;
      case 'orderType':
        setOrderType(value);
        setOrderTypeInput('');
        break;
      case 'status':
        setStatus(value);
        setStatusInput('');
        break;
      case 'processingType':
        setProcessingType(value);
        setProcessingTypeInput('');
        break;
    }
  };

  const setFilterInputValue = (filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'branch':
        setBranchInput(value);
        break;
      case 'counterparty':
        setCounterpartyInput(value);
        break;
      case 'vehicleNumber':
        setVehicleNumberInput(value);
        break;
      case 'driverName':
        setDriverNameInput(value);
        break;
      case 'orderNumber':
        setOrderNumberInput(value);
        break;
      case 'orderType':
        setOrderTypeInput(value);
        break;
      case 'status':
        setStatusInput(value);
        break;
      case 'processingType':
        setProcessingTypeInput(value);
        break;
    }
  };

  const handleApplyFilter = (filterType: FilterType) => {
    const value = getFilterInputValue(filterType).trim();
    
    if (value) {
      setFilterValue(filterType, value);
      setPage(1);
      setActiveFilterInput(null);
    }
  };

  const handleFilterInputBlur = (filterType: FilterType) => {
    const value = getFilterInputValue(filterType).trim();
    
    if (!value) {
      setFilterInputValue(filterType, '');
      setActiveFilterInput(null);
    }
  };

  const handleEditFilter = (filterType: FilterType) => {
    setActiveFilterInput(filterType);
    const currentValue = getFilterValue(filterType);
    setFilterInputValue(filterType, currentValue);
  };

  const handleRemoveFilter = (filterType: FilterType) => {
    setFilterValue(filterType, '');
    setPage(1);
  };

  const handleResetAllFilters = () => {
    setBranch('');
    setBranchInput('');
    setCounterparty('');
    setCounterpartyInput('');
    setVehicleNumber('');
    setVehicleNumberInput('');
    setDriverName('');
    setDriverNameInput('');
    setOrderNumber('');
    setOrderNumberInput('');
    setOrderType('');
    setOrderTypeInput('');
    setStatus('');
    setStatusInput('');
    setProcessingType('');
    setProcessingTypeInput('');
    setActiveFilterInput(null);
    setPage(1);
  };

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = [branch, counterparty, vehicleNumber, driverName, orderNumber, orderType, status, processingType].filter(Boolean).length;

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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const handleExport = useCallback(() => {
    if (registries.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    // Форматируем данные для экспорта
    const exportData = registries.map((registry) => ({
      'Филиал': registry.branch,
      'Контрагент': registry.counterparty,
      'Номер ТС': registry.vehicleNumber || '',
      'Тип прихода': registry.orderType,
      'Номер заказа': registry.orderNumber,
      'ФИО водителя': registry.driverName || '',
      'Тип обработки': registry.processingType || '',
      'Дата планового прибытия': formatDateTime(registry.shipmentPlan),
      'Дата факт прибытия': formatDateTime(registry.unloadingDate),
      'Дата убытия': registry.departureDate ? formatDateTime(registry.departureDate) : '',
      'Статус ТС': registry.status,
    }));

    exportToExcel(exportData, `Реестр_${new Date().toISOString().split('T')[0]}`);
  }, [registries]);

  // Передаем функцию экспорта наружу
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport);
    }
  }, [onExportReady, handleExport]);

  const handleSort = (field: 'orderNumber' | 'acceptanceDate' | 'unloadingDate' | 'shipmentPlan') => {
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
      case 'counterparty':
        return 'Контрагент';
      case 'vehicleNumber':
        return 'Номер ТС';
      case 'driverName':
        return 'ФИО водителя';
      case 'orderNumber':
        return 'Номер заказа';
      case 'orderType':
        return 'Тип прихода';
      case 'status':
        return 'Статус ТС';
      case 'processingType':
        return 'Тип обработки';
    }
  };

  const hasFilter = (filterType: FilterType): boolean => {
    return !!getFilterValue(filterType);
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
                  {!hasFilter('branch') && activeFilterInput !== 'branch' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('branch')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Филиал
                    </DropdownItem>
                  )}
                  {!hasFilter('counterparty') && activeFilterInput !== 'counterparty' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('counterparty')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Контрагент
                    </DropdownItem>
                  )}
                  {!hasFilter('vehicleNumber') && activeFilterInput !== 'vehicleNumber' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('vehicleNumber')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Номер ТС
                    </DropdownItem>
                  )}
                  {!hasFilter('driverName') && activeFilterInput !== 'driverName' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('driverName')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      ФИО водителя
                    </DropdownItem>
                  )}
                  {!hasFilter('orderNumber') && activeFilterInput !== 'orderNumber' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('orderNumber')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Номер заказа
                    </DropdownItem>
                  )}
                  {!hasFilter('orderType') && activeFilterInput !== 'orderType' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('orderType')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Тип прихода
                    </DropdownItem>
                  )}
                  {!hasFilter('status') && activeFilterInput !== 'status' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('status')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Статус ТС
                    </DropdownItem>
                  )}
                  {!hasFilter('processingType') && activeFilterInput !== 'processingType' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('processingType')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Тип обработки
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
          {counterparty && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('counterparty')}
            >
              <span>Контрагент: {counterparty}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('counterparty');
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
          {vehicleNumber && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('vehicleNumber')}
            >
              <span>Номер ТС: {vehicleNumber}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('vehicleNumber');
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
          {driverName && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('driverName')}
            >
              <span>ФИО водителя: {driverName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('driverName');
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
          {orderNumber && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('orderNumber')}
            >
              <span>Номер заказа: {orderNumber}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('orderNumber');
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
          {orderType && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('orderType')}
            >
              <span>Тип прихода: {orderType}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('orderType');
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
              <span>Статус ТС: {status}</span>
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
          {processingType && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('processingType')}
            >
              <span>Тип обработки: {processingType}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('processingType');
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
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Контрагент
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Номер ТС
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Тип прихода
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
                    Номер заказа
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
                  ФИО водителя
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Тип обработки
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('shipmentPlan')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Дата планового прибытия
                    {sortBy === 'shipmentPlan' && (
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
                    Дата факт прибытия
                    {sortBy === 'unloadingDate' && (
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
                  Дата убытия
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                >
                  Статус ТС
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка данных...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} className="px-4 py-8 text-center">
                    <div className="text-red-600 dark:text-red-400">{error}</div>
                  </TableCell>
                </TableRow>
              ) : !registries || registries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {selectedClients.length === 0 
                        ? 'Выберите клиентов для отображения данных' 
                        : (branch || counterparty || vehicleNumber || driverName || orderNumber || orderType || status || processingType)
                        ? 'Ничего не найдено по выбранным фильтрам'
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

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 max-w-[200px] truncate">
                      {registry.counterparty}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                      <RussianLicensePlate plateNumber={registry.vehicleNumber || ''} />
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.orderType}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.orderNumber}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.driverName || '-'}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.processingType || '-'}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(registry.shipmentPlan)}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {formatDateTime(registry.unloadingDate)}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                      {registry.departureDate ? formatDateTime(registry.departureDate) : '-'}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-theme-xs whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {registry.status}
                      </span>
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
