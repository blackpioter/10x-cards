import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface FlashcardFormProps {
  onSubmit: (front: string, back: string) => void;
}

export function FlashcardForm({ onSubmit }: FlashcardFormProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSubmit(front.trim(), back.trim());
      setFront("");
      setBack("");
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
              onChange={(e) => setFront(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Textarea
              placeholder="Back side of the flashcard..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!front.trim() || !back.trim()}>
            Add Flashcard
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
