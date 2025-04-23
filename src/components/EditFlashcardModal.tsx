import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FlashcardViewModel } from "@/types";

interface EditFlashcardModalProps {
  flashcard: FlashcardViewModel | null;
  isOpen: boolean;
  onSave: (id: string, front: string, back: string) => void;
  onCancel: () => void;
}

export function EditFlashcardModal({ flashcard, isOpen, onSave, onCancel }: EditFlashcardModalProps) {
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [errors, setErrors] = React.useState<{ front?: string; back?: string }>({});

  // Reset form when flashcard changes
  React.useEffect(() => {
    if (flashcard) {
      setFront(flashcard.front);
      setBack(flashcard.back);
      setErrors({});
    }
  }, [flashcard]);

  const validateForm = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};

    if (!front.trim()) {
      newErrors.front = "Front side is required";
    } else if (front.length > 200) {
      newErrors.front = "Front side must be less than 200 characters";
    }

    if (!back.trim()) {
      newErrors.back = "Back side is required";
    } else if (back.length > 500) {
      newErrors.back = "Back side must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && flashcard) {
      onSave(flashcard.id, front.trim(), back.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="front" className="text-sm font-medium">
              Front Side
            </label>
            <Input
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className={errors.front ? "border-red-500" : ""}
              maxLength={200}
            />
            {errors.front && <p className="text-sm text-red-500">{errors.front}</p>}
            <p className="text-sm text-gray-500">{front.length}/200 characters</p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="back" className="text-sm font-medium">
              Back Side
            </label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={errors.back ? "border-red-500" : ""}
              maxLength={500}
            />
            {errors.back && <p className="text-sm text-red-500">{errors.back}</p>}
            <p className="text-sm text-gray-500">{back.length}/500 characters</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!front.trim() || !back.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
