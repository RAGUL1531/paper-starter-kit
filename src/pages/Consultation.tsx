import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare,
  FileText,
  Clock,
  Calendar,
  User,
  Send,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockConsultation } from "@/data/mockData";

export default function Consultation() {
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "doctor", text: "Hello! I'm reviewing your symptoms now. How are you feeling today?", time: "2:31 PM" },
    { id: 2, sender: "patient", text: "Hi Dr. Chen, I've been having persistent headaches for the past 3 days.", time: "2:32 PM" },
  ]);

  const { doctor, date, time, symptoms, notes } = mockConsultation;

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      { 
        id: Date.now(), 
        sender: "patient", 
        text: chatMessage, 
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      }
    ]);
    setChatMessage("");
  };

  const handleEndCall = () => {
    navigate("/feedback");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-muted/30">
      {/* Consultation Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h1 className="font-display font-semibold">{doctor.name}</h1>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              </div>
            </div>
            <Badge className="bg-healthcare-green text-secondary-foreground">
              <span className="h-2 w-2 rounded-full bg-secondary-foreground mr-2 animate-pulse" />
              In Session
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Video */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-foreground/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Video consultation in progress</p>
                  <p className="text-sm text-muted-foreground mt-1">Connected with {doctor.name}</p>
                </div>
                
                {/* Self view */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-foreground/10 rounded-lg border border-border flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                
                {/* Expand button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 bg-background/50 hover:bg-background/70"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Controls */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOn ? "secondary" : "destructive"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleEndCall}
                  >
                    <Phone className="h-5 w-5 rotate-[135deg]" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Session Info */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{date}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium">{time}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">30 mins</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-4">
                <Card className="h-[400px] flex flex-col">
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.sender === "patient"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === "patient" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Session Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Reported Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {symptoms.map((symptom) => (
                          <Badge key={symptom} variant="secondary">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Additional Notes</p>
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}