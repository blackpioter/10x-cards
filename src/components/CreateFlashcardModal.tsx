import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlashcardForm } from "./FlashcardForm";
import { Button } from "@/components/ui/button";
import { Plus, PlusCircle } from "lucide-react";

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFlashcardModal({ isOpen, onClose }: CreateFlashcardModalProps) {
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");

  const resetForm = () => {
    setFront("");
    setBack("");
  };

  const handleSubmit = async (createAnother: boolean) => {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: [
            {
              front,
              back,
              source: "manual",
              generation_id: null,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      if (createAnother) {
        resetForm();
      } else {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <FlashcardForm front={front} back={back} onFrontChange={setFront} onBackChange={setBack} hideSubmitButton />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create and Add Another
            </Button>
            <Button onClick={() => handleSubmit(false)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Flashcard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
