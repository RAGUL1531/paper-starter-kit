import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import { mockConsultation, feedbackTags } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { doctor } = mockConsultation;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-24 md:pb-8">
        <Card className="max-w-md w-full text-center animate-fade-in">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-healthcare-green/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-healthcare-green" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback helps us improve our healthcare matching system and ensures 
              better experiences for all patients.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/")} className="w-full">
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/chatbot")} className="w-full">
                Start New Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="gradient-hero border-b border-border">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Rate Your Consultation
            </h1>
            <p className="text-muted-foreground">
              Your feedback helps us improve the SMaRT healthcare matching system
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Doctor Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-display font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-muted-foreground">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consultation completed • December 15, 2024
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How was your experience?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <RatingStars 
                  rating={rating} 
                  onRatingChange={setRating} 
                  interactive 
                  size="lg" 
                />
                <p className="text-muted-foreground text-sm">
                  {rating === 0 && "Tap a star to rate"}
                  {rating === 1 && "Poor experience"}
                  {rating === 2 && "Below expectations"}
                  {rating === 3 && "Satisfactory"}
                  {rating === 4 && "Good experience"}
                  {rating === 5 && "Excellent experience!"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What stood out? (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {feedbackTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-colors py-2 px-4",
                      selectedTags.includes(tag) && "bg-primary text-primary-foreground border-primary"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Written Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Comments (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share more details about your experience..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your review may be shared anonymously to help other patients.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0}
            size="lg" 
            className="w-full"
          >
            <Send className="h-5 w-5 mr-2" />
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}