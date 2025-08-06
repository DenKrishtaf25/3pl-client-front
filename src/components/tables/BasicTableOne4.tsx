import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Order {
  id: number;
  date: string;
  number: string;
  sum: number;
  legalEntity: string;
  branch: string;
  status: string;
  comments: string;
}

const tableData: Order[] = [
  {
    id: 1,
    date: "01.02.2023",
    number: "3ПЛКОД-24/3",
    sum: 51000,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
  {
    id: 2,
    date: "12.02.2022",
    number: "3ПЛКОД-24/3123000112",
    sum: 30720,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
  {
    id: 3,
    date: "01.02.2023",
    number: "3ПЛКОД-24/3",
    sum: 51000,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
  {
    id: 4,
    date: "12.02.2022",
    number: "3ПЛКОД-24/3123000112",
    sum: 30720,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
  {
    id: 5,
    date: "01.02.2023",
    number: "3ПЛКОД-24/3",
    sum: 51000,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
  {
    id: 6,
    date: "12.02.2022",
    number: "3ПЛКОД-24/3123000112",
    sum: 30720,
    legalEntity: "СДЕДАЙ СВОИМИ РУКАМИ",
    branch: "Литвиново 3PL_ОБИ",
    status: "Запрос документов",
    comments: "Необходимо предоставить УПД"
  },
];

export default function BasicTableOne() {
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
                  Дата поступления
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Номер претензии
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
                  Юр. Лицо
                </TableCell>
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
                  Статус
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Комментарий
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.date}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {order.number}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.sum}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.legalEntity}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.branch}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.status}
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.comments}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
