import { cn } from "@/lib/utils";
import { Bot, User, Star, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ChatMessage as ChatMessageType, Doctor } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
  onOptionClick?: (option: string) => void;
}

export function ChatMessage({ message, onOptionClick }: ChatMessageProps) {
  const isBot = message.type === "bot";
  const navigate = useNavigate();

  const handleDoctorClick = (doctor: Doctor) => {
    // Navigate to doctors page with the specialty filter and selected doctor
    navigate(`/doctors?specialty=${encodeURIComponent(doctor.specialty)}&selected=${doctor.id}`);
  };


  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-healthcare">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[95%] md:max-w-[85%] rounded-2xl px-4 py-3",
          isBot
            ? "bg-card border border-border shadow-sm"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isBot ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        )}
        
        {message.options && message.options.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.options.map((option) => (
              <button
                key={option}
                onClick={() => onOptionClick?.(option)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Doctor Cards */}
        {message.doctors && message.doctors.length > 0 && (
          <div className="mt-4 space-y-3 max-w-md">
            {message.doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-background border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">
                      {doctor.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialty} • {doctor.credentials}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-muted-foreground">
                          ({doctor.reviewCount})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{doctor.nextAvailable}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>${doctor.consultationFee} consultation</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDoctorClick(doctor)}
                  size="sm"
                  className="w-full mt-3 gap-2"
                  variant="default"
                >
                  View Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <span className={cn(
          "text-xs mt-2 block",
          isBot ? "text-muted-foreground" : "text-primary-foreground/70"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      
      {!isBot && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}