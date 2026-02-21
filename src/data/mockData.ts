export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  rating: number;
  reviewCount: number;
  availability: "available" | "busy" | "offline";
  image: string;
  experience: string;
  consultationFee: number;
  languages: string[];
  nextAvailable: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  options?: string[];
  doctors?: Doctor[]; // Optional array of recommended doctors
}

export interface Consultation {
  id: string;
  doctor: Doctor;
  date: string;
  time: string;
  status: "scheduled" | "in-progress" | "completed";
  symptoms: string[];
  notes: string;
}

export const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sachinanadhan",
    specialty: "Internal Medicine",
    credentials: "MD, FACP",
    rating: 4.9,
    reviewCount: 328,
    availability: "available",
    image: "/image.png",
    experience: "15 years",
    consultationFee: 75,
    languages: ["English", "Mandarin"],
    nextAvailable: "Today, 2:30 PM",
  },
  {
    id: "2",
    name: "Dr. Sanjay Ramasamy",
    specialty: "General Practitioner",
    credentials: "MD, MPH",
    rating: 4.8,
    reviewCount: 456,
    availability: "available",
    image: "/sanjay.jpg",
    experience: "12 years",
    consultationFee: 65,
    languages: ["English", "Spanish"],
    nextAvailable: "Today, 3:00 PM",
  },
  {
    id: "3",
    name: "Dr. sabrish",
    specialty: "Family Medicine",
    credentials: "MD, FAAFP",
    rating: 4.7,
    reviewCount: 289,
    availability: "busy",
    image: "/sabari.jpg",
    experience: "10 years",
    consultationFee: 70,
    languages: ["English"],
    nextAvailable: "Tomorrow, 9:00 AM",
  },
  {
    id: "4",
    name: "Dr. James Kim",
    specialty: "Emergency Medicine",
    credentials: "MD, FACEP",
    rating: 4.9,
    reviewCount: 512,
    availability: "available",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    experience: "18 years",
    consultationFee: 85,
    languages: ["English", "Korean"],
    nextAvailable: "Today, 4:15 PM",
  },
  {
    id: "5",
    name: "Dr. Maria Garcia",
    specialty: "Pediatric Care",
    credentials: "MD, FAAP",
    rating: 4.8,
    reviewCount: 367,
    availability: "offline",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face",
    experience: "14 years",
    consultationFee: 80,
    languages: ["English", "Spanish", "Portuguese"],
    nextAvailable: "Tomorrow, 10:30 AM",
  },
  {
    id: "6",
    name: "Dr. Priya Sharma",
    specialty: "Dermatology",
    credentials: "MD, FAAD",
    rating: 4.9,
    reviewCount: 421,
    availability: "available",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    experience: "11 years",
    consultationFee: 90,
    languages: ["English", "Hindi", "Tamil"],
    nextAvailable: "Today, 5:00 PM",
  },
  {
    id: "7",
    name: "Dr. Robert Chen",
    specialty: "Cardiology",
    credentials: "MD, FACC",
    rating: 4.9,
    reviewCount: 598,
    availability: "available",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    experience: "20 years",
    consultationFee: 120,
    languages: ["English", "Mandarin"],
    nextAvailable: "Today, 6:30 PM",
  },
  {
    id: "8",
    name: "Dr. Aisha Mohammed",
    specialty: "Psychiatry",
    credentials: "MD, FAPA",
    rating: 4.7,
    reviewCount: 234,
    availability: "busy",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    experience: "9 years",
    consultationFee: 95,
    languages: ["English", "Arabic", "French"],
    nextAvailable: "Tomorrow, 11:00 AM",
  },
  {
    id: "9",
    name: "Dr. Michael O'Brien",
    specialty: "Orthopedics",
    credentials: "MD, FAAOS",
    rating: 4.8,
    reviewCount: 445,
    availability: "available",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    experience: "16 years",
    consultationFee: 110,
    languages: ["English"],
    nextAvailable: "Today, 7:00 PM",
  },
  {
    id: "10",
    name: "Dr. Lisa Wang",
    specialty: "Neurology",
    credentials: "MD, FAAN",
    rating: 4.9,
    reviewCount: 512,
    availability: "available",
    image: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=150&h=150&fit=crop&crop=face",
    experience: "17 years",
    consultationFee: 115,
    languages: ["English", "Mandarin", "Cantonese"],
    nextAvailable: "Tomorrow, 8:30 AM",
  },
  {
    id: "11",
    name: "Dr. Carlos Rodriguez",
    specialty: "Gastroenterology",
    credentials: "MD, FACG",
    rating: 4.7,
    reviewCount: 298,
    availability: "busy",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    experience: "13 years",
    consultationFee: 100,
    languages: ["English", "Spanish"],
    nextAvailable: "Tomorrow, 1:00 PM",
  },
  {
    id: "12",
    name: "Dr. Yuki Tanaka",
    specialty: "Ophthalmology",
    credentials: "MD, FACS",
    rating: 4.8,
    reviewCount: 376,
    availability: "available",
    image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=150&h=150&fit=crop&crop=face",
    experience: "14 years",
    consultationFee: 105,
    languages: ["English", "Japanese"],
    nextAvailable: "Today, 4:45 PM",
  },
  {
    id: "13",
    name: "Dr. Fatima Hassan",
    specialty: "Endocrinology",
    credentials: "MD, FACE",
    rating: 4.9,
    reviewCount: 467,
    availability: "available",
    image: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?w=150&h=150&fit=crop&crop=face",
    experience: "15 years",
    consultationFee: 95,
    languages: ["English", "Arabic", "Urdu"],
    nextAvailable: "Today, 3:30 PM",
  },
  {
    id: "14",
    name: "Dr. Thomas Anderson",
    specialty: "Pulmonology",
    credentials: "MD, FCCP",
    rating: 4.8,
    reviewCount: 389,
    availability: "available",
    image: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=150&h=150&fit=crop&crop=face",
    experience: "19 years",
    consultationFee: 110,
    languages: ["English", "German"],
    nextAvailable: "Tomorrow, 9:15 AM",
  },
  {
    id: "15",
    name: "Dr. Nadia Patel",
    specialty: "Rheumatology",
    credentials: "MD, FACR",
    rating: 4.7,
    reviewCount: 256,
    availability: "busy",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=150&h=150&fit=crop&crop=face",
    experience: "12 years",
    consultationFee: 100,
    languages: ["English", "Hindi", "Gujarati"],
    nextAvailable: "Tomorrow, 2:30 PM",
  },
];

export const initialBotMessages: ChatMessage[] = [
  {
    id: "1",
    type: "bot",
    content: "Hello! I'm MediBot, your AI health assistant. 👋\n\nI'm here to help you understand your symptoms and connect you with the right healthcare professional.\n\nHow can I help you today?",
    timestamp: new Date(),
  },
];

export const symptomResponses: Record<string, string> = {
  headache: "I understand you're experiencing a headache. To help you better, could you tell me:\n\n• How severe is the pain on a scale of 1-10?\n• How long have you had this headache?\n• Are you experiencing any other symptoms like nausea, sensitivity to light, or fever?",
  fever: "I see you're dealing with a fever. Let me gather some more information:\n\n• What's your current temperature?\n• When did the fever start?\n• Are you experiencing any other symptoms like body aches, chills, or sore throat?",
  cough: "Thank you for sharing that you have a cough. To better understand your condition:\n\n• Is it a dry cough or are you coughing up mucus?\n• How long have you been coughing?\n• Do you have any other symptoms like shortness of breath or chest pain?",
  default: "Thank you for sharing your symptoms. To provide you with the best possible care recommendations:\n\n• On a scale of 1-10, how would you rate your discomfort?\n• How long have you been experiencing these symptoms?\n• Have you noticed any other changes in your health?",
};

export const mockConsultation: Consultation = {
  id: "consult-001",
  doctor: mockDoctors[0],
  date: "December 15, 2024",
  time: "2:30 PM",
  status: "scheduled",
  symptoms: ["Persistent headache", "Mild fever", "Fatigue"],
  notes: "Patient reports symptoms started 3 days ago. No known allergies.",
};

export const feedbackTags = [
  "Professional",
  "Knowledgeable",
  "Patient",
  "Clear Explanations",
  "Thorough",
  "Friendly",
  "Helpful",
  "Good Listener",
];