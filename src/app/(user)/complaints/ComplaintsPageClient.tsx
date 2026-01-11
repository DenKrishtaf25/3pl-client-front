"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComplaintsTable from "@/components/tables/ComplaintsTable";
import ComplaintsStatusStatsTable from "@/components/tables/ComplaintsStatusStatsTable";
import ComplaintsTypeStatsTable from "@/components/tables/ComplaintsTypeStatsTable";
import { Download, RotateCw } from "lucide-react";
import { complaintsService } from "@/services/complaints.service";

export default function ComplaintsPageClient() {
  const [exportFn, setExportFn] = useState<(() => void | Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastImportAt, setLastImportAt] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const refreshKeyRef = useRef(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastExportTimeRef = useRef<number>(0);
  const EXPORT_COOLDOWN = 3000; // 3 секунды между экспортами

  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const meta = await complaintsService.getLastImportMeta();
        setLastImportAt(meta.lastImportAt);
      } catch (error) {
        console.error('Failed to load last import date:', error);
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchLastImport();
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleExportReady = (fn: () => void | Promise<void>) => {
    setExportFn(() => fn);
    setIsLoading(false);
  };

  const handleExport = async () => {
    if (!exportFn || isExporting) return;
    
    // Проверяем cooldown (время с последнего экспорта)
    const now = Date.now();
    const timeSinceLastExport = now - lastExportTimeRef.current;
    
    if (timeSinceLastExport < EXPORT_COOLDOWN) {
      const remainingSeconds = Math.ceil((EXPORT_COOLDOWN - timeSinceLastExport) / 1000);
      alert(`Пожалуйста, подождите ${remainingSeconds} секунд перед следующим экспортом`);
      return;
    }
    
    setIsExporting(true);
    lastExportTimeRef.current = now;
    
    try {
      await exportFn();
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    // Защита от множественных кликов
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Очищаем предыдущий таймаут если есть
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    try {
      // Обновляем метаданные
      const meta = await complaintsService.getLastImportMeta();
      setLastImportAt(meta.lastImportAt);
      
      // Принудительно обновляем таблицу через изменение key
      refreshKeyRef.current += 1;
      
      // Минимальная задержка для визуальной обратной связи
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      // Устанавливаем таймаут для сброса состояния через 1 секунду
      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}.${month}.${year} ${hours}:${minutes}`;
    } catch {
      return '-';
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Рекламации" />
      <div className="space-y-6">
        <ComponentCard title="Статистика по статусам">
          <ComplaintsStatusStatsTable />
        </ComponentCard>
        <ComponentCard title="Статистика по типу претензии">
          <ComplaintsTypeStatsTable />
        </ComponentCard>
        <ComponentCard 
          title="Данные рекламаций"
          action={
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-0.5 text-sm text-gray-600 dark:text-gray-400">
                <span>Актуально на:</span>
                {loadingMeta ? (
                  <span className="text-gray-400 dark:text-gray-500">Загрузка...</span>
                ) : (
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {formatDateTime(lastImportAt)}
                  </span>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Обновить данные"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Обновить
              </button>
              <button
                onClick={handleExport}
                disabled={!exportFn || isLoading || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title={isExporting ? "Экспорт выполняется..." : "Экспорт в Excel"}
              >
                <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                {isExporting ? 'Экспорт...' : 'Экспорт'}
              </button>
            </div>
          }
        >
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Загрузка...</span>
              </div>
            </div>
          }>
            <ComplaintsTable key={refreshKeyRef.current} onExportReady={handleExportReady} />
          </Suspense>
        </ComponentCard>
      </div>
    </div>
  );
}

