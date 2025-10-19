"use client";
import React, { useState, useEffect } from 'react';
import { adminClientService } from '@/services/admin-client.service';
import { adminUserService } from '@/services/admin-user.service';
import { IClientCreate, IUser } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

interface CreateClientFormProps {
  onClientCreated: () => void;
}

export default function CreateClientForm({ onClientCreated }: CreateClientFormProps) {
  const [formData, setFormData] = useState<IClientCreate>({
    TIN: '',
    companyName: '',
    userIds: []
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Валидация на клиенте
    if (!formData.TIN || !formData.companyName) {
      setError('ИНН и название компании обязательны');
      setLoading(false);
      return;
    }

    // Валидация ИНН (должен содержать только цифры и быть длиной 10 или 12 символов)
    const tinRegex = /^\d{10}$|^\d{12}$/;
    if (!tinRegex.test(formData.TIN)) {
      setError('ИНН должен содержать 10 или 12 цифр');
      setLoading(false);
      return;
    }

    try {
      await adminClientService.create(formData);
      setSuccess(true);
      setFormData({
        TIN: '',
        companyName: '',
        userIds: []
      });
      onClientCreated();
      
      // Скрыть сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to create client:', err);
      console.error('Error response:', err.response?.data);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Ошибка при создании клиента';
      
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        if (message.includes('TIN already exists') || message.includes('TIN must be unique')) {
          errorMessage = 'Клиент с таким ИНН уже существует';
        } else if (message.includes('Invalid TIN')) {
          errorMessage = 'Неверный формат ИНН';
        } else {
          errorMessage = message;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map((error: any) => error.message || error).join(', ');
        } else {
          errorMessage = validationErrors;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (userId: string, checked: boolean) => {
    setFormData(prev => {
      const newUserIds = checked 
        ? [...(prev.userIds || []), userId]
        : (prev.userIds || []).filter(id => id !== userId);
      
      return {
        ...prev,
        userIds: newUserIds
      };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Создать клиента
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 text-sm">
            Клиент успешно создан!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>ИНН <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            value={formData.TIN}
            onChange={(e) => setFormData(prev => ({ ...prev, TIN: e.target.value }))}
            placeholder="1234567890"
            required
            maxLength={12}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Введите 10 или 12 цифр
          </p>
        </div>

        <div>
          <Label>Название компании <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="ООО Рога и копыта"
            required
          />
        </div>

        <div>
          <Label>
            Пользователи (опционально)
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Выберите пользователей для привязки к клиенту
            {formData.userIds && formData.userIds.length > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                (Выбрано: {formData.userIds.length})
              </span>
            )}
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            {users.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Нет доступных пользователей
              </p>
            ) : (
              users.map(user => (
                <label key={user.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.userIds?.includes(user.id) || false}
                    onChange={(e) => handleUserChange(user.id, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.name || user.email} ({user.email})
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Создание...' : 'Создать клиента'}
        </Button>
      </form>
    </div>
  );
}
