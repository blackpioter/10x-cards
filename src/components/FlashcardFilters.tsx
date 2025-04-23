import React from "react";
import type { FlashcardStatus } from "../types";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface FlashcardFiltersProps {
  statusFilter: FlashcardStatus;
  onStatusFilterChange: (status: FlashcardStatus) => void;
  counts: {
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  isLoading?: boolean;
}

export function FlashcardFilters({
  statusFilter,
  onStatusFilterChange,
  counts,
  isLoading = false,
}: FlashcardFiltersProps) {
  const renderCount = (count: number) => {
    if (isLoading) {
      return <Loader2 className="h-3 w-3 animate-spin inline-block ml-1" />;
    }
    return <span className="text-muted-foreground">({count})</span>;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => onStatusFilterChange("all")}>
        All <span className="ml-1">{renderCount(counts.all)}</span>
      </Button>
      <Button
        variant={statusFilter === "pending" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("pending")}
      >
        Pending <span className="ml-1">{renderCount(counts.pending)}</span>
      </Button>
      <Button
        variant={statusFilter === "accepted" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("accepted")}
      >
        Accepted <span className="ml-1">{renderCount(counts.accepted)}</span>
      </Button>
      <Button
        variant={statusFilter === "rejected" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("rejected")}
      >
        Rejected <span className="ml-1">{renderCount(counts.rejected)}</span>
      </Button>
    </div>
  );
}
