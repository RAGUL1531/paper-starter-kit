import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { initialBotMessages, symptomResponses, type ChatMessage as ChatMessageType } from "@/data/mockData";

const severityOptions = ["1-3 (Mild)", "4-6 (Moderate)", "7-10 (Severe)"];

export default function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageType[]>(initialBotMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [symptomCollected, setSymptomCollected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (content: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      const newMessage: ChatMessageType = {
        id: Date.now().toString(),
        type: "bot",
        content,
        timestamp: new Date(),
        options,
      };
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simple keyword matching for demo
    const lowerInput = input.toLowerCase();
    let response = symptomResponses.default;
    
    if (lowerInput.includes("headache") || lowerInput.includes("head")) {
      response = symptomResponses.headache;
    } else if (lowerInput.includes("fever") || lowerInput.includes("temperature")) {
      response = symptomResponses.fever;
    } else if (lowerInput.includes("cough") || lowerInput.includes("throat")) {
      response = symptomResponses.cough;
    }

    addBotMessage(response, severityOptions);
    setSymptomCollected(true);
  };

  const handleOptionClick = (option: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content: option,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (severityOptions.includes(option)) {
      addBotMessage(
        "Thank you for providing those details. Based on your symptoms, I recommend consulting with a healthcare professional.\n\nI've analyzed your symptoms and can now match you with suitable doctors who specialize in treating conditions like yours.\n\nWould you like me to find doctors for you?",
        ["Yes, find doctors", "Tell me more"]
      );
    } else if (option === "Yes, find doctors") {
      addBotMessage(
        "Great! I'm analyzing your symptoms and finding the best-matched doctors for you...\n\n✓ Symptom analysis complete\n✓ Specialty matching in progress\n✓ Checking real-time availability\n\nRedirecting you to your personalized doctor matches..."
      );
      setTimeout(() => navigate("/doctors"), 2000);
    } else if (option === "Tell me more") {
      addBotMessage(
        "Of course! Our SMaRT system uses advanced AI to:\n\n🔹 Analyze your symptoms using Natural Language Processing\n🔹 Match you with specialists based on your specific needs\n🔹 Consider doctor ratings, availability, and expertise\n🔹 Enable secure video consultations\n\nThis ensures you get the right care, faster. Ready to see your matches?",
        ["Yes, find doctors"]
      );
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
              onOptionClick={handleOptionClick}
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