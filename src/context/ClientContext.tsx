"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IClient } from '@/types/auth.types';
import { useUser } from '@/hooks/useUser';

interface ClientContextType {
  selectedClients: IClient[];
  toggleClient: (client: IClient) => void;
  isClientSelected: (clientId: string) => boolean;
  allClients: IClient[];
  selectAllClients: () => void;
  deselectAllClients: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [selectedClients, setSelectedClients] = useState<IClient[]>([]);

  useEffect(() => {
    if (user?.clients && user.clients.length > 0) {
      // Проверяем сохраненные клиенты в localStorage
      const savedClientIds = localStorage.getItem('selectedClientIds');
      if (savedClientIds) {
        try {
          const ids: string[] = JSON.parse(savedClientIds);
          const savedClients = user.clients.filter(c => ids.includes(c.id));
          if (savedClients.length > 0) {
            setSelectedClients(savedClients);
            return;
          }
        } catch (e) {
          console.error('Failed to parse saved client IDs:', e);
        }
      }
      // Если нет сохраненных, выбираем всех клиентов по умолчанию
      setSelectedClients(user.clients);
      localStorage.setItem('selectedClientIds', JSON.stringify(user.clients.map(c => c.id)));
    }
  }, [user]);

  const toggleClient = (client: IClient) => {
    setSelectedClients(prevSelected => {
      const isSelected = prevSelected.some(c => c.id === client.id);
      let newSelected: IClient[];
      
      if (isSelected) {
        // Убираем клиента из выбранных
        newSelected = prevSelected.filter(c => c.id !== client.id);
      } else {
        // Добавляем клиента к выбранным
        newSelected = [...prevSelected, client];
      }
      
      // Сохраняем в localStorage
      localStorage.setItem('selectedClientIds', JSON.stringify(newSelected.map(c => c.id)));
      return newSelected;
    });
  };

  const isClientSelected = (clientId: string): boolean => {
    return selectedClients.some(c => c.id === clientId);
  };

  const selectAllClients = () => {
    if (user?.clients) {
      setSelectedClients(user.clients);
      localStorage.setItem('selectedClientIds', JSON.stringify(user.clients.map(c => c.id)));
    }
  };

  const deselectAllClients = () => {
    setSelectedClients([]);
    localStorage.setItem('selectedClientIds', JSON.stringify([]));
  };

  return (
    <ClientContext.Provider
      value={{
        selectedClients,
        toggleClient,
        isClientSelected,
        allClients: user?.clients || [],
        selectAllClients,
        deselectAllClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useSelectedClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useSelectedClient must be used within a ClientProvider');
  }
  return context;
}

