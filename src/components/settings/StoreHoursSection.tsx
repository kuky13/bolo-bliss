
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Save, Plus, Trash2 } from "lucide-react";
import { useStoreHours, DAYS_OF_WEEK } from "@/hooks/useStoreHours";
import { StoreHours } from "@/types";
import { toast } from "sonner";

interface StoreHoursSectionProps {
  alwaysOpen: boolean;
  storeClosedMessage: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
}

const StoreHoursSection: React.FC<StoreHoursSectionProps> = ({
  alwaysOpen,
  storeClosedMessage,
  onInputChange,
  onSwitchChange
}) => {
  const { storeHours, addStoreHours, updateStoreHours, deleteStoreHours } = useStoreHours();
  const [localHours, setLocalHours] = useState<StoreHours[]>([]);

  useEffect(() => {
    // Inicializar com horários padrão se não existirem
    const defaultHours = DAYS_OF_WEEK.map((_, index) => {
      const existing = storeHours.find(h => h.dayOfWeek === index);
      return existing || {
        id: `temp-${index}`,
        dayOfWeek: index,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: index === 0 // Domingo fechado por padrão
      };
    });
    
    setLocalHours(defaultHours);
  }, [storeHours]);

  const handleHourChange = (dayOfWeek: number, field: keyof StoreHours, value: string | boolean) => {
    setLocalHours(prev => prev.map(hour => 
      hour.dayOfWeek === dayOfWeek 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const saveHours = async () => {
    try {
      for (const hour of localHours) {
        const existingHour = storeHours.find(h => h.dayOfWeek === hour.dayOfWeek);
        
        if (existingHour) {
          await updateStoreHours({
            ...hour,
            id: existingHour.id
          });
        } else {
          await addStoreHours({
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: hour.isClosed
          });
        }
      }
      
      toast.success("Horários de funcionamento salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast.error("Erro ao salvar horários de funcionamento");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-store-pink" />
          Horários de Funcionamento
        </CardTitle>
        <CardDescription>
          Configure os horários de funcionamento da sua loja e personalize a mensagem para quando estiver fechada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opção Sempre Aberta */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <Label htmlFor="alwaysOpen" className="text-sm font-medium">
              Loja Sempre Aberta
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Quando ativado, a loja funcionará 24 horas por dia, 7 dias por semana
            </p>
          </div>
          <Switch
            id="alwaysOpen"
            checked={alwaysOpen}
            onCheckedChange={(checked) => onSwitchChange('alwaysOpen', checked)}
          />
        </div>

        {/* Configuração de Horários */}
        {!alwaysOpen && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Horários por Dia da Semana</h4>
              <Button onClick={saveHours} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Horários
              </Button>
            </div>
            
            <div className="grid gap-3">
              {localHours.map((hour) => (
                <div
                  key={hour.dayOfWeek}
                  className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50"
                >
                  <div className="w-24 text-sm font-medium">
                    {DAYS_OF_WEEK[hour.dayOfWeek]}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!hour.isClosed}
                      onCheckedChange={(checked) => 
                        handleHourChange(hour.dayOfWeek, 'isClosed', !checked)
                      }
                    />
                    <span className="text-xs text-gray-600">
                      {hour.isClosed ? 'Fechado' : 'Aberto'}
                    </span>
                  </div>
                  
                  {!hour.isClosed && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Abre:</Label>
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) => 
                            handleHourChange(hour.dayOfWeek, 'openTime', e.target.value)
                          }
                          className="w-24 text-xs"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Fecha:</Label>
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) => 
                            handleHourChange(hour.dayOfWeek, 'closeTime', e.target.value)
                          }
                          className="w-24 text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem personalizada para loja fechada */}
        <div className="space-y-2">
          <Label htmlFor="storeClosedMessage">
            Mensagem Personalizada para Loja Fechada
          </Label>
          <Textarea
            id="storeClosedMessage"
            name="storeClosedMessage"
            value={storeClosedMessage}
            onChange={onInputChange}
            placeholder="Estamos fechados no momento. Confira nossos horários de funcionamento."
            className="min-h-[80px]"
          />
          <p className="text-xs text-gray-600">
            Esta mensagem será exibida aos clientes quando a loja estiver fechada
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreHoursSection;
