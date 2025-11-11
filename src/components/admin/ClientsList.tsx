"use client";
import React, { useState, useEffect } from 'react';
import { adminClientService } from '@/services/admin-client.service';
import { IClient, IClientUpdate } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

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

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await adminClientService.getAll();
      setClients(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch clients:', err);
      setError('Ошибка при загрузке клиентов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return;
    }

    try {
      setDeleteLoading(clientId);
      await adminClientService.delete(clientId);
      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (err: any) {
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
      const updatedClient = await adminClientService.update(editingClient.id, editFormData);
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      handleCloseEditModal();
    } catch (err: any) {
      console.error('Failed to update client:', err);
      let errorMessage = 'Ошибка при обновлении клиента';
      
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes('TIN already exists')) {
          errorMessage = 'Клиент с таким ИНН уже существует';
        } else {
          errorMessage = message;
        }
      }
      
      setUpdateError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchClients} variant="outline">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Клиенты не найдены</p>
          <Button onClick={fetchClients} variant="outline">
            Обновить
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Список клиентов
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Всего клиентов: {clients.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Название компании
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ИНН
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Дата создания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
