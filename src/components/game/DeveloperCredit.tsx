
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";

const DeveloperCredit: React.FC = () => {
  const [sparkleAnimation, setSparkleAnimation] = useState(false);

  const triggerSparkleAnimation = () => {
    setSparkleAnimation(true);
    setTimeout(() => setSparkleAnimation(false), 1000);
  };

  return (
    <div className="my-8 text-center relative">
      <a 
        href="https://kuky.pro" 
        target="_blank" 
        rel="noopener noreferrer"
        onMouseEnter={triggerSparkleAnimation}
        onClick={triggerSparkleAnimation}
        className="inline-block"
      >
        <div className="relative">
          <Button 
            size="lg" 
            className={`
              group relative overflow-hidden transition-all duration-500 
              bg-gradient-to-r from-store-pink via-store-purple to-store-blue 
              hover:from-store-blue hover:via-store-purple hover:to-store-pink
              shadow-lg hover:shadow-xl text-white font-bold py-3 px-6
              ${sparkleAnimation ? 'animate-pulse' : ''}
            `}
          >
            <div className="relative z-10 flex items-center gap-2">
              <Heart className="h-5 w-5 text-white animate-pulse" />
              <span>Site Criado por Kuky</span>
              <Sparkles className={`h-5 w-5 text-white ${sparkleAnimation ? 'animate-bounce-subtle' : ''}`} />
            </div>
            <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </Button>
          
          {sparkleAnimation && (
            <div className="absolute -inset-4 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1s' }}></div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-store-pink rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute bottom-0 right-1/3 w-2 h-2 bg-store-blue rounded-full animate-ping" style={{ animationDuration: '0.8s' }}></div>
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-store-purple rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></div>
              <div className="absolute -top-2 right-1/2 w-2 h-2 bg-store-yellow rounded-full animate-ping" style={{ animationDuration: '1s' }}></div>
            </div>
          )}
        </div>
      </a>
    </div>
  );
};

export default DeveloperCredit;
