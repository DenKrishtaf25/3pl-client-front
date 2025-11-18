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

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    bitrixTask?: boolean;
    taskId?: string;
    status?: string;
    description?: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  
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
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [bitrixLoading, setBitrixLoading] = useState(false);
  const [bitrixError, setBitrixError] = useState<string | null>(null);
  const [bitrixSuccess, setBitrixSuccess] = useState(false);

  const calendarsEvents = {
    "Критично": "danger",
    "Успешно": "success",
    "Обычное": "primary",
    "Важно": "warning",
  };

  useEffect(() => {
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
  }, []);

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
            description: taskDescription
          },
        };
      });
      
      // Обновляем события: убираем старые задачи из Битрикс24 и добавляем новые
      setEvents(prevEvents => {
        const nonBitrixEvents = prevEvents.filter(event => !event.extendedProps.bitrixTask);
        return [...nonBitrixEvents, ...taskEvents];
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
    
    // Если это задача из Битрикс24, показываем специальную информацию
    if (extendedProps.bitrixTask) {
      alert(`Задача из Битрикс24:\n\nНазвание: ${event.title}\nСтатус: ${extendedProps.status}\nОписание:\n${extendedProps.description || 'Нет описания'}`);
      return;
    }
    
    // Обычная обработка для локальных событий
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
              ...event,
              title: eventTitle,
              start: eventStartDate,
              end: eventEndDate,
              extendedProps: { calendar: eventLevel },
            }
            : event
        )
      );
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
    setIsInventoryMode(false);
    setInventoryRequest({
      companyName: "",
      tin: "",
      inventoryDate: "",
      warehouse: "",
      contactPerson: "",
      phone: "",
      email: "",
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
      if (!inventoryRequest.companyName || !inventoryRequest.tin || !inventoryRequest.inventoryDate || 
          !inventoryRequest.warehouse || !inventoryRequest.contactPerson || !inventoryRequest.phone || !inventoryRequest.email) {
        setBitrixError('Все поля обязательны для заполнения');
        setBitrixLoading(false);
        return;
      }

      // Валидация ИНН
      const tinRegex = /^\d{10}$|^\d{12}$/;
      if (!tinRegex.test(inventoryRequest.tin)) {
        setBitrixError('ИНН должен содержать 10 или 12 цифр');
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
    } catch (error: unknown) {
      console.error('Failed to create inventory request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании заявки в Битрикс24';
      setBitrixError(errorMessage);
    } finally {
      setBitrixLoading(false);
    }
  };


  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ruLocale}
          headerToolbar={{
            left: "prev,next addEventButton inventoryButton refreshButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Новое событие +",
              click: () => {
                resetModalFields();
                setIsInventoryMode(false);
                openModal();
              },
            },
            inventoryButton: {
              text: "Заявка на инвентаризацию",
              click: () => {
                resetModalFields();
                setIsInventoryMode(true);
                openModal();
              },
            },
            refreshButton: {
              text: "Обновить задачи",
              click: () => {
                loadBitrixTasks();
              },
            },
          }}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {isInventoryMode 
                ? "Заявка на инвентаризацию" 
                : selectedEvent 
                  ? "Редактировать событие" 
                  : "Добавить событие"
              }
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isInventoryMode 
                ? "Создайте заявку на проведение инвентаризации. Заявка будет отправлена в Битрикс24."
                : "Запланируйте важное: добавьте или отредактируйте событие, чтобы не забыть"
              }
            </p>
          </div>
          <div className="mt-8">
            {isInventoryMode ? (
              // Форма заявки на инвентаризацию
              <div className="space-y-6">
                {bitrixSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Заявка успешно создана в Битрикс24!
                    </p>
                  </div>
                )}

                {bitrixError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200 text-sm">{bitrixError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Название компании <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inventoryRequest.companyName}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, companyName: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="ООО Рога и копыта"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      ИНН <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={inventoryRequest.tin}
                      onChange={(e) => setInventoryRequest(prev => ({ ...prev, tin: e.target.value }))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      placeholder="1234567890"
                      maxLength={12}
                    />
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
            ) : (
              // Обычная форма события
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Название события
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mt-6">
                  <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Цвет события
                  </label>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                    {Object.entries(calendarsEvents).map(([key, value]) => (
                      <div key={key} className="n-chk">
                        <div className={`form-check form-check-${value} form-check-inline`}>
                          <label
                            className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                            htmlFor={`modal${key}`}
                          >
                            <span className="relative">
                              <input
                                className="sr-only form-check-input"
                                type="radio"
                                name="event-level"
                                value={key}
                                id={`modal${key}`}
                                checked={eventLevel === key}
                                onChange={() => setEventLevel(key)}
                              />
                              <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                                <span
                                  className={`h-2 w-2 rounded-full bg-white ${
                                    eventLevel === key ? "block" : "hidden"
                                  }`}
                                ></span>
                              </span>
                            </span>
                            {key}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Дата начала
                  </label>
                  <input
                    id="event-start-date"
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mt-6">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Дата окончания
                  </label>
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Закрыть
            </button>
            {isInventoryMode ? (
              <button
                onClick={handleCreateInventoryRequest}
                disabled={bitrixLoading}
                type="button"
                className="btn btn-success btn-create-inventory flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                {bitrixLoading ? "Создание заявки..." : "Создать заявку в Битрикс"}
              </button>
            ) : (
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Сохранить изменения" : "Добавить событие"}
              </button>
            )}
          </div>
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
