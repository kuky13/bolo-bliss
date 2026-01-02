import React, { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";

export const StoreBanners: React.FC = () => {
  const { settings } = useStore();

  if (!settings.showFreeDeliveryBanner) {
    return null;
  }

  const banners = useMemo(() => {
    if (settings.freeDeliveryBanners && settings.freeDeliveryBanners.length > 0) {
      return settings.freeDeliveryBanners;
    }

    if (
      settings.freeDeliveryMessage &&
      (settings.freeDeliveryFallbackEnabled ?? true)
    ) {
      return [
        {
          id: "fallback-message",
          text: settings.freeDeliveryMessage,
          bgColor: settings.freeDeliveryFallbackBgColor || "bg-store-yellow",
          textColor: settings.freeDeliveryFallbackTextColor || "text-store-pink",
        },
      ];
    }

    return [];
  }, [
    settings.freeDeliveryBanners,
    settings.freeDeliveryMessage,
    settings.freeDeliveryFallbackEnabled,
    settings.freeDeliveryFallbackBgColor,
    settings.freeDeliveryFallbackTextColor,
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const intervalSeconds = settings.bannerRotationInterval || 5;

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % banners.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [banners.length, intervalSeconds]);

  if (banners.length === 0) {
    return null;
  }

  const activeBanner = banners[activeIndex];
  const bgClass = activeBanner.bgColor || "bg-store-yellow";
  const textClass = activeBanner.textColor || "text-store-pink";

  return (
    <div className="w-full flex justify-center mt-2 mb-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBanner.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={`rounded-full px-4 py-2 inline-flex items-center gap-2 shadow-sm hover-scale ${bgClass}`}
        >
          <MapPin className={`h-4 w-4 ${textClass}`} />
          <span className={`text-sm font-medium ${textClass}`}>
            {activeBanner.text}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
