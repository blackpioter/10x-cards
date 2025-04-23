import React from "react";
import type { FlashcardStatus } from "../types";
import { Button } from "./ui/button";

interface FlashcardFiltersProps {
  statusFilter: FlashcardStatus;
  onStatusFilterChange: (status: FlashcardStatus) => void;
}

export function FlashcardFilters({ statusFilter, onStatusFilterChange }: FlashcardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => onStatusFilterChange("all")}>
        All
      </Button>
      <Button
        variant={statusFilter === "pending" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("pending")}
      >
        Pending
      </Button>
      <Button
        variant={statusFilter === "accepted" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("accepted")}
      >
        Accepted
      </Button>
      <Button
        variant={statusFilter === "rejected" ? "default" : "outline"}
        onClick={() => onStatusFilterChange("rejected")}
      >
        Rejected
      </Button>
    </div>
  );
}
