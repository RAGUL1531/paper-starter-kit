import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function RatingStars({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = "md" 
}: RatingStarsProps) {
  const starSize = sizeConfig[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange?.(star)}
          className={cn(
            "transition-transform",
            interactive && "hover:scale-110 cursor-pointer",
            !interactive && "cursor-default"
          )}
        >
          <Star
            className={cn(
              starSize,
              "transition-colors",
              star <= rating
                ? "fill-healthcare-orange text-healthcare-orange"
                : "fill-muted text-muted"
            )}
          />
        </button>
      ))}
    </div>
  );
}