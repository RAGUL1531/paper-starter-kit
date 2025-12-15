import { Star, Clock, Globe, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/data/mockData";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

const availabilityConfig = {
  available: { label: "Available", className: "bg-healthcare-green text-secondary-foreground" },
  busy: { label: "Busy", className: "bg-healthcare-orange text-primary-foreground" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
};

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  const availability = availabilityConfig[doctor.availability];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card",
              doctor.availability === "available" && "bg-healthcare-green",
              doctor.availability === "busy" && "bg-healthcare-orange",
              doctor.availability === "offline" && "bg-muted-foreground"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-semibold text-foreground truncate">
                  {doctor.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {doctor.specialty} • {doctor.credentials}
                </p>
              </div>
              <Badge variant="secondary" className={cn("shrink-0", availability.className)}>
                {availability.label}
              </Badge>
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-healthcare-orange text-healthcare-orange" />
                <span className="font-medium">{doctor.rating}</span>
                <span className="text-muted-foreground">({doctor.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{doctor.experience}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{doctor.languages.join(", ")}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-healthcare-green" />
              <span>${doctor.consultationFee}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Next available: </span>
              <span className="font-medium text-healthcare-teal">{doctor.nextAvailable}</span>
            </div>
            <Button 
              onClick={() => onBook(doctor)}
              disabled={doctor.availability === "offline"}
              className="shrink-0"
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}