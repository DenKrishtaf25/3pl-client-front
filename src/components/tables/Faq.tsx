"use client";
import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

const faqData = [
  {
    question: "Что означает тип обработки?",
    answer:
      "Тип обработки определяет, как именно осуществляется приёмка или отгрузка груза: вручную, автоматически, либо комплексно.",
  },
  {
    question: "Как работает фильтрация?",
    answer:
      "Фильтрация позволяет отобразить только те строки таблицы, которые соответствуют введённым параметрам — например, по филиалу или номеру ТС.",
  },
  {
    question: "Можно ли редактировать данные в таблице?",
    answer:
      "В текущей версии таблица только для просмотра. Возможность редактирования можно добавить при необходимости.",
  },
  {
    question: "Что означает статус ТС?",
    answer:
      "Статус транспортного средства отображает его текущее состояние — например, 'В пути', 'На территории', 'Разгрузка завершена' и т.д.",
  },
  {
    question: "Откуда берётся плановое время прибытия?",
    answer:
      "План прибытия формируется на основе заявки или маршрутного листа, предоставленного перевозчиком или складом.",
  },
  {
    question: "Как рассчитываются часы опоздания?",
    answer:
      "Разница между фактическим временем прибытия и запланированным временем. Если транспорт приехал позже — время фиксируется как опоздание.",
  },
  {
    question: "Можно ли экспортировать данные из таблицы?",
    answer:
      "Да, при необходимости можно добавить функциональность экспорта в Excel, CSV или PDF. По умолчанию она отключена.",
  },
];


export default function FAQSection() {
  return (
      <div className="space-y-2">
        {faqData.map((item, index) => (
          <Disclosure key={index}>
            {({ open }) => (
              <div className="rounded-md border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] overflow-hidden">
                <Disclosure.Button className="flex w-full justify-between items-center px-4 py-3 text-sm font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05] transition">
                  <span>{item.question}</span>
                  <ChevronDown
                    className={clsx(
                      "w-4 h-4 transform transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </Disclosure.Button>

                <div
                  className={clsx(
                    "transition-all duration-300 ease-in-out overflow-hidden px-4",
                    open ? "max-h-40 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
                  )}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
  );
}