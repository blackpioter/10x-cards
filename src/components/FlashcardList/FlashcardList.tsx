import * as React from "react";
import type { FlashcardProposalViewModel } from "@/types";
import { Button } from "@/components/ui/button";
import { FlashcardListItem } from "@/components/FlashcardListItem";
import { TEST_IDS } from "./constants";

interface FlashcardListProps {
  proposals: FlashcardProposalViewModel[];
  onItemAction: (action: {
    type: "accept" | "reject" | "edit" | "reset" | "restore";
    proposalId: string;
    editedContent?: { front: string; back: string };
  }) => void;
  onBulkAction: () => void;
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
    edited: number;
  };
  "data-testid"?: string;
}

export function FlashcardList({
  proposals,
  onItemAction,
  onBulkAction,
  stats,
  "data-testid": testId = TEST_IDS.CONTAINER,
}: FlashcardListProps) {
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

  const handleAccept = React.useCallback(
    (proposalId: string) => {
      onItemAction({
        type: "accept",
        proposalId,
      });
    },
    [onItemAction]
  );

  const handleReject = React.useCallback(
    (proposalId: string) => {
      onItemAction({
        type: "reject",
        proposalId,
      });
    },
    [onItemAction]
  );

  const handleReset = React.useCallback(
    (proposalId: string) => {
      onItemAction({
        type: "reset",
        proposalId,
      });
    },
    [onItemAction]
  );

  const handleRestore = React.useCallback(
    (proposalId: string) => {
      onItemAction({
        type: "restore",
        proposalId,
      });
    },
    [onItemAction]
  );

  return (
    <div className="space-y-6" data-testid={testId}>
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
        <div className="flex justify-between text-sm text-muted-foreground" data-testid={TEST_IDS.STATS.CONTAINER}>
          <span>
            {stats.accepted + stats.rejected} of {proposals.length} reviewed
          </span>
          <span>
            <span data-testid={TEST_IDS.STATS.EDITED}>{stats.edited}</span> edited •{" "}
            <span data-testid={TEST_IDS.STATS.ACCEPTED}>{stats.accepted}</span> accepted •{" "}
            <span data-testid={TEST_IDS.STATS.REJECTED}>{stats.rejected}</span> rejected
          </span>
        </div>

        {/* Bulk actions */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkAction}
            disabled={proposals.every((p) => p.status === "accepted")}
            data-testid={TEST_IDS.ACTIONS.ACCEPT_ALL}
          >
            Accept All
          </Button>
        </div>
      </div>

      {/* Flashcard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {proposals.map((proposal) => (
          <FlashcardListItem
            key={proposal.id}
            proposal={proposal}
            isEditing={editingId === proposal.id}
            onStartEdit={() => setEditingId(proposal.id)}
            onCancelEdit={() => setEditingId(null)}
            onEdit={handleEdit}
            onAccept={() => handleAccept(proposal.id)}
            onReject={() => handleReject(proposal.id)}
            onReset={() => handleReset(proposal.id)}
            onRestore={() => handleRestore(proposal.id)}
          />
        ))}
      </div>
    </div>
  );
}
