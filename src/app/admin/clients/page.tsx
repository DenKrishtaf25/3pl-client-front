"use client";
import React, { useState } from 'react';
import CreateClientForm from '@/components/admin/CreateClientForm';
import ClientsList from '@/components/admin/ClientsList';

export default function AdminClientsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClientCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Управление клиентами
        </h1>
      </div>

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
            Создать клиента
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Список клиентов
          </button>
        </nav>
      </div>

      {activeTab === 'create' && (
        <CreateClientForm onClientCreated={handleClientCreated} />
      )}

      {activeTab === 'list' && (
        <ClientsList key={refreshKey} />
      )}
    </div>
  );
}


