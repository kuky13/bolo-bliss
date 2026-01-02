import React from "react";
import { Clock, Calendar, MapPin, Phone } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/context/StoreContext";
import { useStoreHours, DAYS_OF_WEEK } from "@/hooks/useStoreHours";
const StoreClosedAlert: React.FC = () => {
  const {
    settings
  } = useStore();
  const {
    storeHours,
    isStoreOpen
  } = useStoreHours();

  // Se a loja está sempre aberta ou está aberta no momento, não mostrar o alerta
  if (settings.alwaysOpen || isStoreOpen) {
    return null;
  }
  const getTodayHours = () => {
    const today = new Date().getDay();
    return storeHours.find(hours => hours.dayOfWeek === today);
  };
  const getNextOpenDay = () => {
    const today = new Date().getDay();

    // Procurar pelo próximo dia aberto
    for (let i = 1; i <= 7; i++) {
      const nextDay = (today + i) % 7;
      const hours = storeHours.find(h => h.dayOfWeek === nextDay);
      if (hours && !hours.isClosed) {
        return {
          day: DAYS_OF_WEEK[nextDay],
          hours: hours
        };
      }
    }
    return null;
  };
  const todayHours = getTodayHours();
  const nextOpen = getNextOpenDay();
  const defaultMessage = "Estamos fechados no momento. Confira nossos horários de funcionamento.";
  return <div className="mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <CardContent className="p-0">
          {/* Header principal */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🔒 Loja Fechada</h3>
                <p className="text-red-100 text-sm">
                  Voltaremos em breve para atendê-lo!
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-6 space-y-6">
            {/* Mensagem personalizada */}
            <div className="text-center">
              <p className="text-gray-700 text-base leading-relaxed">
                {settings.storeClosedMessage || defaultMessage}
              </p>
            </div>

            {/* Informações rápidas */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hoje */}
              {todayHours && !todayHours.isClosed && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Hoje</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Abrimos às <span className="font-bold">{todayHours.openTime}</span> e fechamos às <span className="font-bold">{todayHours.closeTime}</span>
                  </p>
                </div>}
              
              {/* Próxima abertura */}
              {nextOpen && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Próxima Abertura</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    <span className="font-bold">{nextOpen.day}</span> das {nextOpen.hours.openTime} às {nextOpen.hours.closeTime}
                  </p>
                </div>}
            </div>

            {/* Horários completos */}
            {storeHours.length > 0 && <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-store-pink" />
                  <h4 className="font-semibold text-gray-800">Horários de Funcionamento</h4>
                </div>
                
                <div className="grid gap-2">
                  {DAYS_OF_WEEK.map((day, index) => {
                const hours = storeHours.find(h => h.dayOfWeek === index);
                const isToday = new Date().getDay() === index;
                return <div key={index} className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${isToday ? 'bg-store-pink/10 border border-store-pink/20' : 'hover:bg-gray-50'}`}>
                        <span className={`font-medium ${isToday ? 'text-store-pink' : 'text-gray-700'}`}>
                          {day}
                          {isToday && <span className="ml-2 text-xs bg-store-pink text-white px-2 py-1 rounded-full">Hoje</span>}
                        </span>
                        <span className={`text-sm ${hours?.isClosed ? 'text-red-600 font-medium' : isToday ? 'text-store-pink font-semibold' : 'text-gray-600'}`}>
                          {hours?.isClosed ? "Fechado" : hours ? `${hours.openTime} - ${hours.closeTime}` : "Não definido"}
                        </span>
                      </div>;
              })}
                </div>
              </div>}

            {/* Call to action */}
            
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default StoreClosedAlert;