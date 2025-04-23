import { Button } from "./ui/button";
import type { FlashcardStatus } from "./FlashcardsView";

interface FlashcardFiltersProps {
  currentFilter: FlashcardStatus;
  onFilterChange: (filter: FlashcardStatus) => void;
}

export default function FlashcardFilters({ currentFilter, onFilterChange }: FlashcardFiltersProps) {
  const filters: { value: FlashcardStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ value, label }) => (
        <Button
          key={value}
          variant={currentFilter === value ? "default" : "outline"}
          onClick={() => onFilterChange(value)}
          size="sm"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
