import * as React from "react";
import type { FlashcardProposalViewModel } from "../types";
import { FlashcardListItem } from "./FlashcardListItem";
import { Button } from "./ui/button";

interface FlashcardListProps {
  proposals: FlashcardProposalViewModel[];
  onItemAction: (action: {
    type: "accept" | "reject" | "edit";
    proposalId: string;
    editedContent?: { front: string; back: string };
  }) => void;
  onBulkAction: (action: "accept-all" | "save-accepted") => void;
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
    edited: number;
  };
}

export function FlashcardList({ proposals, onItemAction, onBulkAction, stats }: FlashcardListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const handleEdit = React.useCallback(
    (proposalId: string, editedContent: { front: string; back: string }) => {
      onItemAction({
        type: "edit",
        proposalId,
        editedContent,
      });
      setEditingId(null);
    },
    [onItemAction]
  );

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{
            width: `${((stats.accepted + stats.rejected) / proposals.length) * 100}%`,
          }}
        />
      </div>

      {/* Progress stats */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {stats.accepted + stats.rejected} of {proposals.length} reviewed
        </span>
        <span>
          {stats.edited} edited • {stats.accepted} accepted • {stats.rejected} rejected
        </span>
      </div>

      {/* Bulk actions */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkAction("accept-all")}
          disabled={proposals.every((p) => p.status === "accepted")}
        >
          Accept All
        </Button>
        <Button size="sm" onClick={() => onBulkAction("save-accepted")} disabled={!stats.accepted}>
          Save Accepted ({stats.accepted})
        </Button>
      </div>

      {/* Flashcard list */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <FlashcardListItem
            key={proposal.id}
            proposal={proposal}
            isEditing={editingId === proposal.id}
            onStartEdit={() => setEditingId(proposal.id)}
            onCancelEdit={() => setEditingId(null)}
            onEdit={handleEdit}
            onAccept={() => onItemAction({ type: "accept", proposalId: proposal.id })}
            onReject={() => onItemAction({ type: "reject", proposalId: proposal.id })}
          />
        ))}
      </div>
    </div>
  );
}
