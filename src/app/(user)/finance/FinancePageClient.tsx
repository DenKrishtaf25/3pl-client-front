"use client";
import React, { useState, useEffect, useRef } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FinanceTable from "@/components/tables/FinanceTable";
import StatusStatsTable from "@/components/tables/StatusStatsTable";
import { Download, RotateCw, Plus } from "lucide-react";
import { financeService } from "@/services/finance.service";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import { emailService } from "@/services/email.service";
import { useUser } from "@/hooks/useUser";

export default function FinancePageClient() {
  const { user } = useUser();
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
  
  const { isOpen, openModal, closeModal } = useModal();
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  const [complaintData, setComplaintData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    position: "",
    description: ""
  });

  // Обновляем email при изменении user
  useEffect(() => {
    if (user?.email) {
      setComplaintData(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const meta = await financeService.getLastImportMeta();
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
      const meta = await financeService.getLastImportMeta();
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

  const resetModalFields = () => {
    setComplaintData({
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      position: "",
      description: ""
    });
    setEmailError(null);
    setEmailSuccess(false);
  };

  const handleCreateComplaint = async () => {
    setEmailError(null);
    setEmailLoading(true);

    try {
      // Валидация обязательных полей
      if (!complaintData.firstName || !complaintData.lastName || 
          !complaintData.email || !complaintData.phone || 
          !complaintData.position || !complaintData.description) {
        setEmailError('Все поля обязательны для заполнения');
        setEmailLoading(false);
        return;
      }

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(complaintData.email)) {
        setEmailError('Неверный формат email');
        setEmailLoading(false);
        return;
      }

      await emailService.sendFinancialComplaint(complaintData);
      setEmailSuccess(true);
      
      // Скрыть сообщение об успехе через 5 секунд
      setTimeout(() => setEmailSuccess(false), 5000);
      
      // Закрываем модальное окно через 2 секунды
      setTimeout(() => {
        closeModal();
        resetModalFields();
      }, 2000);
    } catch (error: unknown) {
      console.error('Failed to send financial complaint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при отправке претензии на email';
      setEmailError(errorMessage);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Финансовые претензии" />
      <div className="mb-6">
        <button
          onClick={() => {
            resetModalFields();
            openModal();
          }}
          className="flex gap-1 px-2 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          Подать претензию
        </button>
      </div>
      
      <Modal isOpen={isOpen} onClose={() => { closeModal(); resetModalFields(); }} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Подача финансовой претензии
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Создайте финансовую претензию. Претензия будет отправлена на email.
            </p>
          </div>
          
          {emailSuccess && (
            <div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">Претензия успешно отправлена на email!</p>
            </div>
          )}
          
          {emailError && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{emailError}</p>
            </div>
          )}
          
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Данные отправителя
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Имя</Label>
                    <Input 
                      type="text" 
                      value={complaintData.firstName}
                      onChange={(e) => setComplaintData({ ...complaintData, firstName: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Фамилия</Label>
                    <Input 
                      type="text" 
                      value={complaintData.lastName}
                      onChange={(e) => setComplaintData({ ...complaintData, lastName: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Почта</Label>
                    <Input 
                      type="email" 
                      value={complaintData.email}
                      onChange={(e) => setComplaintData({ ...complaintData, email: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Телефон</Label>
                    <Input 
                      type="tel" 
                      value={complaintData.phone}
                      onChange={(e) => setComplaintData({ ...complaintData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Должность</Label>
                    <Input 
                      type="text" 
                      value={complaintData.position}
                      onChange={(e) => setComplaintData({ ...complaintData, position: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Опишите вашу претензию</Label>
                    <textarea
                      value={complaintData.description}
                      onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                      className="w-full min-h-[120px] px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
                      placeholder="Введите описание претензии..."
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => { closeModal(); resetModalFields(); }}>
                Закрыть
              </Button>
              <Button 
                size="sm" 
                onClick={handleCreateComplaint}
                disabled={emailLoading}
              >
                {emailLoading ? "Отправка претензии..." : "Отправить"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="space-y-6">
        <ComponentCard title="Статистика по статусам">
          <StatusStatsTable />
        </ComponentCard>
        <ComponentCard 
          title="Данные финансовых претензий"
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
          <FinanceTable key={refreshKeyRef.current} onExportReady={handleExportReady} />
        </ComponentCard>
      </div>
    </div>
  );
}

