import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { type ChatMessage as ChatMessageType, mockDoctors, type Doctor } from "@/data/mockData";
import { 
  sendMessageToOpenRouter, 
  createMedicalSystemMessage, 
  getRecommendedSpecialties,
  type Message 
} from "@/services/openRouterService";

// Helper function to detect if we should recommend doctors
function detectDoctorRecommendation(userInput: string, aiResponse: string): boolean {
  const combinedText = (userInput + " " + aiResponse).toLowerCase();
  
  // Keywords that suggest medical consultation is needed
  const consultationKeywords = [
    "doctor", "specialist", "consult", "appointment", "see a", "visit",
    "professional", "medical help", "get checked", "examination",
    "recommend seeing", "should see", "talk to", "speak with"
  ];
  
  // Symptom severity keywords
  const severityKeywords = [
    "severe", "serious", "persistent", "chronic", "urgent", "emergency",
    "worsening", "getting worse", "unbearable", "intense"
  ];
  
  return consultationKeywords.some(keyword => combinedText.includes(keyword)) ||
         severityKeywords.some(keyword => combinedText.includes(keyword));
}

// Helper function to get relevant doctors based on LLM-recommended specialties
async function getRelevantDoctors(conversationHistory: Message[]): Promise<Doctor[]> {
  try {
    // Ask the LLM which specialties are most appropriate
    const recommendedSpecialties = await getRecommendedSpecialties(conversationHistory);
    
    if (recommendedSpecialties.length === 0) {
      return [];
    }
    
    // Filter doctors by recommended specialties and availability
    const relevantDoctors = mockDoctors
      .filter(doctor => recommendedSpecialties.includes(doctor.specialty))
      .sort((a, b) => {
        // Prioritize available doctors
        if (a.availability === "available" && b.availability !== "available") return -1;
        if (a.availability !== "available" && b.availability === "available") return 1;
        // Then by rating
        return b.rating - a.rating;
      })
      .slice(0, 3); // Return top 3 doctors
    
    return relevantDoctors;
  } catch (error) {
    console.error("Error getting relevant doctors:", error);
    return [];
  }
}


export default function Chatbot() {
  const navigate = useNavigate();
  
  // Initial welcome message
  const initialMessage: ChatMessageType = {
    id: "welcome",
    type: "bot",
    content: "👋 Hello! I'm MediBot AI, your personal health assistant powered by advanced AI.\n\nI'm here to help you understand your symptoms and guide you to the right care. Please describe what you're experiencing, and I'll do my best to assist you.\n\n*Remember: I provide guidance only and am not a substitute for professional medical advice.*",
    timestamp: new Date(),
  };
  
  const [messages, setMessages] = useState<ChatMessageType[]>([initialMessage]);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    createMedicalSystemMessage()
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Clear any previous errors
    setError(null);

    // Add user message to UI
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add to conversation history for OpenRouter
    const userMessageForAPI: Message = {
      role: "user",
      content: input,
    };
    
    const updatedHistory = [...conversationHistory, userMessageForAPI];
    setConversationHistory(updatedHistory);
    
    setInput("");
    setIsTyping(true);

    try {
      // Call OpenRouter API
      const aiResponse = await sendMessageToOpenRouter(updatedHistory);

      // Add AI response to conversation history
      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse,
      };
      const finalHistory = [...updatedHistory, assistantMessage];
      setConversationHistory(finalHistory);

      // Detect if we should recommend doctors
      const shouldRecommendDoctors = detectDoctorRecommendation(input, aiResponse);
      const recommendedDoctors = shouldRecommendDoctors 
        ? await getRelevantDoctors(finalHistory) 
        : undefined;

      // Add AI response to UI
      const botMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: aiResponse,
        timestamp: new Date(),
        doctors: recommendedDoctors,
      };
      setMessages((prev) => [...prev, botMessage]);

      // If doctors are recommended, add a follow-up message
      if (recommendedDoctors && recommendedDoctors.length > 0) {
        setTimeout(() => {
          const followUpMessage: ChatMessageType = {
            id: (Date.now() + 2).toString(),
            type: "bot",
            content: "💡 Based on your symptoms, I've found some specialists who can help you. Click 'View Profile' to see more details and book a consultation.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, followUpMessage]);
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      
      // Add error message to UI
      const errorBotMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: `⚠️ I'm having trouble connecting right now. ${errorMessage}\n\nPlease check your API key configuration or try again later.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="container flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-healthcare">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold">MediBot AI</h1>
            <p className="text-sm text-muted-foreground">Your AI Health Assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-healthcare-green animate-pulse" />
            <span className="text-sm text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-3xl space-y-4">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
            />
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-healthcare">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              size="icon"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            MediBot provides guidance only. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}