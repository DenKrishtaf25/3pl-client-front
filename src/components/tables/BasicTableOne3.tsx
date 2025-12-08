"use client";
import React from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
import { useModal } from "../../hooks/useModal";
import { Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Order {
  id: number;
  status: string;
  sum: number;
  quantity: number;
}

const tableData: Order[] = [
  {
    id: 1,
    status: "Анулированная",
    sum: 51000,
    quantity: 27
  },
  {
    id: 2,
    status: "в работе у 3PL",
    sum: 151000,
    quantity: 1
  },
  {
    id: 3,
    status: "в работе у юристов",
    sum: 4451000,
    quantity: 4
  },
  {
    id: 4,
    status: "Закрыто/оплата",
    sum: 2251000,
    quantity: 259
  },
  {
    id: 5,
    status: "Закрыто/отказ",
    sum: 51012300,
    quantity: 32
  },
];

export default function BasicTableOne() {

  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    closeModal();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex gap-1 px-2 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
        <Plus size={20} />
        Написать претензию
      </button>


      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Подача претензии
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Данные отправителя
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Имя</Label>
                    <Input type="text" defaultValue="Марина" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Фамилия</Label>
                    <Input type="text" defaultValue="Медведь" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Почта</Label>
                    <Input type="text" defaultValue="randomuser@pimjo.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Телефон</Label>
                    <Input type="text" defaultValue="+7 363 398 46 23" />
                  </div>

                  <div className="col-span-2">
                    <Label>Должность</Label>
                    <Input type="text" defaultValue="Team Manager" />
                  </div>
                  <div className="col-span-2">
                    <TextAreaInput />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Закрыть
              </Button>
              <Button size="sm" onClick={handleSave}>
                Отпраить
              </Button>
            </div>
          </form>
        </div>
      </Modal>



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
                    Статус
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Сумма
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Количество
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((order) => (
                  <TableRow key={order.id}>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.status}
                    </TableCell>

                    <TableCell className="px-5 py-4 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                      {order.sum}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {order.quantity}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
