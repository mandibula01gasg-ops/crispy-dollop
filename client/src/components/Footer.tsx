import { Phone, Instagram, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Açaí Prime</h3>
            <p className="text-sm text-muted-foreground">
              Açaí natural e delicioso, direto na sua casa!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <a
                href="tel:1234567890"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                (12) 3456-7890
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @acaiprime
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Endereço</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Rua das Flores, 123<br />Centro, São Paulo - SP</span>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Açaí Prime. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
