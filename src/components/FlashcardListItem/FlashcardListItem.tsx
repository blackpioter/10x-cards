import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2, RotateCcw } from "lucide-react";
import type { FlashcardProposalViewModel } from "@/types";
import { TEST_IDS } from "./constants";

interface FlashcardListItemProps {
  proposal: FlashcardProposalViewModel;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEdit: (proposalId: string, editedContent: { front: string; back: string }) => void;
  onAccept: () => void;
  onReject: () => void;
  onReset?: () => void;
  onRestore?: () => void;
}

export function FlashcardListItem({
  proposal,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onEdit,
  onAccept,
  onReject,
  onReset,
  onRestore,
}: FlashcardListItemProps) {
  const [editedFront, setEditedFront] = React.useState(proposal.front);
  const [editedBack, setEditedBack] = React.useState(proposal.back);
  const frontId = React.useId();
  const backId = React.useId();

  // Reset edited content when proposal changes or editing is cancelled
  React.useEffect(() => {
    setEditedFront(proposal.front);
    setEditedBack(proposal.back);
  }, [proposal, isEditing]);

  const handleSave = () => {
    if (editedFront.trim() && editedBack.trim()) {
      onEdit(proposal.id, {
        front: editedFront.trim(),
        back: editedBack.trim(),
      });
    }
  };

  const getStatusColor = () => {
    switch (proposal.status) {
      case "accepted":
        return "border-l-4 border-l-green-500";
      case "rejected":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-transparent";
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-all h-full flex flex-col`} data-testid={TEST_IDS.ITEM}>
      <CardContent className="flex-1 p-3 space-y-3">
        {isEditing ? (
          // Edit mode
          <>
            <div className="space-y-1.5">
              <label htmlFor={frontId} className="text-sm font-medium">
                Front
              </label>
              <Textarea
                id={frontId}
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                placeholder="Front side of the flashcard"
                className="resize-none h-[60px]"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">{editedFront.length}/200 characters</div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={backId} className="text-sm font-medium">
                Back
              </label>
              <Textarea
                id={backId}
                value={editedBack}
                onChange={(e) => setEditedBack(e.target.value)}
                placeholder="Back side of the flashcard"
                className="resize-none h-[60px]"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">{editedBack.length}/500 characters</div>
            </div>
          </>
        ) : (
          // View mode
          <>
            <div>
              <div className="text-sm font-medium mb-1">Front</div>
              <div className="text-sm text-muted-foreground line-clamp-3" data-testid={TEST_IDS.CONTENT.FRONT}>
                {proposal.front}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Back</div>
              <div className="text-sm text-muted-foreground line-clamp-3" data-testid={TEST_IDS.CONTENT.BACK}>
                {proposal.back}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="px-3 py-2 bg-muted/50 flex justify-between">
        <div className="flex items-center gap-1.5">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!editedFront.trim() || !editedBack.trim()}
                data-testid={TEST_IDS.ACTIONS.SAVE_EDIT}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit} data-testid={TEST_IDS.ACTIONS.CANCEL_EDIT}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={proposal.status === "accepted" ? "default" : "outline"}
                onClick={proposal.status === "accepted" ? onReset : onAccept}
                className="h-7 px-2"
                title={proposal.status === "accepted" ? "Withdraw acceptance" : "Accept"}
                data-testid={TEST_IDS.ACTIONS.ACCEPT}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant={proposal.status === "rejected" ? "destructive" : "outline"}
                onClick={proposal.status === "rejected" ? onReset : onReject}
                className="h-7 px-2"
                title={proposal.status === "rejected" ? "Withdraw rejection" : "Reject"}
                data-testid={TEST_IDS.ACTIONS.REJECT}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {proposal.isEdited && !isEditing && <span className="text-xs text-muted-foreground">Edited</span>}
          {!isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEdit}
              className="h-7 px-2"
              title="Edit"
              disabled={proposal.status === "accepted" || proposal.status === "rejected"}
              data-testid={TEST_IDS.ACTIONS.EDIT}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {proposal.isEdited && !isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onRestore}
              className="h-7 px-2"
              title="Reset to original content"
              disabled={proposal.status === "accepted" || proposal.status === "rejected"}
              data-testid={TEST_IDS.ACTIONS.RESTORE}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
