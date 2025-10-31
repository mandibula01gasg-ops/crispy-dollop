import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationData {
  city: string;
  regionName: string;
  country: string;
}

interface LocationModalProps {
  onLocationConfirmed: (location: LocationData) => void;
}

export function LocationModal({ onLocationConfirmed }: LocationModalProps) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    
    if (savedLocation) {
      setOpen(false);
      return;
    }

    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLoading(true);
    setOpen(true);
    
    try {
      console.log("🌍 Detectando localização via servidor...");
      const response = await fetch("/api/detect-location");
      
      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📍 Dados recebidos:", data);
      
      if (data && data.city && data.regionName) {
        console.log("✅ Localização detectada com sucesso:", data);
        setLocation(data);
      } else {
        console.warn("⚠️ Dados de localização inválidos:", data);
        setLocation({
          city: "Sua cidade",
          regionName: "Seu estado",
          country: "Brasil",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao detectar localização:", error);
      setLocation({
        city: "Sua cidade",
        regionName: "Seu estado",
        country: "Brasil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (location) {
      localStorage.setItem("userLocation", JSON.stringify(location));
      onLocationConfirmed(location);
      setOpen(false);
    }
  };

  const handleChooseOtherLocation = () => {
    setShowManualInput(true);
  };

  const handleManualLocationSubmit = () => {
    if (manualCity && manualState) {
      const manualLocation: LocationData = {
        city: manualCity,
        regionName: manualState,
        country: "Brasil",
      };
      localStorage.setItem("userLocation", JSON.stringify(manualLocation));
      onLocationConfirmed(manualLocation);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Confirme sua localização
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <MapPin className="w-12 h-12 text-primary" />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Detectando sua localização...</p>
            </div>
          ) : showManualInput ? (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Escolha sua localização</h3>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Digite sua cidade"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="text-center"
                />
                <Input
                  placeholder="Digite seu estado"
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowManualInput(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleManualLocationSubmit}
                  disabled={!manualCity || !manualState}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          ) : location ? (
            <>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">
                  Detectamos sua localização!
                </h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {location.city}
                  </p>
                  <p className="text-muted-foreground">
                    {location.regionName}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Essa é sua localização atual?
              </p>
              
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={handleConfirmLocation}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Sim, confirmar localização
                </Button>
                <Button
                  variant="outline"
                  onClick={handleChooseOtherLocation}
                  className="w-full"
                >
                  Não, escolher outro local
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
