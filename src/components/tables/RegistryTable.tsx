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

export default function RegistryTable() {
  const { selectedClients } = useSelectedClient();
  const [registries, setRegistries] = useState<IRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clientTINs = selectedClients.map(client => client.TIN);
      
      const data = await registryService.getRegistries(clientTINs);
      setRegistries(data);
    } catch (err: unknown) {
      console.error('Failed to load registries:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [selectedClients]);

  useEffect(() => {
    loadRegistries();
  }, [loadRegistries]);

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
                № заказа
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
                Приемка
              </TableCell>
              <TableCell
                isHeader
                className="px-3 py-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
              >
                Отгрузка
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
              ) : registries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {selectedClients.length === 0 
                        ? 'Выберите клиентов для отображения данных' 
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
  );
}

