"use client";
import React, { useState, useEffect } from 'react';
import { adminUserService } from '@/services/admin-user.service';
import { IUserCreate, IClient } from '@/types/auth.types';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

interface CreateUserFormProps {
  onUserCreated: () => void;
}

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState<IUserCreate>({
    email: '',
    name: '',
    password: '',
    role: 'USER', // Всегда USER
    clientIds: []
  });
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await adminUserService.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Валидация на клиенте
    if (!formData.email || !formData.password) {
      setError('Email и пароль обязательны');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    if (!formData.clientIds || formData.clientIds.length === 0) {
      setError('Необходимо выбрать хотя бы одного клиента');
      setLoading(false);
      return;
    }

    try {
      
      // Проверяем, что выбранные клиенты существуют
      const selectedClients = clients.filter(client => formData.clientIds?.includes(client.id));
      
      if (selectedClients.length === 0) {
        setError('Выбранные клиенты не найдены');
        setLoading(false);
        return;
      }
      
      // Отправляем TIN вместо ID клиентов
      const dataToSend = {
        ...formData,
        TINs: selectedClients.map(client => client.TIN)
      };
      
      await adminUserService.create(dataToSend);
      setSuccess(true);
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'USER',
        clientIds: []
      });
      onUserCreated();
      
      // Скрыть сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to create user:', err);
      console.error('Error response:', err.response?.data); // Для отладки
      
      // Более детальная обработка ошибок
      let errorMessage = 'Ошибка при создании пользователя';
      
      if (err.response?.data?.message) {
        // Переводим технические сообщения на понятный язык
        const message = err.response.data.message;
        if (message.includes('TIN must be provided')) {
          errorMessage = 'Необходимо выбрать хотя бы одного клиента';
        } else if (message.includes('email already exists') || message.includes('Email already exists')) {
          errorMessage = 'Пользователь с таким email уже существует';
        } else if (message.includes('Invalid email')) {
          errorMessage = 'Неверный формат email';
        } else {
          errorMessage = message;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        // Если есть массив ошибок валидации
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

  const handleClientChange = (clientId: string, checked: boolean) => {
    setFormData(prev => {
      const newClientIds = checked 
        ? [...(prev.clientIds || []), clientId]
        : (prev.clientIds || []).filter(id => id !== clientId);
      
      
      return {
        ...prev,
        clientIds: newClientIds
      };
    });
  };

  const handleSelectAllClients = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      clientIds: checked ? clients.map(c => c.id) : []
    }));
  };

  const isAllClientsSelected = clients.length > 0 && formData.clientIds?.length === clients.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Создать пользователя
      </h2>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 text-sm">
            Пользователь успешно создан!
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
          <Label>Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="user@example.com"
            required
          />
        </div>

        <div>
          <Label>Имя</Label>
          <Input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Имя пользователя"
          />
        </div>

        <div>
          <Label>Пароль <span className="text-red-500">*</span></Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Пароль"
            required
          />
        </div>


        <div>
          <Label>
            Клиенты <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Выберите хотя бы одного клиента для привязки к пользователю
            {formData.clientIds && formData.clientIds.length > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                (Выбрано: {formData.clientIds.length})
              </span>
            )}
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            {clients.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Нет доступных клиентов
              </p>
            ) : (
              <>
                {/* Чекбокс "Все" */}
                <label className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-600">
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
                
                {/* Список клиентов */}
                {clients.map(client => (
                  <label key={client.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.clientIds?.includes(client.id) || false}
                      onChange={(e) => handleClientChange(client.id, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {client.companyName} ({client.TIN})
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading || clients.length === 0}
          className="w-full"
        >
          {loading ? 'Создание...' : clients.length === 0 ? 'Нет доступных клиентов' : 'Создать пользователя'}
        </Button>
      </form>
    </div>
  );
}
