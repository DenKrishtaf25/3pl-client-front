"use client";
import React, { useState, useEffect } from 'react';
import { adminUserService } from '@/services/admin-user.service';
import { adminClientService } from '@/services/admin-client.service';
import { IUser, IUserUpdate, IClient } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Modal } from '@/components/ui/modal';

export default function UsersList() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<IUserUpdate>({});
  const [editLoading, setEditLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      console.log('Fetching clients for UsersList...');
      
      // Пробуем получить все клиенты через getAll (без пагинации)
      try {
        const allClients = await adminClientService.getAll();
        if (Array.isArray(allClients)) {
          console.log('Received all clients via getAll:', allClients.length, 'clients');
          setClients(allClients);
          return;
        }
      } catch (getAllError) {
        console.warn('getAll failed, trying paginated API:', getAllError);
      }
      
      // Если getAll не работает, используем пагинированный API с максимальным лимитом (50)
      // Делаем несколько запросов, если нужно получить всех клиентов
      let allClients: IClient[] = [];
      let page = 1;
      const limit = 50; // Максимальный лимит согласно API
      let hasMore = true;
      
      while (hasMore) {
        const paginatedResponse = await adminClientService.getPaginated({
          limit,
          page,
          sortBy: 'companyName',
          sortOrder: 'asc'
        });
        
        if (paginatedResponse && paginatedResponse.data && Array.isArray(paginatedResponse.data)) {
          allClients = [...allClients, ...paginatedResponse.data];
          
          // Проверяем, есть ли еще страницы
          if (paginatedResponse.meta) {
            hasMore = page < paginatedResponse.meta.totalPages;
            page++;
          } else {
            // Если нет мета-информации, проверяем по количеству полученных элементов
            hasMore = paginatedResponse.data.length === limit;
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log('Setting clients:', allClients.length, 'clients');
      setClients(allClients);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: unknown; status?: number } };
        console.error('API Error status:', apiError.response?.status);
        console.error('API Error data:', apiError.response?.data);
      }
      setClients([]); // Убеждаемся, что clients всегда массив
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этого пользователя?')) return;
    
    try {
      await adminUserService.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Ошибка при удалении пользователя');
    }
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      name: user.name || '',
      clientIds: user.clients?.map(c => c.id) || []
    });
    setUpdateError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditForm({});
    setUpdateError(null);
    setNewPassword('');
    setShowPasswordField(false);
    setClientSearch('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // Валидация пароля если он указан
    if (newPassword && newPassword.length < 6) {
      setUpdateError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setEditLoading(true);
    try {
      // Преобразуем clientIds в TINs для отправки на сервер
      const selectedClients = clients.filter(client => editForm.clientIds?.includes(client.id));
      const dataToSend: IUserUpdate = {
        ...editForm,
        TINs: selectedClients.map(client => client.TIN)
      };
      
      // Добавляем пароль только если он был указан
      if (newPassword) {
        dataToSend.password = newPassword;
      }
      
      console.log('Updating user with TINs:', dataToSend);
      
      const updatedUser = await adminUserService.update(editingUser.id, dataToSend);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      handleCloseEditModal();
    } catch (err: unknown) {
      console.error('Failed to update user:', err);
      let errorMessage = 'Ошибка при обновлении пользователя';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          const message = apiError.response.data.message;
          if (message.includes('email already exists')) {
            errorMessage = 'Пользователь с таким email уже существует';
          } else {
            errorMessage = message;
          }
        }
      }
      
      setUpdateError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleClientChange = (clientId: string, checked: boolean) => {
    setEditForm(prev => ({
      ...prev,
      clientIds: checked 
        ? [...(prev.clientIds || []), clientId]
        : (prev.clientIds || []).filter(id => id !== clientId)
    }));
  };

  const handleSelectAllClients = (checked: boolean) => {
    // Используем отфильтрованных клиентов для "Выбрать все"
    const filteredClients = getFilteredClients();
    setEditForm(prev => ({
      ...prev,
      clientIds: checked 
        ? [...new Set([...(prev.clientIds || []), ...filteredClients.map(c => c.id)])]
        : (prev.clientIds || []).filter(id => !filteredClients.some(c => c.id === id))
    }));
  };

  const getFilteredClients = () => {
    if (!clientSearch.trim()) {
      return clients;
    }
    const searchLower = clientSearch.toLowerCase();
    return clients.filter(client => 
      client.companyName.toLowerCase().includes(searchLower) ||
      client.TIN.toLowerCase().includes(searchLower)
    );
  };

  const filteredClients = getFilteredClients();
  const isAllClientsSelected = filteredClients.length > 0 && 
    filteredClients.every(client => editForm.clientIds?.includes(client.id));

  if (loading) {
    return <div className="p-6 text-gray-600 dark:text-gray-400">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Список пользователей
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Всего пользователей: {users.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Клиенты
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {users.map((user, index) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {user.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex flex-col items-start gap-1 relative">
                    {user.clients && clients.length > 0 && user.clients.length === clients.length && (
                      <div className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center absolute top-[-8px] left-[-5px]">
                        <span className="text-[8px] text-white font-bold leading-none">S</span>
                      </div>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {user.clients && user.clients.length > 0 ? (
                    <div className="relative flex flex-wrap gap-1.5 items-center max-w-md">
                      {user.clients.slice(0, 2).map((client, idx) => (
                        <span
                          key={client.id || idx}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {client.companyName}
                        </span>
                      ))}
                      {user.clients.length > 2 && (
                        <div
                          className="relative inline-block"
                          onMouseEnter={() => setHoveredUserId(user.id)}
                          onMouseLeave={() => setHoveredUserId(null)}
                        >
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            +{user.clients.length - 2} еще
                          </span>
                          {hoveredUserId === user.id && (
                            <div
                              className="absolute left-0 top-full pt-1 z-50 min-w-[200px] max-w-[300px] rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 py-2"
                            >
                              <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                  Остальные клиенты ({user.clients.length - 2})
                                </p>
                              </div>
                              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {user.clients.slice(2).map((client, idx) => (
                                  <div
                                    key={client.id || idx}
                                    className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                  >
                                    <p className="text-xs text-gray-800 dark:text-gray-200">
                                      {client.companyName}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(user)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно редактирования */}
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Редактировать пользователя
            </h4>
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
                  Личная информация
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Имя</Label>
                    <Input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Имя пользователя"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Роль</Label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        editingUser?.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {editingUser?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Пароль</Label>
                      {!showPasswordField && (
                        <button
                          type="button"
                          onClick={() => setShowPasswordField(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Изменить пароль
                        </button>
                      )}
                    </div>
                    {showPasswordField ? (
                      <div className="space-y-2">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Введите новый пароль (минимум 6 символов)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordField(false);
                            setNewPassword('');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          Отменить изменение пароля
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ••••••••
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Привязка к клиентам
                </h5>

                <div>
                  <Label>Выберите клиентов</Label>
                  <div className="space-y-2 max-h-80 border border-gray-200 dark:border-gray-600 rounded-lg p-3 overflow-y-auto">
                    {clients.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Нет доступных клиентов
                      </p>
                    ) : (
                      <>
                        {/* Чекбокс "Все" и поиск */}
                        <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded flex-1">
                            <input
                              type="checkbox"
                              checked={isAllClientsSelected}
                              onChange={(e) => handleSelectAllClients(e.target.checked)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              Все клиенты
                            </span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Поиск клиентов..."
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                            className="min-w-[300px]"
                          />
                        </div>
                        
                        {/* Список клиентов */}
                        {filteredClients.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                            Клиенты не найдены
                          </p>
                        ) : (
                          filteredClients.map(client => (
                            <label key={client.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={editForm.clientIds?.includes(client.id) || false}
                                onChange={(e) => handleClientChange(client.id, e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {client.companyName} ({client.TIN})
                              </span>
                            </label>
                          ))
                        )}
                      </>
                    )}
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
                disabled={editLoading}
              >
                Отмена
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={editLoading}
              >
                {editLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
