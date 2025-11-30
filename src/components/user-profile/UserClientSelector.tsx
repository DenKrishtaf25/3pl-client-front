"use client";
import React, { useState, useMemo } from "react";
import { useSelectedClient } from "@/context/ClientContext";
import Input from "../form/input/InputField";

export default function UserClientSelector() {
  const { selectedClients, toggleClient, isClientSelected, allClients } = useSelectedClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация клиентов по поисковому запросу (всегда вызываем useMemo, чтобы соблюдать правила хуков)
  const filteredClients = useMemo(() => {
    if (!allClients || allClients.length === 0) {
      return [];
    }
    
    if (!searchQuery.trim()) {
      return allClients;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allClients.filter(client => 
      client.companyName.toLowerCase().includes(query) ||
      client.TIN.toLowerCase().includes(query)
    );
  }, [allClients, searchQuery]);

  // Проверка, все ли отфильтрованные клиенты выбраны
  const areAllFilteredSelected = filteredClients.length > 0 && 
    filteredClients.every(client => isClientSelected(client.id));

  // Если клиентов нет, не показываем селектор
  if (!allClients || allClients.length === 0) {
    return null;
  }

  // Если только один клиент, показываем только информацию (без выбора)
  if (allClients.length === 1) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h5 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Ваш клиент
        </h5>
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <svg
            className="w-5 h-5 fill-gray-500 dark:fill-gray-400"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2 3.5C2 2.67157 2.67157 2 3.5 2H16.5C17.3284 2 18 2.67157 18 3.5V16.5C18 17.3284 17.3284 18 16.5 18H3.5C2.67157 18 2 17.3284 2 16.5V3.5ZM3.5 3C3.22386 3 3 3.22386 3 3.5V16.5C3 16.7761 3.22386 17 3.5 17H16.5C16.7761 17 17 16.7761 17 16.5V3.5C17 3.22386 16.7761 3 16.5 3H3.5Z"
              fill="currentColor"
            />
          </svg>
          <div className="text-left">
            <div className="font-medium text-gray-700 dark:text-gray-300">{allClients[0].companyName}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              ИНН: {allClients[0].TIN}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h5 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Доступные клиенты
      </h5>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Выберите клиентов для отображения их данных. По умолчанию выбраны все клиенты.
        {selectedClients.length > 0 && (
          <span className="ml-2 text-brand-600 dark:text-brand-400 font-medium">
            (Выбрано: {selectedClients.length} из {allClients.length})
          </span>
        )}
      </p>
      
      <div className="relative">
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
          Клиенты
        </label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2 3.5C2 2.67157 2.67157 2 3.5 2H16.5C17.3284 2 18 2.67157 18 3.5V16.5C18 17.3284 17.3284 18 16.5 18H3.5C2.67157 18 2 17.3284 2 16.5V3.5ZM3.5 3C3.22386 3 3 3.22386 3 3.5V16.5C3 16.7761 3.22386 17 3.5 17H16.5C16.7761 17 17 16.7761 17 16.5V3.5C17 3.22386 16.7761 3 16.5 3H3.5Z"
                fill="currentColor"
              />
              <path
                d="M5 7C5 6.72386 5.22386 6.5 5.5 6.5H14.5C14.7761 6.5 15 6.72386 15 7C15 7.27614 14.7761 7.5 14.5 7.5H5.5C5.22386 7.5 5 7.27614 5 7Z"
                fill="currentColor"
              />
              <path
                d="M5 10C5 9.72386 5.22386 9.5 5.5 9.5H14.5C14.7761 9.5 15 9.72386 15 10C15 10.2761 14.7761 10.5 14.5 10.5H5.5C5.22386 10.5 5 10.2761 5 10Z"
                fill="currentColor"
              />
              <path
                d="M5.5 12.5C5.22386 12.5 5 12.7239 5 13C5 13.2761 5.22386 13.5 5.5 13.5H10.5C10.7761 13.5 11 13.2761 11 13C11 12.7239 10.7761 12.5 10.5 12.5H5.5Z"
                fill="currentColor"
              />
            </svg>
            <div className="text-left">
              <div className="font-medium">
                {selectedClients.length === allClients.length 
                  ? 'Все клиенты' 
                  : selectedClients.length === 0
                    ? 'Не выбрано'
                    : `Выбрано: ${selectedClients.length}`
                }
              </div>
              {selectedClients.length > 0 && selectedClients.length < allClients.length && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedClients.map(c => c.companyName).join(', ')}
                </div>
              )}
            </div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                    Выберите клиентов
                  </div>
                  <div className="flex-1 max-w-xs ml-4">
                    <Input
                      type="text"
                      placeholder="Поиск по имени или ИНН..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
                
                {/* Кнопка "Выбрать всех" */}
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={areAllFilteredSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Выбираем всех отфильтрованных клиентов
                          filteredClients.forEach(client => {
                            if (!isClientSelected(client.id)) {
                              toggleClient(client);
                            }
                          });
                        } else {
                          // Снимаем выбор со всех отфильтрованных клиентов
                          filteredClients.forEach(client => {
                            if (isClientSelected(client.id)) {
                              toggleClient(client);
                            }
                          });
                        }
                      }}
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {areAllFilteredSelected ? 'Снять выбор со всех' : 'Выбрать всех'}
                    </span>
                  </label>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                    <label
                      key={client.id}
                      className="flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isClientSelected(client.id)}
                        onChange={() => toggleClient(client)}
                        className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {client.companyName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ИНН: {client.TIN}
                        </div>
                      </div>
                    </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

