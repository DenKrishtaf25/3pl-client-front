"use client";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Order {
  id: number;
  warehouse: string;
  nomenclature: string;
  article: string;
  budget: string;
  number: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    warehouse: "Екатеринбург",
    nomenclature: "Коваленкоо К.А,",
    article: "УТ000000000000018267",
    budget: "3.9K",
    number: "Н 853 ТВ 799",
  },
  {
    id: 2,
    warehouse: "Москва",
    nomenclature: "Коваленкоо К.А,",
    article: "(СГ-6208) Ручка шариковая",
    budget: "24.9K",
    number: "Н 853 ТВ 799",
  },
  {
    id: 3,
    warehouse: "Ярославль",
    nomenclature: "Коваленкоо К.А.",
    article: "(СГ-6343) Блокнот Стандар",
    budget: "12.7K",
    number: "Н 853 ТВ 799",
  },
  {
    id: 4,
    warehouse: "Владимир",
    nomenclature: "Макеев Алексей Григорьевич",
    article: "ЕР-00003857",
    budget: "2.8K",
    number: "Н 853 ТВ 799",
  },
  {
    id: 5,
    warehouse: "Кастрома",
    nomenclature: "Лапшин Евгений Александрович",
    article: "ИН00303 - брак",
    budget: "4.5K",
    number: "Н 853 ТВ 799",
  },
];

export default function BasicTableOne() {

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="space-y-4">


      <div
        className="flex flex-wrap gap-4 p-4 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
        <div className="flex flex-col relative">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1">Дата с</label>
          <CalendarDays className="w-4 h-4 absolute left-3 top-[38px] -translate-y-1/2 text-gray-400 pointer-events-none z-[1]" />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
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
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Выберите дату"
            dateFormat="dd.MM.yyyy"
            locale={ru}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-end gap-2">
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Поиск
          </button>
          <button
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Очистить
          </button>
        </div>
      </div>

      <div
        className="flex justify-between flex-wrap gap-4 p-4 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
        <input
          type="text"
          placeholder="Филиал"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Тип прихода"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Номер заказа"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="Номер ТС"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="ФИО водителя"
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <select
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="">Тип обработки</option>
          <option value="ручная">Ручная</option>
          <option value="автомат">Автомат</option>
        </select>
        <button
          className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          Сбросить
        </button>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
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
                    Филиал
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Тип прихода
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Номер заказа или маршрутного листа
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Номер ТС
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    ФИО водителя
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Тип обработки
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Прибытия по заявке
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    План прибытия
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Факт прибытия
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Убытия
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Тип прибытия
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Часов опоздания
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Часов на территории
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Статутс ТС
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((order) => (
                  <TableRow key={order.id}>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.budget}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.article}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.number}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                      {order.nomenclature}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.budget}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {order.budget}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.warehouse}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
