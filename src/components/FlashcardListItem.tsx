import * as React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit2, RotateCcw } from "lucide-react";
import type { FlashcardProposalViewModel } from "../types";

interface FlashcardListItemProps {
  proposal: FlashcardProposalViewModel;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEdit: (proposalId: string, editedContent: { front: string; back: string }) => void;
  onAccept: () => void;
  onReject: () => void;
}

export function FlashcardListItem({
  proposal,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onEdit,
  onAccept,
  onReject,
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
    <Card className={`${getStatusColor()} transition-all`}>
      <CardContent className="p-4 space-y-4">
        {isEditing ? (
          // Edit mode
          <>
            <div className="space-y-2">
              <label htmlFor={frontId} className="text-sm font-medium">
                Front
              </label>
              <Textarea
                id={frontId}
                value={editedFront}
                onChange={(e) => setEditedFront(e.target.value)}
                placeholder="Front side of the flashcard"
                className="resize-none"
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground">{editedFront.length}/200 characters</div>
            </div>
            <div className="space-y-2">
              <label htmlFor={backId} className="text-sm font-medium">
                Back
              </label>
              <Textarea
                id={backId}
                value={editedBack}
                onChange={(e) => setEditedBack(e.target.value)}
                placeholder="Back side of the flashcard"
                className="resize-none"
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">{editedBack.length}/500 characters</div>
            </div>
          </>
        ) : (
          // View mode
          <>
            <div>
              <div className="font-medium mb-1">Front</div>
              <div className="text-muted-foreground">{proposal.front}</div>
            </div>
            <div>
              <div className="font-medium mb-1">Back</div>
              <div className="text-muted-foreground">{proposal.back}</div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-muted/50 flex justify-between">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={!editedFront.trim() || !editedBack.trim()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant={proposal.status === "accepted" ? "default" : "outline"}
                onClick={onAccept}
                disabled={proposal.status === "rejected"}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant={proposal.status === "rejected" ? "destructive" : "outline"}
                onClick={onReject}
                disabled={proposal.status === "accepted"}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {proposal.isEdited && !isEditing && <span className="text-xs text-muted-foreground">Edited</span>}
          {!isEditing && (
            <Button size="sm" variant="ghost" onClick={onStartEdit} disabled={proposal.status === "rejected"}>
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {proposal.isEdited && !isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditedFront(proposal.originalContent?.front || proposal.front);
                setEditedBack(proposal.originalContent?.back || proposal.back);
                onStartEdit();
              }}
              disabled={proposal.status === "rejected"}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
