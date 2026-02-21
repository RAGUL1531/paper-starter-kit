import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorCard } from "@/components/DoctorCard";
import { mockDoctors, type Doctor } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const specialties = [
  "All Specialties", 
  "Internal Medicine", 
  "General Practitioner", 
  "Family Medicine", 
  "Emergency Medicine", 
  "Pediatric Care",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Gastroenterology",
  "Orthopedics",
  "Psychiatry",
  "Ophthalmology",
  "Pulmonology",
  "Endocrinology",
  "Rheumatology"
];
const availabilityFilters = ["All", "Available Now", "Available Today"];

export default function DoctorMatching() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Read URL parameters for initial filter state
  const initialSpecialty = searchParams.get("specialty") || "All Specialties";
  const selectedDoctorId = searchParams.get("selected");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState(
    specialties.includes(initialSpecialty) ? initialSpecialty : "All Specialties"
  );
  const [availability, setAvailability] = useState("All");

  // Scroll to selected doctor if specified in URL
  useEffect(() => {
    if (selectedDoctorId) {
      setTimeout(() => {
        const element = document.getElementById(`doctor-${selectedDoctorId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 2000);
        }
      }, 300);
    }
  }, [selectedDoctorId]);

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = 
      specialty === "All Specialties" || doctor.specialty === specialty;
    
    const matchesAvailability = 
      availability === "All" ||
      (availability === "Available Now" && doctor.availability === "available") ||
      (availability === "Available Today" && doctor.availability !== "offline");
    
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const handleBook = (doctor: Doctor) => {
    toast({
      title: "Consultation Booked!",
      description: `Your appointment with ${doctor.name} has been scheduled for ${doctor.nextAvailable}.`,
    });
    setTimeout(() => navigate("/consultation"), 1500);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="gradient-hero border-b border-border">
        <div className="container py-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Your Matched Doctors
            </h1>
            <p className="text-muted-foreground">
              Based on your symptoms, we've found {mockDoctors.length} healthcare professionals who can help you.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name or specialty..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger className="w-[160px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityFilters.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Active filters */}
          {(specialty !== "All Specialties" || availability !== "All") && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {specialty !== "All Specialties" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSpecialty("All Specialties")}>
                  {specialty} ×
                </Badge>
              )}
              {availability !== "All" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setAvailability("All")}>
                  {availability} ×
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDoctors.length} of {mockDoctors.length} doctors
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button variant="ghost" size="sm" className="text-primary">
              Best Match
            </Button>
          </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <div 
                key={doctor.id}
                id={`doctor-${doctor.id}`}
                className="animate-fade-in-up transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DoctorCard doctor={doctor} onBook={handleBook} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No doctors found matching your criteria.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSpecialty("All Specialties");
                setAvailability("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}