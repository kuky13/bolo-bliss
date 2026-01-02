import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAffiliate } from "@/context/AffiliateContext";
import GhostLoader from "@/components/ui/ghost-loader";

export const AffiliateTracker = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { trackAffiliateCode, isTracking } = useAffiliate();

  useEffect(() => {
    const handleAffiliateTracking = async () => {
      if (code) {
        await trackAffiliateCode(code);
      }
      // Redirecionar para a página inicial após rastrear o afiliado
      navigate("/", { replace: true });
    };

    handleAffiliateTracking();
  }, [code, trackAffiliateCode, navigate]);

  if (isTracking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GhostLoader size="medium" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Processando código de afiliado...</p>
        </div>
      </div>
    );
  }

  return null;
};