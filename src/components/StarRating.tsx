import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function StarRating({ value, size = "sm", className = "" }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, Number(value) || 0));
  const percent = (clamped / 5) * 100;
  const starClass = SIZE_CLASS[size];

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={`${clamped} trên 5 sao`}
    >
      <span className="flex gap-0.5 text-ink-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={starClass} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
      <span
        className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-amber-500"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`${starClass} shrink-0`} fill="currentColor" strokeWidth={0} />
        ))}
      </span>
    </span>
  );
}
