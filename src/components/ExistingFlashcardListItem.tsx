import React, { useCallback } from "react";
import type { FlashcardViewModel } from "../types";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import type { FlashcardActionStatus } from "../types";

interface ExistingFlashcardListItemProps {
  flashcard: FlashcardViewModel;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, newStatus: FlashcardActionStatus) => void;
}

function ExistingFlashcardListItemComponent({
  flashcard,
  onEdit,
  onDelete,
  onStatusChange,
}: ExistingFlashcardListItemProps) {
  const getStatusColor = useCallback(() => {
    switch (flashcard.status) {
      case "accepted":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-muted";
    }
  }, [flashcard.status]);

  const handleAccept = useCallback(() => {
    onStatusChange(flashcard.id, "accepted");
  }, [flashcard.id, onStatusChange]);

  const handleReject = useCallback(() => {
    onStatusChange(flashcard.id, "rejected");
  }, [flashcard.id, onStatusChange]);

  const renderStatusButtons = useCallback(() => {
    // Don't show the current status button
    const showAccept = flashcard.status !== "accepted";
    const showReject = flashcard.status !== "rejected";

    if (!showAccept && !showReject) return null;

    const { isLoading, error } = flashcard.operations.statusChange;

    return (
      <>
        {showAccept && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
            onClick={handleAccept}
            title={error || "Accept flashcard"}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        )}
        {showReject && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={handleReject}
            title={error || "Reject flashcard"}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        )}
      </>
    );
  }, [flashcard.operations.statusChange, flashcard.status, handleAccept, handleReject]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 p-4 space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Front</div>
          <div className="text-sm text-muted-foreground line-clamp-3">{flashcard.front}</div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Back</div>
          <div className="text-sm text-muted-foreground line-clamp-3">{flashcard.back}</div>
        </div>
        <Badge variant="secondary" className={getStatusColor()}>
          {flashcard.status}
        </Badge>
      </CardContent>
      <CardFooter className="px-4 py-3 bg-muted/50 flex justify-between gap-2">
        <div className="flex gap-2">{renderStatusButtons()}</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onEdit}
            title={flashcard.operations.edit.error || "Edit flashcard"}
            disabled={flashcard.operations.edit.isLoading}
          >
            {flashcard.operations.edit.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Edit2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:text-destructive"
            onClick={onDelete}
            title={flashcard.operations.delete.error || "Delete flashcard"}
            disabled={flashcard.operations.delete.isLoading}
          >
            {flashcard.operations.delete.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export const ExistingFlashcardListItem = React.memo(ExistingFlashcardListItemComponent, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.flashcard.front === nextProps.flashcard.front &&
    prevProps.flashcard.back === nextProps.flashcard.back &&
    prevProps.flashcard.status === nextProps.flashcard.status &&
    prevProps.flashcard.operations.statusChange.isLoading === nextProps.flashcard.operations.statusChange.isLoading &&
    prevProps.flashcard.operations.statusChange.error === nextProps.flashcard.operations.statusChange.error &&
    prevProps.flashcard.operations.edit.isLoading === nextProps.flashcard.operations.edit.isLoading &&
    prevProps.flashcard.operations.edit.error === nextProps.flashcard.operations.edit.error &&
    prevProps.flashcard.operations.delete.isLoading === nextProps.flashcard.operations.delete.isLoading &&
    prevProps.flashcard.operations.delete.error === nextProps.flashcard.operations.delete.error
  );
});
