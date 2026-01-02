import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Candy, Save, Mail } from "lucide-react";
import { toast } from "sonner";

interface ValeDoceSettings {
  id?: string;
  defaultReward: number;
  valedoceValue: number;
  emailNotifications: boolean;
}
const ValeDoceSettingsSection = () => {
  const [settings, setSettings] = useState<ValeDoceSettings>({
    defaultReward: 5,
    valedoceValue: 1.00,
    emailNotifications: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("valedoce_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.log("Usando configurações padrão");
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          defaultReward: data.default_reward,
          valedoceValue: data.valedoce_value,
          emailNotifications: data.email_notifications
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from("valedoce_settings")
          .update({
            default_reward: settings.defaultReward,
            valedoce_value: settings.valedoceValue,
            email_notifications: settings.emailNotifications
          })
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("valedoce_settings")
          .insert([{
            default_reward: settings.defaultReward,
            valedoce_value: settings.valedoceValue,
            email_notifications: settings.emailNotifications
          }]);

        if (error) throw error;
      }

      toast.success("Configurações ValeDoce salvas!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Card className="glass-morphism">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-2">
              <Candy className="h-4 w-4 text-white" />
            </div>
            Configurações ValeDoce
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultReward">Recompensa Padrão por Produto</Label>
            <div className="flex items-center gap-2">
              <Input
                id="defaultReward"
                type="number"
                min="0"
                value={settings.defaultReward}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultReward: parseInt(e.target.value) || 0
                })}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">ValeDoce</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Este valor é aplicado automaticamente a todos os produtos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valedoceValue">Valor de cada ValeDoce (R$)</Label>
            <Input
              id="valedoceValue"
              type="number"
              step="0.01"
              min="0"
              value={settings.valedoceValue}
              onChange={(e) => setSettings({
                ...settings,
                valedoceValue: parseFloat(e.target.value) || 0
              })}
            />
            <p className="text-xs text-muted-foreground">
              Quanto vale cada ValeDoce em reais quando usado como pagamento
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="emailNotifications" className="cursor-pointer">
                  Notificações por Email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enviar email quando afiliado ganhar ValeDoce
                </p>
              </div>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                emailNotifications: checked
              })}
            />
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ValeDoceSettingsSection;
