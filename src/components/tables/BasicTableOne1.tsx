"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useSelectedClient } from "@/context/ClientContext";
import { stockService, IStock } from "@/services/stock.service";

export default function BasicTableOne() {
  const { selectedClients } = useSelectedClient();
  const [stocks, setStocks] = useState<IStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStocks();
  }, [selectedClients]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем ИНН выбранных клиентов
      const clientTINs = selectedClients.map(client => client.TIN);
      
      // Загружаем данные
      const data = await stockService.getStocks(clientTINs);
      setStocks(data);
    } catch (err: any) {
      console.error('Failed to load stocks:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  return (
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
                  Артикул
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Остаток
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
              ) : stocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-4 py-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      {selectedClients.length === 0 
                        ? 'Выберите клиентов для отображения данных' 
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
  );
}
