import { Link } from "react-router-dom";
import { 
  MessageCircle, 
  Users, 
  Video, 
  Star, 
  Shield, 
  Clock, 
  Brain,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Symptom Analysis",
    description: "MediBot uses advanced NLP to understand your symptoms and provide intelligent health guidance.",
  },
  {
    icon: Users,
    title: "Smart Doctor Matching",
    description: "Our algorithm matches you with the most suitable healthcare professionals based on your needs.",
  },
  {
    icon: Video,
    title: "Seamless Consultations",
    description: "Connect with doctors through secure video calls, anytime and anywhere.",
  },
  {
    icon: Star,
    title: "Continuous Improvement",
    description: "Your feedback helps us improve matching accuracy and service quality.",
  },
];

const benefits = [
  "Reduce appointment wait times by up to 60%",
  "Connect with specialists in minutes",
  "24/7 AI-powered health guidance",
  "Secure and HIPAA-compliant platform",
];

export default function Landing() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Trusted by thousands of patients
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Smart Healthcare
              <span className="text-gradient block">Matching & Consultation</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Experience the future of healthcare with AI-powered symptom analysis, 
              intelligent doctor matching, and seamless virtual consultations.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="w-full sm:w-auto text-base">
                <Link to="/chatbot">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Start with MediBot
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base">
                <Link to="/doctors">
                  Find a Doctor
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-healthcare-teal/5 rounded-full blur-3xl" />
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2 className="h-5 w-5 text-healthcare-green shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How SMaRT Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our intelligent system guides you through every step of your healthcare journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-healthcare">
                        <Icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Chat with MediBot now and get matched with the right healthcare professional in minutes.
            </p>
            <Button asChild size="lg" className="text-base">
              <Link to="/chatbot">
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with MediBot
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}