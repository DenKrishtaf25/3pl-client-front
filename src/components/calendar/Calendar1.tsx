"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { bitrixService } from "@/services/bitrix.service";
import { IInventoryRequest, IBitrixTask } from "@/types/inventory.types";
import { useUser } from "@/hooks/useUser";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, CheckLineIcon } from "@/icons";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    bitrixTask?: boolean;
    taskId?: string;
    status?: string;
    description?: string;
    clientTIN?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const { user } = useUser();
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]); // Выбранные клиенты (по умолчанию все)
  const [isClientFilterOpen, setIsClientFilterOpen] = useState(false);
  const clientFilterRef = useRef<HTMLDivElement>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>("");
  
  // Состояние для заявки на инвентаризацию
  const [inventoryRequest, setInventoryRequest] = useState<IInventoryRequest>({
    companyName: "",
    tin: "",
    inventoryDate: "",
    warehouse: "",
    contactPerson: "",
    phone: "",
    email: "",
    comment: ""
  });
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [bitrixLoading, setBitrixLoading] = useState(false);
  const [bitrixError, setBitrixError] = useState<string | null>(null);
  const [bitrixSuccess, setBitrixSuccess] = useState(false);

  useEffect(() => {
    // Инициализируем выбранные клиенты - по умолчанию все доступные
    if (user?.clients && user.clients.length > 0) {
      setSelectedClientIds(user.clients.map(client => client.id));
    }
    
    // Загружаем задачи из Битрикс24
    loadBitrixTasks();
    
    // Добавляем демо-события
    setEvents([
      {
        id: "demo-1",
        title: "Ваш план",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "demo-2",
        title: "Ваш факт",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "demo-3",
        title: "Доступные даты",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, [user]);
  
  // Сохраняем все задачи из Битрикс24 отдельно для фильтрации
  const [allBitrixTasks, setAllBitrixTasks] = useState<CalendarEvent[]>([]);

  // Фильтруем события при изменении выбранных клиентов
  useEffect(() => {
    setEvents(prevEvents => {
      const nonBitrixEvents = prevEvents.filter(event => !event.extendedProps.bitrixTask);
      
      // Если ничего не выбрано или выбраны все клиенты, показываем все задачи
      const allClientsCount = user?.clients?.length || 0;
      if (selectedClientIds.length === 0 || 
          (allClientsCount > 0 && selectedClientIds.length === allClientsCount)) {
        return [...nonBitrixEvents, ...allBitrixTasks];
      }
      
      // Фильтруем задачи по выбранным клиентам
      const filteredBitrixEvents = allBitrixTasks.filter(event => {
        const clientTIN = event.extendedProps.clientTIN as string;
        if (!clientTIN) return false;
        
        // Проверяем, есть ли клиент с таким ИНН в выбранных
        return user?.clients?.some(client => 
          selectedClientIds.includes(client.id) && client.TIN === clientTIN
        );
      });
      
      return [...nonBitrixEvents, ...filteredBitrixEvents];
    });
  }, [selectedClientIds, user, allBitrixTasks]);

  // Добавляем класс кнопке фильтра после монтирования календаря
  useEffect(() => {
    // Используем setTimeout для гарантии, что календарь уже отрендерился
    const timer = setTimeout(() => {
      const filterButton = document.querySelector('.fc-clientFilterButton-button') as HTMLElement;
      if (filterButton) {
        filterButton.classList.add('client-filter-button');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [events]);

  const loadBitrixTasks = async () => {
    try {
      const response = await bitrixService.getTasks();
      
      // Извлекаем массив задач из ответа Битрикс24
      const tasks = response.tasks || [];
      
      if (!Array.isArray(tasks)) {
        console.warn('Tasks is not an array:', tasks);
        return;
      }
      
      // Фильтруем только задачи, созданные через наш ЛК (содержат "инвентаризац" в названии)
      const inventoryTasks = tasks.filter((task: IBitrixTask | { title?: string; TITLE?: string }) => {
        const title = 'title' in task ? task.title : task.TITLE;
        return title && title.toLowerCase().includes('инвентаризац');
      });
      
      // Преобразуем задачи в события календаря
      const taskEvents: CalendarEvent[] = inventoryTasks.map((task: IBitrixTask | { title?: string; TITLE?: string; createdDate?: string; CREATED_DATE?: string; description?: string; DESCRIPTION?: string }) => {
        // Безопасно извлекаем дату из описания или используем дату создания
        let eventDate = new Date().toISOString().split("T")[0]; // По умолчанию сегодня
        
        // Пытаемся найти дату инвентаризации в описании
        const description = ('DESCRIPTION' in task ? task.DESCRIPTION : undefined) || ('description' in task ? task.description : undefined) || '';
        const dateMatch = description.match(/Дата инвентаризации: (\d{2}\.\d{2}\.\d{4})/);
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('.');
          eventDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          const createdDateValue = ('CREATED_DATE' in task ? task.CREATED_DATE : undefined) || ('createdDate' in task ? task.createdDate : undefined);
          if (createdDateValue) {
            // Пытаемся использовать дату создания, если она валидна
            try {
              const createdDate = new Date(createdDateValue);
              if (!isNaN(createdDate.getTime())) {
                eventDate = createdDate.toISOString().split("T")[0];
              }
            } catch {
              // Игнорируем ошибки парсинга даты
            }
          }
        }
        
        const taskId = ('ID' in task ? task.ID : undefined) || ('id' in task ? task.id : undefined) || '';
        const taskTitle = ('TITLE' in task ? task.TITLE : undefined) || ('title' in task ? task.title : undefined) || '';
        const taskStatus = ('STATUS' in task ? task.STATUS : undefined) || ('status' in task ? task.status : undefined) || '';
        const taskDescription = ('DESCRIPTION' in task ? task.DESCRIPTION : undefined) || ('description' in task ? task.description : undefined) || '';
        
        // Извлекаем ИНН клиента из описания для фильтрации
        const innMatch = taskDescription.match(/ИНН: (\d+)/);
        const clientTIN = innMatch ? innMatch[1] : '';
        
        return {
          id: `bitrix-${taskId}`,
          title: taskTitle,
          start: eventDate,
          allDay: true,
          extendedProps: { 
            calendar: "Warning", // Цвет для задач из Битрикс24
            bitrixTask: true,
            taskId: String(taskId),
            status: String(taskStatus),
            description: taskDescription,
            clientTIN: clientTIN // Сохраняем ИНН для фильтрации
          },
        };
      });
      
      // Сохраняем все задачи из Битрикс24
      setAllBitrixTasks(taskEvents);
      
      // Обновляем события: убираем старые задачи из Битрикс24 и добавляем новые
      setEvents(prevEvents => {
        const nonBitrixEvents = prevEvents.filter(event => !event.extendedProps.bitrixTask);
        // Применяем фильтр по клиентам
        const allClientsCount = user?.clients?.length || 0;
        if (selectedClientIds.length === 0 || 
            (allClientsCount > 0 && selectedClientIds.length === allClientsCount)) {
          return [...nonBitrixEvents, ...taskEvents];
        }
        
        const filteredTasks = taskEvents.filter(event => {
          const clientTIN = event.extendedProps.clientTIN as string;
          if (!clientTIN) return false;
          return user?.clients?.some(client => 
            selectedClientIds.includes(client.id) && client.TIN === clientTIN
          );
        });
        
        return [...nonBitrixEvents, ...filteredTasks];
      });
    } catch (error) {
      console.error('Failed to load Bitrix24 tasks:', error);
    }
  };


  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    // При клике на дату сразу переходим в режим создания заявки на инвентаризацию
    setIsInventoryMode(true);
    setInventoryRequest(prev => ({
      ...prev,
      inventoryDate: selectInfo.startStr
    }));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const extendedProps = event.extendedProps as { bitrixTask?: boolean; status?: string; description?: string };
    
    // Если это задача из Битрикс24, показываем информацию в модальном окне
    if (extendedProps.bitrixTask) {
      setSelectedEvent(event as unknown as CalendarEvent);
      openModal();
      return;
    }
    
    // Для обычных событий просто показываем информацию
    alert(`Событие: ${event.title}\nДата: ${event.start?.toLocaleDateString('ru-RU')}`);
  };

  const resetModalFields = () => {
    setSelectedEvent(null);
    setIsInventoryMode(false);
    setSelectedClientId("");
    setIsClientDropdownOpen(false);
    setInventoryRequest({
      companyName: "",
      tin: "",
      inventoryDate: "",
      warehouse: "",
      contactPerson: user?.name || "",
      phone: "",
      email: user?.email || "",
      comment: ""
    });
    setBitrixError(null);
    setBitrixSuccess(false);
  };

  const handleCreateInventoryRequest = async () => {
    setBitrixError(null);
    setBitrixLoading(true);

    try {
      // Валидация обязательных полей
      if (!selectedClientId || !inventoryRequest.inventoryDate || 
          !inventoryRequest.warehouse || !inventoryRequest.contactPerson || !inventoryRequest.phone || !inventoryRequest.email) {
        setBitrixError('Все поля обязательны для заполнения');
        setBitrixLoading(false);
        return;
      }

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inventoryRequest.email)) {
        setBitrixError('Неверный формат email');
        setBitrixLoading(false);
        return;
      }

      await bitrixService.createInventoryRequest(inventoryRequest);
      setBitrixSuccess(true);
      
      // Перезагружаем задачи из Битрикс24
      setTimeout(() => {
        loadBitrixTasks();
      }, 1000);
      
      // Скрыть сообщение об успехе через 5 секунд
      setTimeout(() => setBitrixSuccess(false), 5000);
      
      // Закрываем модальное окно через 2 секунды
      setTimeout(() => {
        closeModal();
        resetModalFields();
      }, 2000);
    } catch (error: unknown) {
      console.error('Failed to create inventory request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании заявки в Битрикс24';
      setBitrixError(errorMessage);
    } finally {
      setBitrixLoading(false);
    }
  };

  const handleClientFilterToggle = (clientId: string) => {
    setSelectedClientIds(prev => {
      if (prev.includes(clientId)) {
        // Убираем клиента из выбранных
        return prev.filter(id => id !== clientId);
      } else {
        // Добавляем клиента в выбранные
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAllClients = () => {
    if (user?.clients) {
      setSelectedClientIds(user.clients.map(client => client.id));
    }
  };

  const allClientsSelected = user?.clients && selectedClientIds.length === user.clients.length;
  const someClientsSelected = selectedClientIds.length > 0 && selectedClientIds.length < (user?.clients?.length || 0);

  // Фильтруем клиентов по поисковому запросу
  const filteredClients = user?.clients?.filter(client => {
    if (!clientSearchQuery.trim()) return true;
    const query = clientSearchQuery.toLowerCase();
    return (
      client.companyName.toLowerCase().includes(query) ||
      client.TIN.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] relative">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ruLocale}
          headerToolbar={{
            left: "prev,next clientFilterButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            clientFilterButton: {
              text: allClientsSelected || selectedClientIds.length === 0
                ? "Все клиенты"
                : someClientsSelected
                  ? `Выбрано: ${selectedClientIds.length} из ${user?.clients?.length || 0}`
                  : `Выбрано: ${selectedClientIds.length}`,
              click: () => {
                setIsClientFilterOpen(!isClientFilterOpen);
              },
            },
          }}
        />
        {/* Фильтр по клиентам - выпадающий список */}
        <div className="absolute left-6 top-20 z-50" ref={clientFilterRef}>
          <Dropdown
            isOpen={isClientFilterOpen}
            onClose={() => setIsClientFilterOpen(false)}
            className="w-80 max-h-64 overflow-y-auto"
          >
            {/* Поиск клиентов */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Поиск по имени или ИНН..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Чекбокс "Все клиенты" */}
            <DropdownItem
              onClick={() => {
                handleSelectAllClients();
              }}
            >
              <div className="flex items-center gap-2">
                {allClientsSelected && (
                  <CheckLineIcon className="w-4 h-4 text-blue-500" />
                )}
                {!allClientsSelected && (
                  <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded" />
                )}
                <span className="font-medium">Все клиенты</span>
              </div>
            </DropdownItem>
            
            {/* Разделитель */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            
            {/* Список клиентов */}
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <DropdownItem
                  key={client.id}
                  onClick={() => handleClientFilterToggle(client.id)}
                >
                  <div className="flex items-center gap-2">
                    {selectedClientIds.includes(client.id) && (
                      <CheckLineIcon className="w-4 h-4 text-blue-500" />
                    )}
                    {!selectedClientIds.includes(client.id) && (
                      <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded" />
                    )}
                    <span>{client.companyName}</span>
                    <span className="text-xs text-gray-500">({client.TIN})</span>
                  </div>
                </DropdownItem>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Клиенты не найдены
              </div>
            )}
          </Dropdown>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          {isInventoryMode ? (
            // Форма заявки на инвентаризацию
            <>
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  Заявка на инвентаризацию
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Создайте заявку на проведение инвентаризации. Заявка будет отправлена в Битрикс24.
                </p>
              </div>
              <div className="mt-8">
                {bitrixSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 mb-4">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Заявка успешно создана в Битрикс24!
                    </p>
                  </div>
                )}

                {bitrixError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 mb-4">
                    <p className="text-red-800 dark:text-red-200 text-sm">{bitrixError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Клиент <span className="text-red-500">*</span>
                    </label>
                    <div className="relative" ref={clientDropdownRef}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsClientDropdownOpen(!isClientDropdownOpen);
                        }}
                        className="client-select-button w-full px-4 py-3 pr-11 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm hover:shadow-md cursor-pointer text-left flex items-center justify-between h-11"
                      >
                        <span className={selectedClientId ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
                          {selectedClientId 
                            ? `${user?.clients?.find(c => c.id === selectedClientId)?.companyName} (ИНН: ${user?.clients?.find(c => c.id === selectedClientId)?.TIN})`
                            : "Выберите клиента"
                          }
                        </span>
                        <span className={`absolute right-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isClientDropdownOpen ? 'rotate-180' : ''}`}>
                          <ChevronDownIcon />
                        </span>
                      </button>
                      <Dropdown
                        isOpen={isClientDropdownOpen}
                        onClose={() => setIsClientDropdownOpen(false)}
                        className="right-0 w-full mt-1 max-h-60 overflow-y-auto"
                      >
                        {user?.clients?.map((client) => (
                          <DropdownItem
                            key={client.id}
                            onClick={() => {
                              setSelectedClientId(client.id);
                              setInventoryRequest(prev => ({
                                ...prev,
                                companyName: client.companyName,
                                tin: client.TIN
                              }));
                              setIsClientDropdownOpen(false);
                            }}
                            baseClassName="block w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                            className={selectedClientId === client.id ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium" : ""}
                          >
                            <div>
                              <div className="font-medium">{client.companyName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">ИНН: {client.TIN}</div>
                            </div>
                          </DropdownItem>
                        ))}
                      </Dropdown>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Дата инвентаризации <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={inventoryRequest.inventoryDate}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, inventoryDate: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Склад <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inventoryRequest.warehouse}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, warehouse: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="Склад №1"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Контактное лицо <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inventoryRequest.contactPerson}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="Иван Иванов"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Телефон <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={inventoryRequest.phone}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, phone: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={inventoryRequest.email}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, email: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="ivan@company.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Комментарий
                    </label>
                    <textarea
                      value={inventoryRequest.comment}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, comment: e.target.value }))}
                      className="dark:bg-dark-900 h-20 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="Дополнительная информация..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Закрыть
                </button>
                <button
                  onClick={handleCreateInventoryRequest}
                  disabled={bitrixLoading}
                  type="button"
                  className="btn btn-success btn-create-inventory flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                >
                  {bitrixLoading ? "Создание заявки..." : "Создать заявку"}
                </button>
              </div>
            </>
          ) : selectedEvent?.extendedProps.bitrixTask ? (
            // Просмотр задачи из Битрикс24
            <>
              <div>
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  Задача из Битрикс24
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Информация о заявке на инвентаризацию
                </p>
              </div>
              <div className="mt-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Название
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">{selectedEvent.title}</p>
                  </div>
                  {selectedEvent.extendedProps.status && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Статус
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">{selectedEvent.extendedProps.status}</p>
                    </div>
                  )}
                  {selectedEvent.extendedProps.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Описание
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {selectedEvent.extendedProps.description}
                      </div>
                    </div>
                  )}
                  {selectedEvent.start && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Дата
                      </label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(selectedEvent.start as string).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Закрыть
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
