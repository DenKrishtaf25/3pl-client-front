"use client";
import React, { useState, useEffect } from 'react';
import { adminUserService } from '@/services/admin-user.service';
import { IUser, IUserUpdate, IClient } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';

export default function UsersList() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState<IUserUpdate>({});
  const [editLoading, setEditLoading] = useState(false);

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
      const data = await adminUserService.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
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
      role: user.role,
      clientIds: user.clients?.map(c => c.id) || []
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    try {
      // Преобразуем clientIds в TINs для отправки на сервер
      const selectedClients = clients.filter(client => editForm.clientIds?.includes(client.id));
      const dataToSend = {
        ...editForm,
        TINs: selectedClients.map(client => client.TIN)
      };
      
      console.log('Updating user with TINs:', dataToSend);
      
      const updatedUser = await adminUserService.update(editingUser.id, dataToSend);
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      setEditForm({});
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Ошибка при обновлении пользователя');
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {user.clients?.map(c => c.companyName).join(', ') || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модалка редактирования */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Редактировать пользователя
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label>Имя</Label>
                <Input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Роль</Label>
                <Select
                  value={editForm.role || 'USER'}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                >
                  <option value="USER">Пользователь</option>
                  <option value="ADMIN">Администратор</option>
                </Select>
              </div>

              <div>
                <Label>Клиенты</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  {clients.map(client => (
                    <label key={client.id} className="flex items-center space-x-2">
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
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editLoading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
