import React from "react";
import { HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  text: string;
}

const HelpTooltip = ({ text }: HelpTooltipProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface SocialMediaSectionProps {
  instagram: string;
  whatsapp: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const SocialMediaSection = ({
  instagram,
  whatsapp,
  onInputChange
}: SocialMediaSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="instagram" className="text-sm font-medium">Instagram</Label>
          <HelpTooltip text="URL completa do seu perfil no Instagram" />
        </div>
        <Input
          id="instagram"
          name="instagram"
          value={instagram}
          onChange={onInputChange}
          placeholder="https://instagram.com/sualoja"
          className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="whatsapp" className="text-sm font-medium">Link do WhatsApp</Label>
          <HelpTooltip text="Link para iniciar conversa no WhatsApp" />
        </div>
        <Input
          id="whatsapp"
          name="whatsapp"
          value={whatsapp}
          onChange={onInputChange}
          placeholder="https://wa.me/5511999999999"
          className="h-12 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <p className="text-xs text-muted-foreground">
          Formato: https://wa.me/SEU_NUMERO (com código do país)
        </p>
      </div>
    </div>
  );
};

export default SocialMediaSection;
