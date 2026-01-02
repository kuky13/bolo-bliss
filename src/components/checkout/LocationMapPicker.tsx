import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, Navigation, Search, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
}

interface LocationMapPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const MAPBOX_TOKEN = "pk.eyJ1Ijoia3VreXNvbHV0aW9ucyIsImEiOiJjbWpseDR1dmcyY3YwM3FvYndxd3F3ZmxvIn0.JoEAi9AyEzfcreWZvy0g1Q";

const MINEIROS_CENTER: [number, number] = [-52.553, -17.565];

const MINEIROS_BOUNDS: [[number, number], [number, number]] = [
  [-52.7, -17.7],
  [-52.4, -17.45],
];

const isInsideMineiros = (lat: number, lng: number) => {
  const [swLng, swLat] = MINEIROS_BOUNDS[0];
  const [neLng, neLat] = MINEIROS_BOUNDS[1];
  return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat;
};

const LocationMapPicker = ({ onLocationSelect, initialLocation }: LocationMapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<LocationData | null>(null);
  const [isInsideDeliveryArea, setIsInsideDeliveryArea] = useState<boolean | null>(null);

  // Reverse geocode to get address
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=pt-BR&types=address,poi,place,locality,neighborhood`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        const neighborhood = context.find((c: any) => c.id.includes("neighborhood"))?.text || "";
        const locality = context.find((c: any) => c.id.includes("locality"))?.text || "";
        const place = context.find((c: any) => c.id.includes("place"))?.text || "";
        
        return {
          latitude: lat,
          longitude: lng,
          address: feature.place_name_pt || feature.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          district: neighborhood || locality || place || "",
        };
      }
      
      // Return coords if no address found
      return {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        district: "",
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        district: "",
      };
    }
  }, []);

  // Search address
  const searchAddress = useCallback(async () => {
    if (!searchQuery.trim() || !map.current) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&country=BR&language=pt-BR&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        
        map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
        
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        }
        
        const location = await reverseGeocode(lat, lng);
        if (location) {
          setSelectedLocation(location);
          setIsInsideDeliveryArea(isInsideMineiros(location.latitude, location.longitude));
        }
      } else {
        toast.error("Endereço não encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar endereço");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, reverseGeocode]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não disponível neste navegador");
      return;
    }
    
    setIsLoading(true);
    toast.info("Obtendo sua localização...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        if (map.current) {
          map.current.flyTo({ center: [lng, lat], zoom: 17, duration: 1500 });
          
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          }
        }
        
        const location = await reverseGeocode(lat, lng);
        if (location) {
          setSelectedLocation(location);
          setIsInsideDeliveryArea(isInsideMineiros(location.latitude, location.longitude));
          toast.success("Localização encontrada!");
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Não foi possível obter sua localização";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada. Verifique as configurações do navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível no momento";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao buscar localização";
            break;
        }
        
        toast.error(errorMessage);
        setIsLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, [reverseGeocode]);

  // Initialize map when dialog opens
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when closing
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
        setIsMapReady(false);
      }
      return;
    }

    // Delay to ensure container is rendered with proper dimensions
    const initTimer = setTimeout(() => {
      if (!mapContainer.current || map.current) return;
      
      // Ensure container has dimensions
      if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
        console.log("Map container not ready, retrying...");
        return;
      }

      try {
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        // Default center (Mineiros - GO)
        const defaultCenter: [number, number] = initialLocation 
          ? [initialLocation.longitude, initialLocation.latitude]
          : MINEIROS_CENTER;
        
        const defaultZoom = initialLocation ? 16 : 13;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: defaultCenter,
          zoom: defaultZoom,
          pitch: 50,
          bearing: -17.6,
          attributionControl: false,
          antialias: true,
          maxBounds: MINEIROS_BOUNDS,
          maxZoom: 19,
          minZoom: 11,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");
        map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

        // Add 3D buildings after map loads
        map.current.on("load", () => {
          if (!map.current) return;
          
          setIsMapReady(true);
          
          // Add 3D building layer safely
          try {
            const layers = map.current.getStyle()?.layers;
            const labelLayerId = layers?.find(
              (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
            )?.id;

            if (!map.current.getLayer("3d-buildings")) {
              map.current.addLayer(
                {
                  id: "3d-buildings",
                  source: "composite",
                  "source-layer": "building",
                  filter: ["==", "extrude", "true"],
                  type: "fill-extrusion",
                  minzoom: 14,
                  paint: {
                    "fill-extrusion-color": [
                      "interpolate",
                      ["linear"],
                      ["get", "height"],
                      0, "#e0e0e0",
                      50, "#c0c0c0",
                      100, "#a0a0a0"
                    ],
                    "fill-extrusion-height": ["get", "height"],
                    "fill-extrusion-base": ["get", "min_height"],
                    "fill-extrusion-opacity": 0.7,
                  },
                },
                labelLayerId
              );
            }
          } catch (e) {
            console.log("3D buildings not available for this area");
          }

          // Add atmosphere effect
          try {
            map.current.setFog({
              color: "rgb(220, 230, 240)",
              "high-color": "rgb(150, 180, 220)",
              "horizon-blend": 0.05,
            });
          } catch (e) {
            console.log("Fog effect not available");
          }

          // Reverse geocode initial location if available
          if (initialLocation) {
            reverseGeocode(initialLocation.latitude, initialLocation.longitude).then((loc) => {
              if (loc) {
                setSelectedLocation(loc);
                setIsInsideDeliveryArea(isInsideMineiros(loc.latitude, loc.longitude));
              }
            });
          }
        });

        // Add draggable marker
        marker.current = new mapboxgl.Marker({ 
          color: "#ec4899", 
          draggable: true,
          scale: 1.2
        })
          .setLngLat(defaultCenter)
          .addTo(map.current);

        // Handle marker drag
        marker.current.on("dragend", async () => {
          if (!marker.current) return;
          const lngLat = marker.current.getLngLat();
          
          setIsLoading(true);
          const location = await reverseGeocode(lngLat.lat, lngLat.lng);
          if (location) {
            setSelectedLocation(location);
            setIsInsideDeliveryArea(isInsideMineiros(location.latitude, location.longitude));
          }
          setIsLoading(false);
        });

        // Handle map click
        map.current.on("click", async (e) => {
          const { lng, lat } = e.lngLat;
          
          if (marker.current) {
            marker.current.setLngLat([lng, lat]);
          }
          
          setIsLoading(true);
          const location = await reverseGeocode(lat, lng);
          if (location) {
            setSelectedLocation(location);
            setIsInsideDeliveryArea(isInsideMineiros(location.latitude, location.longitude));
          }
          setIsLoading(false);
        });


      } catch (error) {
        console.error("Error initializing map:", error);
        toast.error("Erro ao carregar o mapa");
      }
    }, 200);

    return () => {
      clearTimeout(initTimer);
    };
  }, [isOpen, initialLocation, reverseGeocode]);

  const handleConfirm = () => {
    if (!selectedLocation) {
      toast.error("Selecione uma localização no mapa");
      return;
    }

    const insideMineiros = isInsideMineiros(selectedLocation.latitude, selectedLocation.longitude);
    if (!insideMineiros) {
      toast.error("No momento entregamos apenas em Mineiros - GO. Por favor, escolha um endereço dentro da cidade.");
      return;
    }

    onLocationSelect(selectedLocation);
    setConfirmedLocation(selectedLocation);
    setIsOpen(false);
    toast.success("Localização confirmada!");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedLocation(null);
      setSearchQuery("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 rounded-xl bg-muted/50 border-0 hover:bg-muted transition-all duration-200 h-auto py-3"
        >
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 text-left">
            {confirmedLocation ? (
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-foreground text-sm truncate max-w-[250px]">
                  {confirmedLocation.address.split(",")[0]}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar localização no mapa</span>
            )}
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-screen h-screen max-w-none m-0 p-0 gap-0 overflow-hidden flex flex-col rounded-none border-0">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Selecione sua Localização
          </DialogTitle>
          <DialogDescription className="sr-only">
            Busque um endereço ou clique no mapa para selecionar sua localização de entrega
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and location controls */}
        <div className="p-4 border-b bg-muted/30 space-y-3 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar endereço, rua, bairro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchAddress()}
                className="pl-10 rounded-xl"
              />
            </div>
            <Button 
              onClick={searchAddress} 
              disabled={isLoading || !searchQuery.trim()}
              className="rounded-xl px-6"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>
          
          <Button
            onClick={getUserLocation}
            variant="outline"
            className="w-full gap-2 rounded-xl bg-primary/5 hover:bg-primary/10 border-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 text-primary" />
            )}
            <span className="text-primary font-medium">Usar minha localização atual</span>
          </Button>
        </div>
        
        {/* Map container */}
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: "300px" }}>
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: "300px" }} />
          
          {/* Gradient overlays for immersive feel */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/30 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/50 to-transparent pointer-events-none z-10" />
          
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">Carregando mapa 3D...</p>
                <p className="text-xs text-muted-foreground">Preparando visualização</p>
              </div>
            </div>
          )}
          
          {/* Instructions overlay */}
          {isMapReady && !selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-border/50 text-sm z-20"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span className="font-medium">Toque no mapa ou arraste o marcador</span>
              </div>
            </motion.div>
          )}
          
          {/* Compass indicator for mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg z-20 md:hidden"
          >
            <div className="text-xs font-medium text-muted-foreground">3D</div>
          </motion.div>
        </div>
        
        {/* Selected location footer */}
        {/* Selected location footer - fixed at bottom */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 safe-area-bottom"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-full bg-primary/10 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{selectedLocation.address}</p>
                  {selectedLocation.district && (
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedLocation.district}</p>
                  )}
                  {selectedLocation && !isInsideMineiros(selectedLocation.latitude, selectedLocation.longitude) && (
                    <p className="text-xs text-destructive mt-0.5">
                      No momento entregamos apenas em Mineiros - GO. Ajuste o marcador para um endereço dentro da cidade.
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleConfirm} 
                className="w-full h-12 rounded-xl gap-2 text-base font-semibold shadow-lg"
                disabled={isLoading}
                size="lg"
              >
                <Check className="h-5 w-5" />
                Confirmar Localização
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default LocationMapPicker;
