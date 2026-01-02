
import { useState, useEffect } from "react";

export const useScrollDirection = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Se o usuário está no topo da página (primeiros 50px), sempre mostrar
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        // Se rolando para cima, mostrar; se para baixo, esconder
        // Adiciona uma tolerância maior para evitar flickering
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);
        if (scrollDifference > 10) {
          setIsVisible(currentScrollY < lastScrollY);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttling otimizado para melhor performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY]);

  return isVisible;
};
