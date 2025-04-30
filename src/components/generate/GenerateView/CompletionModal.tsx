import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";

interface CompletionModalProps {
  isOpen: boolean;
  onGenerateNew: () => void;
  onViewAll: () => void;
}

export function CompletionModal({ isOpen, onGenerateNew, onViewAll }: CompletionModalProps) {
  React.useEffect(() => {
    console.log("[CompletionModal] isOpen changed:", isOpen);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={true} modal>
      <DialogContent className="sm:max-w-[425px]" data-testid="completion-modal">
        <DialogHeader>
          <DialogTitle>Flashcards Review Complete</DialogTitle>
          <DialogDescription>You have reviewed all flashcards. What would you like to do next?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("[CompletionModal] Generate New clicked");
              onGenerateNew();
            }}
            className="sm:order-1"
            data-testid="generate-new-button"
          >
            Generate New Flashcards
          </Button>
          <Button
            onClick={() => {
              console.log("[CompletionModal] View All clicked");
              onViewAll();
            }}
            data-testid="view-all-button"
          >
            View All Flashcards
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
