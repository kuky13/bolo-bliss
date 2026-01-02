import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { useCoupon } from "@/context/CouponContext";
import { Save, Store, Truck, MessageSquare, Share2, Tag, Clock, Users, Gift, ChevronRight, Settings2 } from "lucide-react";
import BeginnersGuide from "@/components/settings/BeginnersGuide";
import StoreInfoSection from "@/components/settings/StoreInfoSection";
import DeliverySettingsSection from "@/components/settings/DeliverySettingsSection";
import MessagesSection from "@/components/settings/MessagesSection";
import SocialMediaSection from "@/components/settings/SocialMediaSection";
import CouponsSection from "@/components/settings/CouponsSection";
import StoreHoursSection from "@/components/settings/StoreHoursSection";
import { AffiliatesSection } from "@/components/settings/AffiliatesSection";
import ValeDoceSettingsSection from "@/components/settings/ValeDoceSettingsSection";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Coupon } from "@/types";
import { IOSCard } from "@/components/ui/IOSCard";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageTransition, staggerContainer, staggerItem, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { ScrollArea } from "@/components/ui/scroll-area";
const Settings = () => {
  const {
    settings,
    updateSettings
  } = useStore();
  const {
    coupons,
    updateCoupon,
    addCoupon,
    deleteCoupon,
    isLoading: couponsLoading
  } = useCoupon();
  const confirmation = useConfirmation();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber,
    deliveryFee: settings.deliveryFee,
    freeDeliveryThreshold: settings.freeDeliveryThreshold || 0,
    welcomeMessage: settings.welcomeMessage || "",
    footerMessage: settings.footerMessage || "",
    customCakeMessage: settings.customCakeMessage || "",
    announcements: settings.announcements || [],
    freeDeliveryMessage: settings.freeDeliveryMessage || `Entrega Grátis acima de R$ ${settings.freeDeliveryThreshold || 0}`,
    showFreeDeliveryBanner: settings.showFreeDeliveryBanner !== false,
    freeDeliveryFallbackEnabled: settings.freeDeliveryFallbackEnabled ?? true,
    freeDeliveryFallbackBgColor: settings.freeDeliveryFallbackBgColor || "bg-store-yellow",
    freeDeliveryFallbackTextColor: settings.freeDeliveryFallbackTextColor || "text-store-pink",
    freeDeliveryBanners: settings.freeDeliveryBanners || (settings.freeDeliveryMessage
      ? [{
          id: "legacy-1",
          text: settings.freeDeliveryMessage,
          bgColor: "bg-store-yellow",
          textColor: "text-store-pink"
        }]
      : []),
    bannerRotationInterval: settings.bannerRotationInterval || 5,
    alwaysOpen: settings.alwaysOpen || false,
    storeClosedMessage: settings.storeClosedMessage || "",
    instagram: settings.socialMedia?.instagram || "",
    whatsapp: settings.socialMedia?.whatsapp || ""
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === "number") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  const handleAnnouncementAdd = () => {
    setFormData(prev => ({
      ...prev,
      announcements: [...prev.announcements, ""]
    }));
  };
  const handleAnnouncementChange = (index: number, value: string) => {
    setFormData(prev => {
      const updatedAnnouncements = [...prev.announcements];
      updatedAnnouncements[index] = value;
      return {
        ...prev,
        announcements: updatedAnnouncements
      };
    });
  };
  const handleAnnouncementRemove = (index: number) => {
    setFormData(prev => {
      const updatedAnnouncements = prev.announcements.filter((_, i) => i !== index);
      return {
        ...prev,
        announcements: updatedAnnouncements
      };
    });
  };
  const handleBannerAdd = () => {
    setFormData(prev => ({
      ...prev,
      freeDeliveryBanners: [...prev.freeDeliveryBanners, {
        id: Date.now().toString(),
        text: "",
        bgColor: "bg-store-yellow",
        textColor: "text-store-pink"
      }]
    }));
  };
  const handleBannerChange = (index: number, field: "text" | "bgColor" | "textColor", value: string) => {
    setFormData(prev => {
      const updated = [...prev.freeDeliveryBanners];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return {
        ...prev,
        freeDeliveryBanners: updated
      };
    });
  };
  const handleBannerRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      freeDeliveryBanners: prev.freeDeliveryBanners.filter((_, i) => i !== index)
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await confirmation.confirm({
      title: "Salvar Configurações",
      description: "Tem certeza que deseja salvar todas as alterações? Essas configurações afetarão o funcionamento da sua loja.",
      confirmText: "Salvar",
      cancelText: "Cancelar",
      variant: "default"
    });
    if (!confirmed) return;
    const socialMedia = {
      instagram: formData.instagram,
      whatsapp: formData.whatsapp
    };
    const filteredAnnouncements = formData.announcements.filter(ann => ann.trim() !== "");
    const filteredBanners = formData.freeDeliveryBanners.filter(banner => banner.text.trim() !== "");
    updateSettings({
      ...settings,
      storeName: formData.storeName,
      whatsappNumber: formData.whatsappNumber,
      deliveryFee: formData.deliveryFee,
      freeDeliveryThreshold: formData.freeDeliveryThreshold,
      welcomeMessage: formData.welcomeMessage,
      footerMessage: formData.footerMessage,
      customCakeMessage: formData.customCakeMessage,
      announcements: filteredAnnouncements,
      freeDeliveryMessage: formData.freeDeliveryMessage,
      showFreeDeliveryBanner: formData.showFreeDeliveryBanner,
      freeDeliveryFallbackEnabled: formData.freeDeliveryFallbackEnabled,
      freeDeliveryFallbackBgColor: formData.freeDeliveryFallbackBgColor,
      freeDeliveryFallbackTextColor: formData.freeDeliveryFallbackTextColor,
      freeDeliveryBanners: filteredBanners,
      bannerRotationInterval: formData.bannerRotationInterval,
      alwaysOpen: formData.alwaysOpen,
      storeClosedMessage: formData.storeClosedMessage,
      socialMedia
    });
  };
  const handleCouponAdd = async (couponData: Omit<Coupon, "active" | "usageCount">) => {
    try {
      await addCoupon(couponData);
    } catch (error) {
      console.error("Erro ao adicionar cupom:", error);
    }
  };
  const handleCouponUpdate = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon);
    } catch (error) {
      console.error("Erro ao atualizar cupom:", error);
    }
  };
  const handleCouponDelete = async (code: string) => {
    const confirmed = await confirmation.confirm({
      title: "Excluir Cupom",
      description: `Tem certeza que deseja excluir o cupom "${code}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive"
    });
    if (!confirmed) return;
    try {
      await deleteCoupon(code);
    } catch (error) {
      console.error("Erro ao deletar cupom:", error);
    }
  };
  const [activeDesktopSection, setActiveDesktopSection] = useState("loja");
  const tabs = [{
    id: "geral",
    label: "Geral",
    icon: Store
  }, {
    id: "entrega",
    label: "Entrega",
    icon: Truck
  }, {
    id: "mensagens",
    label: "Mensagens",
    icon: MessageSquare
  }, {
    id: "promocoes",
    label: "Promoções",
    icon: Tag
  }];
  const desktopSections = [{
    id: "loja",
    label: "Informações da Loja",
    icon: Store,
    color: "bg-primary/10 text-primary"
  }, {
    id: "entrega",
    label: "Entrega",
    icon: Truck,
    color: "bg-emerald-500/10 text-emerald-500"
  }, {
    id: "horarios",
    label: "Horários",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-500"
  }, {
    id: "mensagens",
    label: "Mensagens",
    icon: MessageSquare,
    color: "bg-violet-500/10 text-violet-500"
  }, {
    id: "social",
    label: "Redes Sociais",
    icon: Share2,
    color: "bg-pink-500/10 text-pink-500"
  }, {
    id: "valedoce",
    label: "ValeDoce",
    icon: Gift,
    color: "bg-amber-500/10 text-amber-500"
  }, {
    id: "cupons",
    label: "Cupons",
    icon: Tag,
    color: "bg-orange-500/10 text-orange-500"
  }, {
    id: "afiliados",
    label: "Afiliados",
    icon: Users,
    color: "bg-cyan-500/10 text-cyan-500"
  }];
  return <AdminLayout title="Configurações">
      <PageTransition>
        <div className="max-w-6xl mx-auto">
          {/* Header com guia rápido */}
          <StaggerContainer variants={staggerContainer} initial="initial" animate="enter" className="mb-6">
            <StaggerItem variants={staggerItem} className="block lg:hidden mb-4">
              <BeginnersGuide />
            </StaggerItem>
          </StaggerContainer>

          {/* Layout com Tabs para mobile, Grid para desktop */}
          {isMobile ? <Tabs defaultValue="geral" className="w-full">
              <TabsList className="w-full h-auto p-1 bg-muted/60 backdrop-blur-sm rounded-2xl mb-4 grid grid-cols-4 gap-1">
                {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                    <tab.icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </TabsTrigger>)}
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="geral" className="mt-0 space-y-4">
                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-semibold">Informações da Loja</h3>
                      </div>
                      <StoreInfoSection storeName={formData.storeName} whatsappNumber={formData.whatsappNumber} onInputChange={handleInputChange} />
                    </IOSCard>
                  </motion.div>

                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3,
                delay: 0.1
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-semibold">Horários</h3>
                      </div>
                      <StoreHoursSection alwaysOpen={formData.alwaysOpen} storeClosedMessage={formData.storeClosedMessage} onInputChange={handleInputChange} onSwitchChange={handleSwitchChange} />
                    </IOSCard>
                  </motion.div>

                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3,
                delay: 0.2
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-pink-500/10">
                          <Share2 className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="font-semibold">Redes Sociais</h3>
                      </div>
                      <SocialMediaSection instagram={formData.instagram} whatsapp={formData.whatsapp} onInputChange={handleInputChange} />
                    </IOSCard>
                  </motion.div>
                </TabsContent>

                <TabsContent value="entrega" className="mt-0 space-y-4">
                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-green-500/10">
                          <Truck className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="font-semibold">Configurações de Entrega</h3>
                      </div>
                      <DeliverySettingsSection deliveryFee={formData.deliveryFee} freeDeliveryThreshold={formData.freeDeliveryThreshold} onInputChange={handleInputChange} />
                    </IOSCard>
                  </motion.div>
                </TabsContent>

                <TabsContent value="mensagens" className="mt-0 space-y-4">
                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-purple-500/10">
                          <MessageSquare className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="font-semibold">Mensagens</h3>
                      </div>
                      <MessagesSection
                        welcomeMessage={formData.welcomeMessage}
                        footerMessage={formData.footerMessage}
                        customCakeMessage={formData.customCakeMessage}
                        announcements={formData.announcements}
                        freeDeliveryMessage={formData.freeDeliveryMessage}
                        showFreeDeliveryBanner={formData.showFreeDeliveryBanner}
                        freeDeliveryFallbackEnabled={formData.freeDeliveryFallbackEnabled}
                        freeDeliveryFallbackBgColor={formData.freeDeliveryFallbackBgColor}
                        freeDeliveryFallbackTextColor={formData.freeDeliveryFallbackTextColor}
                        freeDeliveryBanners={formData.freeDeliveryBanners}
                        bannerRotationInterval={formData.bannerRotationInterval}
                        onInputChange={handleInputChange}
                        onAnnouncementAdd={handleAnnouncementAdd}
                        onAnnouncementChange={handleAnnouncementChange}
                        onAnnouncementRemove={handleAnnouncementRemove}
                        onSwitchChange={handleSwitchChange}
                        onBannerAdd={handleBannerAdd}
                        onBannerChange={handleBannerChange}
                        onBannerRemove={handleBannerRemove}
                        onFallbackThemeChange={(theme) => {
                          setFormData((prev) => {
                            if (theme === "rosa") {
                              return {
                                ...prev,
                                freeDeliveryFallbackBgColor: "bg-store-pink",
                                freeDeliveryFallbackTextColor: "text-white",
                              };
                            }
                            if (theme === "roxo") {
                              return {
                                ...prev,
                                freeDeliveryFallbackBgColor: "bg-violet-500",
                                freeDeliveryFallbackTextColor: "text-white",
                              };
                            }
                            return {
                              ...prev,
                              freeDeliveryFallbackBgColor: "bg-store-yellow",
                              freeDeliveryFallbackTextColor: "text-store-pink",
                            };
                          });
                        }}
                      />
                    </IOSCard>
                  </motion.div>
                </TabsContent>

                <TabsContent value="promocoes" className="mt-0 space-y-4">
                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3
              }}>
                    <IOSCard variant="elevated" padding="lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-amber-500/10">
                          <Gift className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="font-semibold">ValeDoce</h3>
                      </div>
                      <ValeDoceSettingsSection />
                    </IOSCard>
                  </motion.div>

                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3,
                delay: 0.1
              }}>
                    <CouponsSection coupons={coupons} onCouponAdd={handleCouponAdd} onCouponUpdate={handleCouponUpdate} onCouponDelete={handleCouponDelete} isLoading={couponsLoading} />
                  </motion.div>

                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3,
                delay: 0.2
              }}>
                    <AffiliatesSection />
                  </motion.div>
                </TabsContent>

                {/* Botão Salvar Flutuante - Mobile */}
                <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.3
            }} className="fixed bottom-20 left-4 right-4 z-40">
                  <Button type="submit" className="w-full h-12 rounded-2xl shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                    <Save className="h-5 w-5" />
                    Salvar Configurações
                  </Button>
                </motion.div>
              </form>
            </Tabs> : (/* Desktop Layout - Modern Split View */
        <div className="flex gap-8 min-h-[calc(100vh-8rem)]">
              {/* Left Sidebar Navigation */}
              <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4
          }} className="w-72 flex-shrink-0">
                <div className="sticky top-6 space-y-4">
                  {/* Header Card */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-primary/20 backdrop-blur-sm">
                        <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">Configurações</h2>
                        <p className="text-xs text-muted-foreground">Personalize sua loja</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      
                      <span>Todas as alterações são salvas automaticamente</span>
                    </div>
                  </div>

                  {/* Navigation Menu */}
                  <IOSCard variant="elevated" padding="sm" className="overflow-hidden">
                    <ScrollArea className="h-auto max-h-[60vh]">
                      <nav className="space-y-1 p-2">
                        {desktopSections.map((section, index) => <motion.button key={section.id} initial={{
                      opacity: 0,
                      x: -10
                    }} animate={{
                      opacity: 1,
                      x: 0
                    }} transition={{
                      delay: index * 0.05
                    }} onClick={() => setActiveDesktopSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeDesktopSection === section.id ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-muted/80 text-foreground"}`}>
                            <div className={`p-2 rounded-lg transition-colors ${activeDesktopSection === section.id ? section.color : "bg-muted group-hover:bg-muted-foreground/10"}`}>
                              <section.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm flex-1">{section.label}</span>
                            <ChevronRight className={`h-4 w-4 transition-transform ${activeDesktopSection === section.id ? "text-primary translate-x-0.5" : "text-muted-foreground/50"}`} />
                          </motion.button>)}
                      </nav>
                    </ScrollArea>
                  </IOSCard>

                  {/* Quick Tips */}
                  <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.5
              }}>
                    <BeginnersGuide />
                  </motion.div>
                </div>
              </motion.div>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {/* Loja Section */}
                    {activeDesktopSection === "loja" && <motion.div key="loja" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                                <Store className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">Informações da Loja</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Nome, WhatsApp e dados básicos</p>
                              </div>
                            </div>
                          </div>
                          <StoreInfoSection storeName={formData.storeName} whatsappNumber={formData.whatsappNumber} onInputChange={handleInputChange} />
                        </IOSCard>
                      </motion.div>}

                    {/* Entrega Section */}
                    {activeDesktopSection === "entrega" && <motion.div key="entrega" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10">
                                <Truck className="h-6 w-6 text-emerald-500" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">Configurações de Entrega</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Taxas, frete grátis e condições</p>
                              </div>
                            </div>
                          </div>
                          <DeliverySettingsSection deliveryFee={formData.deliveryFee} freeDeliveryThreshold={formData.freeDeliveryThreshold} onInputChange={handleInputChange} />
                        </IOSCard>
                      </motion.div>}

                    {/* Horários Section */}
                    {activeDesktopSection === "horarios" && <motion.div key="horarios" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10">
                                <Clock className="h-6 w-6 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">Horários de Funcionamento</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Defina quando sua loja está aberta</p>
                              </div>
                            </div>
                          </div>
                          <StoreHoursSection alwaysOpen={formData.alwaysOpen} storeClosedMessage={formData.storeClosedMessage} onInputChange={handleInputChange} onSwitchChange={handleSwitchChange} />
                        </IOSCard>
                      </motion.div>}

                    {/* Mensagens Section */}
                    {activeDesktopSection === "mensagens" && <motion.div key="mensagens" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/10">
                                <MessageSquare className="h-6 w-6 text-violet-500" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-xl">Mensagens e Anúncios</h3>
                                  <p className="text-sm text-muted-foreground mt-0.5">Textos personalizados para clientes</p>
                                </div>
                              </div>
                            </div>
                            <MessagesSection
                              welcomeMessage={formData.welcomeMessage}
                              footerMessage={formData.footerMessage}
                              customCakeMessage={formData.customCakeMessage}
                              announcements={formData.announcements}
                              freeDeliveryMessage={formData.freeDeliveryMessage}
                              showFreeDeliveryBanner={formData.showFreeDeliveryBanner}
                              freeDeliveryFallbackEnabled={formData.freeDeliveryFallbackEnabled}
                              freeDeliveryFallbackBgColor={formData.freeDeliveryFallbackBgColor}
                              freeDeliveryFallbackTextColor={formData.freeDeliveryFallbackTextColor}
                              freeDeliveryBanners={formData.freeDeliveryBanners}
                              bannerRotationInterval={formData.bannerRotationInterval}
                              onInputChange={handleInputChange}
                              onAnnouncementAdd={handleAnnouncementAdd}
                              onAnnouncementChange={handleAnnouncementChange}
                              onAnnouncementRemove={handleAnnouncementRemove}
                              onSwitchChange={handleSwitchChange}
                              onBannerAdd={handleBannerAdd}
                              onBannerChange={handleBannerChange}
                              onBannerRemove={handleBannerRemove}
                              onFallbackThemeChange={(theme) => {
                                setFormData((prev) => {
                                  if (theme === "rosa") {
                                    return {
                                      ...prev,
                                      freeDeliveryFallbackBgColor: "bg-store-pink",
                                      freeDeliveryFallbackTextColor: "text-white",
                                    };
                                  }
                                  if (theme === "roxo") {
                                    return {
                                      ...prev,
                                      freeDeliveryFallbackBgColor: "bg-violet-500",
                                      freeDeliveryFallbackTextColor: "text-white",
                                    };
                                  }
                                  return {
                                    ...prev,
                                    freeDeliveryFallbackBgColor: "bg-store-yellow",
                                    freeDeliveryFallbackTextColor: "text-store-pink",
                                  };
                                });
                              }}
                            />
                        </IOSCard>
                      </motion.div>}

                    {/* Social Section */}
                    {activeDesktopSection === "social" && <motion.div key="social" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/10">
                                <Share2 className="h-6 w-6 text-pink-500" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">Redes Sociais</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Links do Instagram e WhatsApp</p>
                              </div>
                            </div>
                          </div>
                          <SocialMediaSection instagram={formData.instagram} whatsapp={formData.whatsapp} onInputChange={handleInputChange} />
                        </IOSCard>
                      </motion.div>}

                    {/* ValeDoce Section */}
                    {activeDesktopSection === "valedoce" && <motion.div key="valedoce" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <IOSCard variant="elevated" padding="lg" className="mb-6">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10">
                                <Gift className="h-6 w-6 text-amber-500" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-xl">Programa ValeDoce</h3>
                                <p className="text-sm text-muted-foreground mt-0.5">Configure recompensas e fidelidade</p>
                              </div>
                            </div>
                          </div>
                          <ValeDoceSettingsSection />
                        </IOSCard>
                      </motion.div>}

                    {/* Cupons Section */}
                    {activeDesktopSection === "cupons" && <motion.div key="cupons" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <div className="mb-6">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/10">
                              <Tag className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl">Cupons de Desconto</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">Crie e gerencie promoções</p>
                            </div>
                          </div>
                          <CouponsSection coupons={coupons} onCouponAdd={handleCouponAdd} onCouponUpdate={handleCouponUpdate} onCouponDelete={handleCouponDelete} isLoading={couponsLoading} />
                        </div>
                      </motion.div>}

                    {/* Afiliados Section */}
                    {activeDesktopSection === "afiliados" && <motion.div key="afiliados" initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -20
                }} transition={{
                  duration: 0.3
                }}>
                        <div className="mb-6">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/10">
                              <Users className="h-6 w-6 text-cyan-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-xl">Programa de Afiliados</h3>
                              <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus parceiros de vendas</p>
                            </div>
                          </div>
                          <AffiliatesSection />
                        </div>
                      </motion.div>}
                  </AnimatePresence>

                  {/* Save Button - Fixed at bottom right */}
                  <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.4
              }} className="fixed bottom-8 right-8 z-50">
                    <Button type="submit" size="lg" className="rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-8 gap-2 h-12">
                      <Save className="h-5 w-5" />
                      Salvar Configurações
                    </Button>
                  </motion.div>
                </form>
              </div>
            </div>)}

          {/* Spacer para o botão flutuante no mobile */}
          {isMobile && <div className="h-24" />}
        </div>
      </PageTransition>

      <ConfirmationDialog open={confirmation.isOpen} onOpenChange={confirmation.setIsOpen} title={confirmation.options.title} description={confirmation.options.description} confirmText={confirmation.options.confirmText} cancelText={confirmation.options.cancelText} variant={confirmation.options.variant} onConfirm={confirmation.handleConfirm} />
    </AdminLayout>;
};
export default Settings;