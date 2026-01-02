
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StoreHours } from '@/types';
import { toast } from 'sonner';

interface UseStoreHoursReturn {
  storeHours: StoreHours[];
  isStoreOpen: boolean;
  isLoading: boolean;
  error: Error | null;
  addStoreHours: (hours: Omit<StoreHours, 'id'>) => Promise<void>;
  updateStoreHours: (hours: StoreHours) => Promise<void>;
  deleteStoreHours: (id: string) => Promise<void>;
  checkStoreStatus: () => boolean;
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

const fetchStoreHours = async (): Promise<StoreHours[]> => {
  // Use any type to bypass TypeScript errors until types are regenerated
  const { data, error } = await (supabase as any)
    .from('store_hours')
    .select('*')
    .order('day_of_week');
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.map((hour: any) => ({
    id: hour.id,
    dayOfWeek: hour.day_of_week,
    openTime: hour.open_time,
    closeTime: hour.close_time,
    isClosed: hour.is_closed
  })) || [];
};

export const useStoreHours = (): UseStoreHoursReturn => {
  const queryClient = useQueryClient();
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const { 
    data: storeHours = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['storeHours'],
    queryFn: fetchStoreHours,
  });

  const checkStoreStatus = (): boolean => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    const currentTime = now.toTimeString().slice(0, 5); // Formato "HH:mm"

    // Buscar horário para o dia atual
    const todayHours = storeHours.find(hours => hours.dayOfWeek === currentDay);
    
    if (!todayHours) {
      return true; // Se não há horário definido, considera aberta
    }

    if (todayHours.isClosed) {
      return false; // Loja fechada neste dia
    }

    // Verificar se está dentro do horário de funcionamento
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  };

  useEffect(() => {
    const updateStoreStatus = () => {
      setIsStoreOpen(checkStoreStatus());
    };

    updateStoreStatus();
    
    // Atualizar status a cada minuto
    const interval = setInterval(updateStoreStatus, 60000);
    
    return () => clearInterval(interval);
  }, [storeHours]);

  const addMutation = useMutation({
    mutationFn: async (hours: Omit<StoreHours, 'id'>) => {
      const { data, error } = await (supabase as any)
        .from('store_hours')
        .insert({
          day_of_week: hours.dayOfWeek,
          open_time: hours.openTime,
          close_time: hours.closeTime,
          is_closed: hours.isClosed
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeHours'] });
      toast.success('Horário adicionado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar horário: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (hours: StoreHours) => {
      const { data, error } = await (supabase as any)
        .from('store_hours')
        .update({
          day_of_week: hours.dayOfWeek,
          open_time: hours.openTime,
          close_time: hours.closeTime,
          is_closed: hours.isClosed
        })
        .eq('id', hours.id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeHours'] });
      toast.success('Horário atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar horário: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('store_hours')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeHours'] });
      toast.success('Horário removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover horário: ${error.message}`);
    }
  });

  return {
    storeHours,
    isStoreOpen,
    isLoading,
    error: error as Error | null,
    addStoreHours: addMutation.mutateAsync,
    updateStoreHours: updateMutation.mutateAsync,
    deleteStoreHours: deleteMutation.mutateAsync,
    checkStoreStatus
  };
};

export { DAYS_OF_WEEK };
