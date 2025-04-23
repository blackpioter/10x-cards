import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface FlashcardFormProps {
  onSubmit?: (front: string, back: string) => void;
  front?: string;
  back?: string;
  onFrontChange?: (value: string) => void;
  onBackChange?: (value: string) => void;
  hideSubmitButton?: boolean;
}

export function FlashcardForm({
  onSubmit,
  front: externalFront,
  back: externalBack,
  onFrontChange,
  onBackChange,
  hideSubmitButton,
}: FlashcardFormProps) {
  const [localFront, setLocalFront] = React.useState("");
  const [localBack, setLocalBack] = React.useState("");

  const front = externalFront !== undefined ? externalFront : localFront;
  const back = externalBack !== undefined ? externalBack : localBack;

  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (onFrontChange) {
      onFrontChange(value);
    } else {
      setLocalFront(value);
    }
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (onBackChange) {
      onBackChange(value);
    } else {
      setLocalBack(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && front.trim() && back.trim()) {
      onSubmit(front.trim(), back.trim());
      if (!onFrontChange) setLocalFront("");
      if (!onBackChange) setLocalBack("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Textarea
              placeholder="Front side of the flashcard..."
              value={front}
              onChange={handleFrontChange}
              rows={3}
            />
          </div>
          <div>
            <Textarea placeholder="Back side of the flashcard..." value={back} onChange={handleBackChange} rows={3} />
          </div>
        </CardContent>
        {!hideSubmitButton && (
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={!front.trim() || !back.trim()}>
              Add Flashcard
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}
