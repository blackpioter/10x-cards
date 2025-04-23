import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { FlashcardStatus } from "../types";

interface FlashcardFiltersProps {
  textFilter: string;
  onTextFilterChange: (value: string) => void;
  statusFilter: FlashcardStatus;
  onStatusFilterChange: (filter: FlashcardStatus) => void;
}

export function FlashcardFilters({
  textFilter,
  onTextFilterChange,
  statusFilter,
  onStatusFilterChange,
}: FlashcardFiltersProps) {
  const statusFilters: { value: FlashcardStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Search flashcards..."
          value={textFilter}
          onChange={(e) => onTextFilterChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <Button
            key={value}
            variant={statusFilter === value ? "default" : "outline"}
            onClick={() => onStatusFilterChange(value)}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
