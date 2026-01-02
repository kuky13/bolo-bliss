import { useAffiliate } from "@/context/AffiliateContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const AffiliateIndicator = () => {
  const { activeAffiliate, clearActiveAffiliate } = useAffiliate();

  if (!activeAffiliate) return null;

  return (
    <Card className="mb-4 overflow-hidden border-none shadow-lg animate-in slide-in-from-top-2 duration-500">
      <div className="relative p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground text-sm sm:text-base">
                Afiliado: <span className="font-bold" style={{ color: 'rgba(254, 200, 50, 1)' }}>{activeAffiliate.name}</span>
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearActiveAffiliate}
          className="h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};