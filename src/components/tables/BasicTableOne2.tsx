"use client";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale";
import { CalendarDays, Plus, Search, Trash2, X } from "lucide-react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useModal } from "../../hooks/useModal";

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
  type: string;
  orderNumber: number;
  kisNumber: string;
  unloadingDate: string;
  status: string;
  counterparty: string;
  acceptanceDate: string;
  shippingPlan: string;
  packagingPlan: number;
  packagingFact: number;
  linePlan: number;
  lineFact: number;
}

const tableData: Order[] = [
  {
    id: 1,
    warehouse: "Литвиново",
    type: "Приход",
    orderNumber: 10007,
    kisNumber: "PR002456625DIS",
    unloadingDate: "12.20.2025",
    status: "Новая",
    counterparty: "Яшин Алексей Валерьевич",
    acceptanceDate: "12.20.2025",
    shippingPlan: "12.20.2025 13:30",
    packagingPlan: 123,
    packagingFact: 3214,
    linePlan: 3453,
    lineFact: 58968,
  },
  {
    id: 2,
    warehouse: "Литвиново",
    type: "Приход",
    orderNumber: 10007,
    kisNumber: "PR002456625DIS",
    unloadingDate: "12.20.2025",
    status: "Новая",
    counterparty: "Яшин Алексей Валерьевич",
    acceptanceDate: "12.20.2025",
    shippingPlan: "12.20.2025 13:30",
    packagingPlan: 123,
    packagingFact: 3214,
    linePlan: 3453,
    lineFact: 58968,
  },
  {
    id: 3,
    warehouse: "Литвиново",
    type: "Приход",
    orderNumber: 10007,
    kisNumber: "PR002456625DIS",
    unloadingDate: "12.20.2025",
    status: "Новая",
    counterparty: "Яшин Алексей Валерьевич",
    acceptanceDate: "12.20.2025",
    shippingPlan: "12.20.2025 13:30",
    packagingPlan: 123,
    packagingFact: 3214,
    linePlan: 3453,
    lineFact: 58968,
  },
  {
    id: 4,
    warehouse: "Литвиново",
    type: "Приход",
    orderNumber: 10007,
    kisNumber: "PR002456625DIS",
    unloadingDate: "12.20.2025",
    status: "Новая",
    counterparty: "Яшин Алексей Валерьевич",
    acceptanceDate: "12.20.2025",
    shippingPlan: "12.20.2025 13:30",
    packagingPlan: 123,
    packagingFact: 3214,
    linePlan: 3453,
    lineFact: 58968,
  },
];

export default function BasicTableOne() {

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-4">
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
            <button className="flex gap-1 px-2 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Search size={20} />
              Найти
            </button>
            <button
              className="flex gap-1 px-2 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
            >
              <X size={20} />
              Очистить
            </button>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex gap-1 px-2 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          Создать заказ
        </button>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Создание заказа
              </h4>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Необходимые колонки
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Филиал</Label>
                      <Input type="text" defaultValue="Литвиново" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Тип заказа</Label>
                      <Input type="text" defaultValue="Приход" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Номер заказа</Label>
                      <Input type="text" defaultValue="10007" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Номер заказа КИС</Label>
                      <Input type="text" defaultValue="+PR002456625DIS" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Контрагент</Label>
                      <Input type="text" defaultValue="10007" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Упаковок план</Label>
                      <Input type="text" defaultValue="105" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Упаковок план</Label>
                      <Input type="text" defaultValue="10007" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Строк план</Label>
                      <Input type="text" defaultValue="105" />
                    </div>

                    <div className="col-span-2">
                      <Label>Строк факт</Label>
                      <Input type="text" defaultValue="105" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Закрыть
                </Button>
                <Button className="flex gap-1" size="sm" onClick={handleSave}>
                  <Plus size={20} />
                  Создать
                </Button>
              </div>
            </form>
          </div>
        </Modal>
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
        <button className="flex gap-1 px-2 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
          <Trash2 size={18} />
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
                    Тип заказа
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Номер заказа
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Номер КИС
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Дата выгрузки
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Статус
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Контрагент
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Дата приемки
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    План откгрузки
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Упаковок план
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Упаковок факт
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Строк план
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Строк факт
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
                      {order.type}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.orderNumber}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.kisNumber}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.unloadingDate}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.status}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.counterparty}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.acceptanceDate}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.shippingPlan}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.packagingPlan}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.packagingFact}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.linePlan}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.lineFact}
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
