import React, { memo } from "react";
import { Instagram, Phone } from "lucide-react";
import { useStore } from "@/context/StoreContext";
const Footer = memo(() => {
  const {
    settings
  } = useStore();
  return <footer className="border-t border-gray-100 py-6 sm:py-8 glass-morphism">
      <div className="container mx-auto px-4 text-center">
        <p className="bg-gradient-to-r from-[#FF1B8D] to-[#9747FF] bg-clip-text text-base sm:text-lg font-medium text-primary">
          {settings.storeName}
        </p>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          {settings.footerMessage}
        </p>
        <p className="mt-1 text-[0.65rem] sm:text-xs text-gray-500">
          &copy; {new Date().getFullYear()}
        </p>
        
        {/* Social media links */}
        <div className="mt-6 flex justify-center space-x-4">
          {settings.socialMedia?.instagram && <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full bg-store-pink p-2 text-white hover:opacity-90 transition-all shadow-md hover:scale-105" aria-label="Instagram">
              <Instagram size={20} />
            </a>}
          {settings.socialMedia?.whatsapp && <a href={settings.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500 p-2 text-white hover:opacity-90 transition-all shadow-md hover:scale-105" aria-label="WhatsApp">
              <Phone size={20} />
            </a>}
        </div>
      </div>
    </footer>;
});
Footer.displayName = "Footer";
export default Footer;