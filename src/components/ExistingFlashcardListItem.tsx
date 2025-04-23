import type { FlashcardViewModel } from "../types";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";

interface ExistingFlashcardListItemProps {
  flashcard: FlashcardViewModel;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExistingFlashcardListItem({ flashcard, onEdit, onDelete }: ExistingFlashcardListItemProps) {
  const getStatusColor = () => {
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
  };

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
      <CardFooter className="px-4 py-3 bg-muted/50 flex justify-end gap-2">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit} title="Edit flashcard">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:text-destructive"
          onClick={onDelete}
          title="Delete flashcard"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
