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
import { useSelectedClient } from "@/context/ClientContext";
import { orderService, IOrder } from "@/services/order.service";
import { IPaginationMeta, IOrderQueryParams } from "@/types/auth.types";
import Pagination from "./Pagination";
import { exportToExcel } from "@/utils/excelExport";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CheckLineIcon, TrashBinIcon, ChevronDownIcon } from "@/icons";

type FilterType = 'branch' | 'counterparty' | 'orderNumber' | 'orderType' | 'status' | 'kisNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate';

interface OrdersTableProps {
  onExportReady?: (exportFn: () => void) => void;
}

export default function OrdersTable({ onExportReady }: OrdersTableProps = {}) {
  const { selectedClients } = useSelectedClient();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  // Пагинация и сортировка
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'orderNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate'>('orderNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Фильтры по колонкам
  const [branch, setBranch] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderType, setOrderType] = useState('');
  const [status, setStatus] = useState('');
  const [kisNumber, setKisNumber] = useState('');
  
  // Фильтры по датам (применённые значения)
  const [acceptanceDateFrom, setAcceptanceDateFrom] = useState<Date | null>(null);
  const [acceptanceDateTo, setAcceptanceDateTo] = useState<Date | null>(null);
  const [exportDateFrom, setExportDateFrom] = useState<Date | null>(null);
  const [exportDateTo, setExportDateTo] = useState<Date | null>(null);
  const [shipmentDateFrom, setShipmentDateFrom] = useState<Date | null>(null);
  const [shipmentDateTo, setShipmentDateTo] = useState<Date | null>(null);
  
  // Input состояния для фильтров (текстовые)
  const [branchInput, setBranchInput] = useState('');
  const [counterpartyInput, setCounterpartyInput] = useState('');
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [orderTypeInput, setOrderTypeInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [kisNumberInput, setKisNumberInput] = useState('');
  
  // Input состояния для фильтров по датам (временные, до применения)
  const [acceptanceDateFromInput, setAcceptanceDateFromInput] = useState<Date | null>(null);
  const [acceptanceDateToInput, setAcceptanceDateToInput] = useState<Date | null>(null);
  const [exportDateFromInput, setExportDateFromInput] = useState<Date | null>(null);
  const [exportDateToInput, setExportDateToInput] = useState<Date | null>(null);
  const [shipmentDateFromInput, setShipmentDateFromInput] = useState<Date | null>(null);
  const [shipmentDateToInput, setShipmentDateToInput] = useState<Date | null>(null);
  
  // Input состояния для времени отдельно от даты
  const [acceptanceDateFromTime, setAcceptanceDateFromTime] = useState<string>('00:00');
  const [acceptanceDateToTime, setAcceptanceDateToTime] = useState<string>('23:59');
  const [exportDateFromTime, setExportDateFromTime] = useState<string>('00:00');
  const [exportDateToTime, setExportDateToTime] = useState<string>('23:59');
  const [shipmentDateFromTime, setShipmentDateFromTime] = useState<string>('00:00');
  const [shipmentDateToTime, setShipmentDateToTime] = useState<string>('23:59');
  
  // UI состояния для фильтров
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [activeFilterInput, setActiveFilterInput] = useState<FilterType | null>(null);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);

  // Функция для объединения даты и времени
  const combineDateAndTime = (date: Date | null, time: string): Date | null => {
    if (!date) return null;
    if (!time || !time.includes(':')) return date;
    const timeParts = time.split(':');
    if (timeParts.length !== 2) return date;
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return date;
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  // Функция для форматирования даты в ISO формат с временем
  const formatDateToISO = (date: Date | null, includeTime: boolean = true): string | undefined => {
    if (!date) return undefined;
    
    if (includeTime) {
      // Формат: YYYY-MM-DDTHH:mm:00 (по примеру API: 2024-01-15T10:00:00)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    } else {
      // Формат: YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

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
        page,
        limit,
        sortBy,
        sortOrder,
        clientTIN: clientTINParam,
        branch: branch || undefined,
        counterparty: counterparty || undefined,
        orderNumber: orderNumber || undefined,
        orderType: orderType || undefined,
        status: status || undefined,
        kisNumber: kisNumber || undefined,
      };
      
      // Добавляем фильтры по датам
      if (acceptanceDateFrom) {
        const combinedFrom = combineDateAndTime(acceptanceDateFrom, acceptanceDateFromTime);
        requestParams.acceptanceDateFrom = formatDateToISO(combinedFrom, true);
      }
      if (acceptanceDateTo) {
        const combinedTo = combineDateAndTime(acceptanceDateTo, acceptanceDateToTime);
        requestParams.acceptanceDateTo = formatDateToISO(combinedTo, true);
      }
      if (exportDateFrom) {
        const combinedFrom = combineDateAndTime(exportDateFrom, exportDateFromTime);
        requestParams.exportDateFrom = formatDateToISO(combinedFrom, true);
      }
      if (exportDateTo) {
        const combinedTo = combineDateAndTime(exportDateTo, exportDateToTime);
        requestParams.exportDateTo = formatDateToISO(combinedTo, true);
      }
      if (shipmentDateFrom) {
        requestParams.shipmentDateFrom = formatDateToISO(shipmentDateFrom, true);
      }
      if (shipmentDateTo) {
        requestParams.shipmentDateTo = formatDateToISO(shipmentDateTo, true);
      }
      
      // Загружаем данные
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
      const isNetworkError = err && typeof err === 'object' && 'code' in err && 
        (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED');
      
      if (!isNetworkError) {
        console.error('Failed to load orders:', err);
      }
      
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
  }, [selectedClients, page, limit, sortBy, sortOrder, branch, counterparty, orderNumber, orderType, status, kisNumber, acceptanceDateFrom, acceptanceDateTo, exportDateFrom, exportDateTo, shipmentDateFrom, shipmentDateTo]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Обработчики для фильтров
  const handleFilterSelect = (filterType: FilterType) => {
    setActiveFilterInput(filterType);
    setIsFiltersDropdownOpen(false);
    
    // Устанавливаем значения времени по умолчанию при выборе фильтра даты
    if (isDateFilter(filterType)) {
      if (filterType === 'shipmentDate') {
        setShipmentDateFromTime('00:00');
        setShipmentDateToTime('23:59');
      }
    }
  };

  const handleFilterInputChange = (filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'branch':
        setBranchInput(value);
        break;
      case 'counterparty':
        setCounterpartyInput(value);
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
      case 'kisNumber':
        setKisNumberInput(value);
        break;
    }
  };

  const getFilterInputValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branchInput;
      case 'counterparty':
        return counterpartyInput;
      case 'orderNumber':
        return orderNumberInput;
      case 'orderType':
        return orderTypeInput;
      case 'status':
        return statusInput;
      case 'kisNumber':
        return kisNumberInput;
      case 'acceptanceDate':
      case 'exportDate':
      case 'shipmentDate':
        return '';
      default:
        return '';
    }
  };

  const getFilterValue = (filterType: FilterType): string => {
    switch (filterType) {
      case 'branch':
        return branch;
      case 'counterparty':
        return counterparty;
      case 'orderNumber':
        return orderNumber;
      case 'orderType':
        return orderType;
      case 'status':
        return status;
      case 'kisNumber':
        return kisNumber;
      case 'acceptanceDate':
      case 'exportDate':
      case 'shipmentDate':
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
      case 'counterparty':
        setCounterparty(value);
        setCounterpartyInput('');
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
      case 'kisNumber':
        setKisNumber(value);
        setKisNumberInput('');
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
      case 'orderNumber':
        setOrderNumberInput(value);
        break;
      case 'orderType':
        setOrderTypeInput(value);
        break;
      case 'status':
        setStatusInput(value);
        break;
      case 'kisNumber':
        setKisNumberInput(value);
        break;
    }
  };

  const handleApplyFilter = (filterType: FilterType) => {
    if (isDateFilter(filterType)) {
      // Применение фильтров по датам с объединением времени
      if (filterType === 'acceptanceDate') {
        if (acceptanceDateFromInput || acceptanceDateToInput) {
          const fromDate = combineDateAndTime(acceptanceDateFromInput, acceptanceDateFromTime);
          const toDate = combineDateAndTime(acceptanceDateToInput, acceptanceDateToTime);
          setAcceptanceDateFrom(fromDate);
          setAcceptanceDateTo(toDate);
          setAcceptanceDateFromInput(null);
          setAcceptanceDateToInput(null);
          setAcceptanceDateFromTime('00:00');
          setAcceptanceDateToTime('23:59');
          setPage(1);
          setActiveFilterInput(null);
        }
      } else if (filterType === 'exportDate') {
        if (exportDateFromInput || exportDateToInput) {
          const fromDate = combineDateAndTime(exportDateFromInput, exportDateFromTime);
          const toDate = combineDateAndTime(exportDateToInput, exportDateToTime);
          setExportDateFrom(fromDate);
          setExportDateTo(toDate);
          setExportDateFromInput(null);
          setExportDateToInput(null);
          setExportDateFromTime('00:00');
          setExportDateToTime('23:59');
          setPage(1);
          setActiveFilterInput(null);
        }
      } else if (filterType === 'shipmentDate') {
        if (shipmentDateFromInput || shipmentDateToInput) {
          const fromDate = combineDateAndTime(shipmentDateFromInput, shipmentDateFromTime);
          const toDate = combineDateAndTime(shipmentDateToInput, shipmentDateToTime);
          setShipmentDateFrom(fromDate);
          setShipmentDateTo(toDate);
          setShipmentDateFromInput(null);
          setShipmentDateToInput(null);
          setShipmentDateFromTime('00:00');
          setShipmentDateToTime('23:59');
          setPage(1);
          setActiveFilterInput(null);
        }
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
    if (!isDateFilter(filterType)) {
      const value = getFilterInputValue(filterType).trim();
      
      if (!value) {
        setFilterInputValue(filterType, '');
        setActiveFilterInput(null);
      }
    }
  };

  // Функция для извлечения времени из даты в формате HH:mm
  const extractTimeFromDate = (date: Date | null): string => {
    if (!date) return '00:00';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleEditFilter = (filterType: FilterType) => {
    setActiveFilterInput(filterType);
    
    if (isDateFilter(filterType)) {
      // Для дат загружаем текущие применённые значения в input
      if (filterType === 'acceptanceDate') {
        setAcceptanceDateFromInput(acceptanceDateFrom);
        setAcceptanceDateToInput(acceptanceDateTo);
        setAcceptanceDateFromTime(extractTimeFromDate(acceptanceDateFrom));
        setAcceptanceDateToTime(extractTimeFromDate(acceptanceDateTo));
      } else if (filterType === 'exportDate') {
        setExportDateFromInput(exportDateFrom);
        setExportDateToInput(exportDateTo);
        setExportDateFromTime(extractTimeFromDate(exportDateFrom));
        setExportDateToTime(extractTimeFromDate(exportDateTo));
      } else if (filterType === 'shipmentDate') {
        setShipmentDateFromInput(shipmentDateFrom);
        setShipmentDateToInput(shipmentDateTo);
        setShipmentDateFromTime(extractTimeFromDate(shipmentDateFrom));
        setShipmentDateToTime(extractTimeFromDate(shipmentDateTo));
      }
    } else {
      // Для текстовых фильтров
      const currentValue = getFilterValue(filterType);
      setFilterInputValue(filterType, currentValue);
    }
  };

  const handleRemoveFilter = (filterType: FilterType) => {
    if (isDateFilter(filterType)) {
      if (filterType === 'acceptanceDate') {
        setAcceptanceDateFrom(null);
        setAcceptanceDateTo(null);
      } else if (filterType === 'exportDate') {
        setExportDateFrom(null);
        setExportDateTo(null);
      } else if (filterType === 'shipmentDate') {
        setShipmentDateFrom(null);
        setShipmentDateTo(null);
      }
    } else {
      setFilterValue(filterType, '');
    }
    setPage(1);
  };

  const handleResetAllFilters = () => {
    setBranch('');
    setBranchInput('');
    setCounterparty('');
    setCounterpartyInput('');
    setOrderNumber('');
    setOrderNumberInput('');
    setOrderType('');
    setOrderTypeInput('');
    setStatus('');
    setStatusInput('');
    setKisNumber('');
    setKisNumberInput('');
    setAcceptanceDateFrom(null);
    setAcceptanceDateTo(null);
    setAcceptanceDateFromInput(null);
    setAcceptanceDateToInput(null);
    setExportDateFrom(null);
    setExportDateTo(null);
    setExportDateFromInput(null);
    setExportDateToInput(null);
    setShipmentDateFrom(null);
    setShipmentDateTo(null);
    setShipmentDateFromInput(null);
    setShipmentDateToInput(null);
    setShipmentDateFromTime('00:00');
    setShipmentDateToTime('23:59');
    setActiveFilterInput(null);
    setPage(1);
  };

  // Подсчитываем количество активных фильтров
  const activeFiltersCount = [
    branch, 
    counterparty, 
    orderNumber, 
    orderType, 
    status, 
    kisNumber,
    acceptanceDateFrom || acceptanceDateTo ? 'acceptanceDate' : null,
    exportDateFrom || exportDateTo ? 'exportDate' : null,
    shipmentDateFrom || shipmentDateTo ? 'shipmentDate' : null
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Проверяем, что дата валидна и не является дефолтной датой
      if (isNaN(date.getTime())) return '-';
      // Проверяем, что это не дефолтная дата (например, 1970-01-01 или очень старая дата)
      if (date.getUTCFullYear() < 2000) return '-';
      // Используем UTC методы, чтобы показывать время как пришло с сервера без конвертации в локальный часовой пояс
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      // Проверяем, что дата валидна и не является дефолтной датой
      if (isNaN(date.getTime())) return '-';
      // Проверяем, что это не дефолтная дата (например, 1970-01-01 или очень старая дата)
      if (date.getUTCFullYear() < 2000) return '-';
      // Используем UTC методы, чтобы показывать время как пришло с сервера без конвертации в локальный часовой пояс
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return '-';
    }
  };

  const formatDateForChip = (date: Date | null, includeTime: boolean = true): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    return `${day}.${month}.${year}`;
  };

  const handleExport = useCallback(() => {
    if (orders.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    // Форматируем данные для экспорта
    const exportData = orders.map((order) => ({
      'Филиал': order.branch,
      'Тип заказа': order.orderType,
      '№ заказа': order.orderNumber,
      '№ КИС': order.kisNumber || '',
      'Дата выгрузки заказа': formatDate(order.exportDate),
      'Статус': order.status,
      'Контрагент': order.counterparty,
      'Заявленная дата отгрузки': formatDateTime(order.shipmentDate),
      'Дата приемки': formatDateTime(order.acceptanceDate),
      'Упаковок план': order.packagesPlanned,
      'Упаковок факт': order.packagesActual,
      'Строк план': order.linesPlanned,
      'Строк факт': order.linesActual,
    }));

    exportToExcel(exportData, `Заказы_${new Date().toISOString().split('T')[0]}`);
  }, [orders]);

  // Передаем функцию экспорта наружу
  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExport);
    }
  }, [onExportReady, handleExport]);

  const handleSort = (field: 'orderNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate') => {
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
      case 'orderNumber':
        return '№ заказа';
      case 'orderType':
        return 'Тип заказа';
      case 'status':
        return 'Статус';
      case 'kisNumber':
        return '№ КИС';
      case 'acceptanceDate':
        return 'Дата приемки';
      case 'exportDate':
        return 'Дата выгрузки заказа';
      case 'shipmentDate':
        return 'Заявленная дата отгрузки';
    }
  };

  const hasFilter = (filterType: FilterType): boolean => {
    if (filterType === 'acceptanceDate') {
      return !!(acceptanceDateFrom || acceptanceDateTo);
    }
    if (filterType === 'exportDate') {
      return !!(exportDateFrom || exportDateTo);
    }
    if (filterType === 'shipmentDate') {
      return !!(shipmentDateFrom || shipmentDateTo);
    }
    return !!getFilterValue(filterType);
  };

  const isDateFilter = (filterType: FilterType): boolean => {
    return filterType === 'acceptanceDate' || filterType === 'exportDate' || filterType === 'shipmentDate';
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
                  {!hasFilter('orderNumber') && activeFilterInput !== 'orderNumber' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('orderNumber')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      № заказа
                    </DropdownItem>
                  )}
                  {!hasFilter('orderType') && activeFilterInput !== 'orderType' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('orderType')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Тип заказа
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
                  {!hasFilter('kisNumber') && activeFilterInput !== 'kisNumber' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('kisNumber')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      № КИС
                    </DropdownItem>
                  )}
                  {!hasFilter('acceptanceDate') && activeFilterInput !== 'acceptanceDate' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('acceptanceDate')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Дата приемки
                    </DropdownItem>
                  )}
                  {!hasFilter('exportDate') && activeFilterInput !== 'exportDate' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('exportDate')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Дата выгрузки заказа
                    </DropdownItem>
                  )}
                  {!hasFilter('shipmentDate') && activeFilterInput !== 'shipmentDate' && (
                    <DropdownItem
                      onItemClick={() => handleFilterSelect('shipmentDate')}
                      className="flex w-full font-normal text-left text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200"
                    >
                      Заявленная дата отгрузки
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
                {activeFilterInput === 'acceptanceDate' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={acceptanceDateFromInput || undefined}
                          onChange={(date) => setAcceptanceDateFromInput(date)}
                          selectsStart
                          startDate={acceptanceDateFromInput || undefined}
                          endDate={acceptanceDateToInput || undefined}
                          placeholderText="С"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={acceptanceDateFromTime}
                        onChange={(e) => setAcceptanceDateFromTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">—</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={acceptanceDateToInput || undefined}
                          onChange={(date) => setAcceptanceDateToInput(date)}
                          selectsEnd
                          startDate={acceptanceDateFromInput || undefined}
                          endDate={acceptanceDateToInput || undefined}
                          placeholderText="До"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={acceptanceDateToTime}
                        onChange={(e) => setAcceptanceDateToTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                {activeFilterInput === 'exportDate' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={exportDateFromInput || undefined}
                          onChange={(date) => setExportDateFromInput(date)}
                          selectsStart
                          startDate={exportDateFromInput || undefined}
                          endDate={exportDateToInput || undefined}
                          placeholderText="С"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={exportDateFromTime}
                        onChange={(e) => setExportDateFromTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">—</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={exportDateToInput || undefined}
                          onChange={(date) => setExportDateToInput(date)}
                          selectsEnd
                          startDate={exportDateFromInput || undefined}
                          endDate={exportDateToInput || undefined}
                          placeholderText="До"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={exportDateToTime}
                        onChange={(e) => setExportDateToTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                {activeFilterInput === 'shipmentDate' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={shipmentDateFromInput || undefined}
                          onChange={(date) => setShipmentDateFromInput(date)}
                          selectsStart
                          startDate={shipmentDateFromInput || undefined}
                          endDate={shipmentDateToInput || undefined}
                          placeholderText="С"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={shipmentDateFromTime}
                        onChange={(e) => setShipmentDateFromTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">—</span>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
                        <DatePicker
                          selected={shipmentDateToInput || undefined}
                          onChange={(date) => setShipmentDateToInput(date)}
                          selectsEnd
                          startDate={shipmentDateFromInput || undefined}
                          endDate={shipmentDateToInput || undefined}
                          placeholderText="До"
                          dateFormat="dd.MM.yyyy"
                          locale={ru}
                          className="w-48 pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="time"
                        value={shipmentDateToTime}
                        onChange={(e) => setShipmentDateToTime(e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleApplyFilter(activeFilterInput)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    (activeFilterInput === 'acceptanceDate' && !acceptanceDateFromInput && !acceptanceDateToInput) ||
                    (activeFilterInput === 'exportDate' && !exportDateFromInput && !exportDateToInput) ||
                    (activeFilterInput === 'shipmentDate' && !shipmentDateFromInput && !shipmentDateToInput)
                  }
                  aria-label="Применить фильтр"
                >
                  <CheckLineIcon />
                </button>
              </div>
            ) : (
              // UI для текстовых фильтров
              <>
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
          {orderNumber && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('orderNumber')}
            >
              <span>№ заказа: {orderNumber}</span>
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
              <span>Тип заказа: {orderType}</span>
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
              <span>Статус: {status}</span>
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
          {kisNumber && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('kisNumber')}
            >
              <span>№ КИС: {kisNumber}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('kisNumber');
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
          {hasFilter('acceptanceDate') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('acceptanceDate')}
            >
              <span>
                Дата приемки: {acceptanceDateFrom && formatDateForChip(acceptanceDateFrom, true)}
                {acceptanceDateFrom && acceptanceDateTo && ' — '}
                {acceptanceDateTo && formatDateForChip(acceptanceDateTo, true)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('acceptanceDate');
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
          {hasFilter('exportDate') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('exportDate')}
            >
              <span>
                Дата выгрузки заказа: {exportDateFrom && formatDateForChip(exportDateFrom, true)}
                {exportDateFrom && exportDateTo && ' — '}
                {exportDateTo && formatDateForChip(exportDateTo, true)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('exportDate');
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
          {hasFilter('shipmentDate') && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              onClick={() => handleEditFilter('shipmentDate')}
            >
              <span>
                Заявленная дата отгрузки: {shipmentDateFrom && formatDateForChip(shipmentDateFrom, true)}
                {shipmentDateFrom && shipmentDateTo && ' — '}
                {shipmentDateTo && formatDateForChip(shipmentDateTo, true)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilter('shipmentDate');
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
                    Дата выгрузки заказа
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
                  <button
                    type="button"
                    onClick={() => handleSort('shipmentDate')}
                    className="flex items-center gap-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Заявленная дата отгрузки
                    {sortBy === 'shipmentDate' && (
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
                          : (branch || counterparty || orderNumber || orderType || status || kisNumber || acceptanceDateFrom || acceptanceDateTo || exportDateFrom || exportDateTo || shipmentDateFrom || shipmentDateTo)
                          ? 'Ничего не найдено по выбранным фильтрам'
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
                        {formatDateTime(order.exportDate)}
                      </TableCell>

                      <TableCell className="px-3 py-2 text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap">
                        {formatDateTime(order.shipmentDate)}
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
                        {formatDateTime(order.acceptanceDate)}
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
