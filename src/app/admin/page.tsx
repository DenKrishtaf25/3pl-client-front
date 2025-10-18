"use client";
import React, { useState } from 'react';
import CreateUserForm from '@/components/admin/CreateUserForm';
import UsersList from '@/components/admin/UsersList';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Управление пользователями
        </h1>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Создать пользователя
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Список пользователей
          </button>
        </nav>
      </div>

      {/* Контент */}
      {activeTab === 'create' && (
        <CreateUserForm onUserCreated={handleUserCreated} />
      )}

      {activeTab === 'list' && (
        <UsersList key={refreshKey} />
      )}
    </div>
  );
}
