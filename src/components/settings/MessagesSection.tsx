import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, MapPin } from "lucide-react";
import HelpTooltip from "./HelpTooltip";
import { Switch } from "@/components/ui/switch";
interface MessagesSectionProps {
  welcomeMessage: string;
  footerMessage: string;
  customCakeMessage: string;
  announcements: string[];
  freeDeliveryMessage: string;
  showFreeDeliveryBanner: boolean;
  freeDeliveryFallbackEnabled: boolean;
  freeDeliveryFallbackBgColor: string;
  freeDeliveryFallbackTextColor: string;
  freeDeliveryBanners: { id: string; text: string; bgColor?: string; textColor?: string }[];
  bannerRotationInterval: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAnnouncementAdd: () => void;
  onAnnouncementChange: (index: number, value: string) => void;
  onAnnouncementRemove: (index: number) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onBannerAdd: () => void;
  onBannerChange: (index: number, field: "text" | "bgColor" | "textColor", value: string) => void;
  onBannerRemove: (index: number) => void;
  onFallbackThemeChange: (theme: "amarelo" | "rosa" | "roxo") => void;
}
const MessagesSection: React.FC<MessagesSectionProps> = ({
  welcomeMessage,
  footerMessage,
  customCakeMessage,
  announcements = [],
  freeDeliveryMessage = "",
  showFreeDeliveryBanner = true,
  freeDeliveryFallbackEnabled,
  freeDeliveryFallbackBgColor,
  freeDeliveryFallbackTextColor,
  freeDeliveryBanners,
  bannerRotationInterval,
  onInputChange,
  onAnnouncementAdd,
  onAnnouncementChange,
  onAnnouncementRemove,
  onSwitchChange,
  onBannerAdd,
  onBannerChange,
  onBannerRemove,
  onFallbackThemeChange,
}) => {
  return <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Mensagens e Avisos</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="welcomeMessage" className="flex items-center gap-2">
              Mensagem de Boas-vindas
              <HelpTooltip text="Esta mensagem aparece na barra superior do site" />
            </Label>
            <Input id="welcomeMessage" name="welcomeMessage" value={welcomeMessage} onChange={onInputChange} placeholder="Bem-vindo à nossa loja!" />
          </div>
          
          <div>
            <Label htmlFor="footerMessage" className="flex items-center gap-2">
              Mensagem no Rodapé
              <HelpTooltip text="Esta mensagem aparece no rodapé de todas as páginas" />
            </Label>
            <Input id="footerMessage" name="footerMessage" value={footerMessage} onChange={onInputChange} placeholder="Feito com amor ❤️" />
          </div>
          
          <div>
            <Label htmlFor="customCakeMessage" className="flex items-center gap-2">
              Texto para Bolos Personalizados
              <HelpTooltip text="Esta mensagem aparece no formulário de pedido de bolos personalizados" />
            </Label>
            <Textarea id="customCakeMessage" name="customCakeMessage" value={customCakeMessage} onChange={onInputChange} placeholder="Descreva seu bolo personalizado e entraremos em contato com um orçamento." rows={3} />
          </div>
          
          <div className="rounded-2xl border border-primary/15 bg-muted/40 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <Label htmlFor="showFreeDeliveryBanner" className="flex items-center gap-2 text-sm font-medium">
                  Banner de Entrega Grátis
                  <HelpTooltip text="Ativa/desativa os banners de destaque na página inicial" />
                </Label>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Crie vários banners chamativos com cores diferentes para destacar promoções na home.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full bg-background/80 px-3 py-1.5 border border-border/60">
                <span className="text-xs text-muted-foreground">Mostrar na loja</span>
                <Switch
                  id="showFreeDeliveryBanner"
                  checked={showFreeDeliveryBanner}
                  onCheckedChange={(checked) => onSwitchChange("showFreeDeliveryBanner", checked)}
                />
              </div>
            </div>

            {showFreeDeliveryBanner && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-end">
                  <div>
                    <Label htmlFor="freeDeliveryMessage" className="flex items-center gap-2 mb-1 text-sm">
                      Mensagem padrão (fallback)
                      <HelpTooltip text="Usada apenas se nenhum banner personalizado estiver configurado" />
                    </Label>
                    <Input
                      id="freeDeliveryMessage"
                      name="freeDeliveryMessage"
                      value={freeDeliveryMessage}
                      onChange={onInputChange}
                      placeholder="Entrega Grátis acima de R$ XX"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Esta mensagem garante um texto padrão caso você ainda não tenha criado banners.
                    </p>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="freeDeliveryFallbackEnabled"
                          checked={freeDeliveryFallbackEnabled}
                          onCheckedChange={(checked) =>
                            onSwitchChange("freeDeliveryFallbackEnabled", checked)
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          Usar banner padrão quando não houver banners personalizados
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label className="text-xs">Tema de cor do banner padrão</Label>
                      <select
                        className="w-full rounded-lg border bg-background px-3 py-2 text-xs md:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={
                          freeDeliveryFallbackBgColor === "bg-store-pink"
                            ? "rosa"
                            : freeDeliveryFallbackBgColor === "bg-violet-500"
                            ? "roxo"
                            : "amarelo"
                        }
                        onChange={(e) =>
                          onFallbackThemeChange(e.target.value as "amarelo" | "rosa" | "roxo")
                        }
                      >
                        <option value="amarelo">Amarelo (destaque)</option>
                        <option value="rosa">Rosa</option>
                        <option value="roxo">Roxo</option>
                      </select>

                      <div className="mt-2">
                        <p className="text-[11px] text-muted-foreground mb-1">Pré-visualização</p>
                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm ${freeDeliveryFallbackBgColor}`}
                        >
                          <MapPin className={`h-4 w-4 ${freeDeliveryFallbackTextColor}`} />
                          <span className={`text-xs font-medium ${freeDeliveryFallbackTextColor}`}>
                            {freeDeliveryMessage || "Entrega Grátis acima de R$ XX"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="bannerRotationInterval" className="flex items-center gap-2 mb-1 text-sm">
                      Intervalo entre banners (segundos)
                      <HelpTooltip text="Tempo que cada banner fica visível antes de trocar" />
                    </Label>
                    <Input
                      id="bannerRotationInterval"
                      name="bannerRotationInterval"
                      type="number"
                      min={2}
                      className="w-full"
                      value={bannerRotationInterval}
                      onChange={onInputChange}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Recomenda-se entre 4 e 8 segundos para uma leitura confortável.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 mb-1">
                  <div>
                    <Label className="flex items-center gap-2 text-sm">
                      Banners rotativos
                      <HelpTooltip text="Crie vários banners com cores diferentes que serão exibidos em sequência" />
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Use cores e textos diferentes para testar qual combinação gera mais cliques.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onBannerAdd}
                    className="gap-1 rounded-full px-3"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Adicionar banner
                  </Button>
                </div>

                {freeDeliveryBanners.length === 0 && (
                  <p className="text-xs text-muted-foreground border border-dashed border-border/70 rounded-lg px-3 py-2 bg-background/60">
                    Nenhum banner criado ainda. Clique em 
                    <span className="font-medium"> "Adicionar banner" </span>
                    para começar e visualize o resultado logo abaixo.
                  </p>
                )}

                <div className="space-y-3">
                  {freeDeliveryBanners.map((banner, index) => {
                    const theme =
                      banner.bgColor === "bg-store-pink"
                        ? "rosa"
                        : banner.bgColor === "bg-violet-500"
                        ? "roxo"
                        : "amarelo";

                    const bgClass =
                      theme === "rosa"
                        ? "bg-store-pink"
                        : theme === "roxo"
                        ? "bg-violet-500"
                        : "bg-store-yellow";

                    const textClass =
                      theme === "rosa" || theme === "roxo" ? "text-white" : "text-store-pink";

                    return (
                      <div
                        key={banner.id || index}
                        className="rounded-2xl border bg-background/80 p-3 md:p-4 flex flex-col gap-3 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Texto do banner</Label>
                              <span className="text-[11px] text-muted-foreground">Banner #{index + 1}</span>
                            </div>
                            <Input
                              value={banner.text}
                              onChange={(e) => onBannerChange(index, "text", e.target.value)}
                              placeholder="Ex: Entrega grátis acima de R$ 50"
                            />
                          </div>

                          <div className="w-full md:w-56 space-y-2">
                            <Label className="text-xs">Tema de cor</Label>
                            <select
                              className="w-full rounded-lg border bg-background px-3 py-2 text-xs md:text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              value={theme}
                              onChange={(e) => {
                                const value = e.target.value as "amarelo" | "rosa" | "roxo";
                                if (value === "rosa") {
                                  onBannerChange(index, "bgColor", "bg-store-pink");
                                  onBannerChange(index, "textColor", "text-white");
                                } else if (value === "roxo") {
                                  onBannerChange(index, "bgColor", "bg-violet-500");
                                  onBannerChange(index, "textColor", "text-white");
                                } else {
                                  onBannerChange(index, "bgColor", "bg-store-yellow");
                                  onBannerChange(index, "textColor", "text-store-pink");
                                }
                              }}
                            >
                              <option value="amarelo">Amarelo (destaque)</option>
                              <option value="rosa">Rosa</option>
                              <option value="roxo">Roxo</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => onBannerRemove(index)}
                            className="self-start md:self-center mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-1">
                          <p className="text-[11px] text-muted-foreground mb-1">Pré-visualização</p>
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-sm ${bgClass}`}
                          >
                            <MapPin className={`h-4 w-4 ${textClass}`} />
                            <span className={`text-xs font-medium ${textClass}`}>
                              {banner.text || "Texto do banner"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div>
            
            
            <div className="space-y-2">
              {announcements.map((announcement, index) => <div key={index} className="flex items-center gap-2">
                  <Input value={announcement} onChange={e => onAnnouncementChange(index, e.target.value)} placeholder="Digite seu aviso aqui" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => onAnnouncementRemove(index)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>)}
              
              {announcements.length === 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default MessagesSection;