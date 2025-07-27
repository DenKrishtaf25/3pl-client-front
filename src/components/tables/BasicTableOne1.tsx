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
  warehouse: string;
  nomenclature: string;
  article: string;
  budget: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    warehouse: "Екатеринбург",
    nomenclature: "Упаковка ECO OpSalad 500 Black Edition (300 шт./кор.)",
    article: "УТ000000000000018267",
    budget: "3.9K",
  },
  {
    id: 2,
    warehouse: "Москва",
    nomenclature: "Кронштейн BAFF HN 40-80L",
    article: "(СГ-6208) Ручка шариковая",
    budget: "24.9K",
  },
  {
    id: 3,
    warehouse: "Ярославль",
    nomenclature: "Эля в белорусском костюме Кукла пластмассовая",
    article: "(СГ-6343) Блокнот Стандар",
    budget: "12.7K",
  },
  {
    id: 4,
    warehouse: "Владимир",
    nomenclature: "Чехол Luazon, для iPhone 7\\/8\\/SE (2020), силиконовый, тонкий, прозрачный",
    article: "ЕР-00003857",
    budget: "2.8K",
  },
  {
    id: 5,
    warehouse: "Кастрома",
    nomenclature: "Туалетная бумага Linia Veiro Classic, Желтый, 2 слоя, 4 рулона.",
    article: "ИН00303 - брак",
    budget: "4.5K",
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
              {tableData.map((order) => (
                <TableRow key={order.id}>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.warehouse}
                  </TableCell>

                  <TableCell className="px-5 py-4 text-gray-500 sm:px-6 text-start text-theme-sm dark:text-gray-400">
                    {order.nomenclature}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.article}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.budget}
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
