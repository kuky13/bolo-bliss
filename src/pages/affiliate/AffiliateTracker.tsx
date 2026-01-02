import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAffiliate } from "@/context/AffiliateContext";
import GhostLoader from "@/components/ui/ghost-loader";

export const YsaAffiliateTracker = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { trackAffiliateCode, isTracking } = useAffiliate();

  useEffect(() => {
    const handleAffiliateTracking = async () => {
      if (slug) {
        await trackAffiliateCode(slug);
      }
      // Redirecionar para a página inicial após rastrear o afiliado
      navigate("/", { replace: true });
    };

    handleAffiliateTracking();
  }, [slug, trackAffiliateCode, navigate]);

  if (isTracking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <GhostLoader size="medium" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Processando indicação...</p>
          <p className="text-sm text-pink-500 mt-2">🍬 ValeDoce</p>
        </div>
      </div>
    );
  }

  return null;
};
