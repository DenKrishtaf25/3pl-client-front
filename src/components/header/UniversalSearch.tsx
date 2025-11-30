"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { registryService, IRegistry } from "@/services/registry.service";
import { stockService, IStock } from "@/services/stock.service";
import { adminClientService } from "@/services/admin-client.service";
import { IClient } from "@/types/auth.types";
import Link from "next/link";

interface SearchResult {
  type: "registry" | "stock" | "client" | "warehouse";
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

const warehouses = [
  { city: "Москва (Литвиново)", address: "141533 Московская область, Солнечногорский район, д. Шелепаново, стр. 152/2" },
  { city: "Москва (Томилино)", address: "140073, Россия, Московская область, городской округ Люберцы, рабочий посёлок Томилино, микрорайон Птицефабрика, к9" },
  { city: "Москва (Чехов)", address: "142326, МО, Чеховский район, село Новоселки, промзона Новоселки, владение 19, строение 5" },
  { city: "г. Москва (Шолохово)", address: "141052, Российская Федерация, Московская область, г. Мытищи, д. Шолохово, ш. Дмитровское, строение 8А" },
  { city: "г. Алматы", address: "Казахстан, Алматы, ул. Казыбаева, д. 3/2" },
];

export default function UniversalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Обработка горячей клавиши Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchAll = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const [registriesResult, stocksResult, clientsResult] = await Promise.allSettled([
        registryService.getPaginated({ search: searchQuery, limit: 5, page: 1 }),
        stockService.getPaginated({ search: searchQuery, limit: 5, page: 1 }),
        adminClientService.getPaginated({ search: searchQuery, limit: 5, page: 1 }),
      ]);

      const allResults: SearchResult[] = [];

      // Обработка реестров
      if (registriesResult.status === "fulfilled") {
        const registries = registriesResult.value.data || [];
        registries.forEach((item: IRegistry) => {
          allResults.push({
            type: "registry",
            id: item.id,
            title: `Заказ №${item.orderNumber}`,
            subtitle: `${item.branch} • ${item.counterparty}`,
            url: "/registry",
          });
        });
      }

      // Обработка остатков
      if (stocksResult.status === "fulfilled") {
        const stocks = stocksResult.value.data || [];
        stocks.forEach((item: IStock) => {
          allResults.push({
            type: "stock",
            id: item.id,
            title: item.nomenclature || item.article,
            subtitle: `Артикул: ${item.article} • Склад: ${item.warehouse}`,
            url: "/stock",
          });
        });
      }

      // Обработка клиентов
      if (clientsResult.status === "fulfilled") {
        const clients = clientsResult.value.data || [];
        clients.forEach((item: IClient) => {
          allResults.push({
            type: "client",
            id: item.id,
            title: item.companyName,
            subtitle: `ИНН: ${item.TIN}`,
            url: "/profile",
          });
        });
      }

      // Поиск по складам (локальный поиск)
      const searchLower = searchQuery.toLowerCase();
      warehouses.forEach((warehouse, index) => {
        if (
          warehouse.city.toLowerCase().includes(searchLower) ||
          warehouse.address.toLowerCase().includes(searchLower)
        ) {
          allResults.push({
            type: "warehouse",
            id: `warehouse-${index}`,
            title: warehouse.city,
            subtitle: warehouse.address,
            url: "/wherehouse",
          });
        }
      });

      setResults(allResults.slice(0, 10)); // Ограничиваем до 10 результатов
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchAll(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchAll]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Обработка клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "registry":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case "stock":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3h10v10H3V3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M6 6h4M6 9h4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case "client":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M3 14c0-3 2-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case "warehouse":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6l6-4 6 4v8H2V6z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 2v12M2 6h12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
    }
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "registry":
        return "Заказ";
      case "stock":
        return "Остаток";
      case "client":
        return "Клиент";
      case "warehouse":
        return "Склад";
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form>
        <div className="relative">
          <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true);
              }
            }}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
          />

          <button
            type="button"
            className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
          >
            <span> ⌘ </span>
            <span> K </span>
          </button>
        </div>
      </form>

      {/* Результаты поиска */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-theme-lg max-h-[400px] overflow-y-auto z-50 xl:w-[430px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Поиск...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedIndex === index ? "bg-gray-50 dark:bg-gray-800" : ""
                  }`}
                >
                  <div className="mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Ничего не найдено
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

