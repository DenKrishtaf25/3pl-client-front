"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { adminClientService } from '@/services/admin-client.service';
import { IClient, IClientUpdate, IPaginationMeta } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Pagination from '@/components/tables/Pagination';

export default function ClientsList() {
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<IClientUpdate>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Пагинация и фильтры
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState<'companyName' | 'createdAt'>('companyName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [meta, setMeta] = useState<IPaginationMeta | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminClientService.getPaginated({
        search: search || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      
      console.log('API Response:', response);
      
      // Обработка пагинированного ответа
      if (response && 'data' in response && Array.isArray(response.data)) {
        setClients(response.data || []);
        setMeta(response.meta || null);
      } 
      // Обработка обычного массива (fallback для старого API)
      else if (Array.isArray(response)) {
        setClients(response || []);
        setMeta(null);
      } 
      // Если формат неожиданный
      else {
        console.warn('Unexpected response format:', response);
        setClients([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch clients:', err);
      
      let errorMessage = 'Ошибка при загрузке клиентов';
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string }; status?: number } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (apiError.response?.status === 404) {
          errorMessage = 'Эндпоинт не найден. Возможно, бэкенд не поддерживает пагинацию.';
        } else if (apiError.response?.status === 401) {
          errorMessage = 'Не авторизован. Пожалуйста, войдите снова.';
        }
      }
      
      setError(errorMessage);
      setClients([]); // Убеждаемся, что clients всегда массив
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Сбрасываем на первую страницу при поиске
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (clientId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return;
    }

    try {
      setDeleteLoading(clientId);
      await adminClientService.delete(clientId);
      // Обновляем список после удаления
      await fetchClients();
    } catch (err: unknown) {
      console.error('Failed to delete client:', err);
      alert('Ошибка при удалении клиента');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditClick = (client: IClient) => {
    setEditingClient(client);
    setEditFormData({
      TIN: client.TIN,
      companyName: client.companyName
    });
    setUpdateError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClient(null);
    setEditFormData({});
    setUpdateError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setUpdateError(null);
    setUpdateLoading(true);

    // Валидация
    if (!editFormData.companyName || !editFormData.TIN) {
      setUpdateError('Название компании и ИНН обязательны');
      setUpdateLoading(false);
      return;
    }

    const tinRegex = /^\d{10}$|^\d{12}$/;
    if (!tinRegex.test(editFormData.TIN)) {
      setUpdateError('ИНН должен содержать 10 или 12 цифр');
      setUpdateLoading(false);
      return;
    }

    try {
      await adminClientService.update(editingClient.id, editFormData);
      handleCloseEditModal();
      // Обновляем список после редактирования
      await fetchClients();
    } catch (err: unknown) {
      console.error('Failed to update client:', err);
      let errorMessage = 'Ошибка при обновлении клиента';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          const message = apiError.response.data.message;
          if (message.includes('TIN already exists')) {
            errorMessage = 'Клиент с таким ИНН уже существует';
          } else {
            errorMessage = message;
          }
        }
      }
      
      setUpdateError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy: 'companyName' | 'createdAt') => {
    if (sortBy === newSortBy) {
      // Если сортируем по той же колонке, меняем порядок
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setPage(1);
  };

  if (loading && !meta) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Список клиентов
            </h2>
            {meta && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Всего клиентов: {meta.total} | Страница {meta.page} из {meta.totalPages}
              </p>
            )}
          </div>
          
          {/* Поиск */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по названию компании или ИНН..."
              className="w-full"
            />
          </div>
        </div>

        {/* Фильтры и сортировка */}
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Сортировка:</Label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'companyName' | 'createdAt')}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="companyName">По названию</option>
              <option value="createdAt">По дате создания</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600"
              title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">На странице:</Label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6">
          <div className="text-center py-4">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchClients} variant="outline">
              Попробовать снова
            </Button>
          </div>
        </div>
      )}

      {!error && (
        <>
          {loading ? (
            <div className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
              </div>
            </div>
          ) : !clients || clients.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {search ? 'Клиенты не найдены по вашему запросу' : 'Клиенты не найдены'}
                </p>
                {search && (
                  <Button onClick={() => setSearchInput('')} variant="outline">
                    Очистить поиск
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider max-w-[50%]">
                        <button
                          onClick={() => handleSortChange('companyName')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-100"
                        >
                          Название компании
                          {sortBy === 'companyName' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ИНН
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSortChange('createdAt')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-100"
                        >
                          Дата создания
                          {sortBy === 'createdAt' && (
                            <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 max-w-[50%]">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                            {client.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.TIN}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(client.createdAt).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditClick(client)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDelete(client.id)}
                              disabled={deleteLoading === client.id}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              {deleteLoading === client.id ? 'Удаление...' : 'Удалить'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Пагинация */}
              {meta && meta.totalPages > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                  <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Модальное окно редактирования */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Редактировать информацию о клиенте
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Обновите данные клиента. Будьте внимательны при изменении ИНН.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col">
            <div className="custom-scrollbar max-h-[450px] overflow-y-auto px-2 pb-3">
              {updateError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 text-sm">{updateError}</p>
                </div>
              )}

              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Информация о клиенте
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div>
                    <Label>
                      Название компании <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={editFormData.companyName || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="ООО Рога и копыта"
                      required
                    />
                  </div>

                  <div>
                    <Label>
                      ИНН <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      value={editFormData.TIN || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, TIN: e.target.value }))}
                      placeholder="1234567890"
                      maxLength={12}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Введите 10 или 12 цифр
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                onClick={handleCloseEditModal}
                disabled={updateLoading}
              >
                Отмена
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={updateLoading}
              >
                {updateLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
