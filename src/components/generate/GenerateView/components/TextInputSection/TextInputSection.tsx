import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TextInputSectionProps {
  onGenerate: (text: string) => void;
  isGenerating: boolean;
}

export function TextInputSection({ onGenerate, isGenerating }: TextInputSectionProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateText = (value: string) => {
    if (value.length < 1000) {
      return "Text must be at least 1000 characters long";
    }
    if (value.length > 10000) {
      return "Text must not exceed 10000 characters";
    }
    return null;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setError(validateText(newText));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    onGenerate(text);
  };

  const characterCount = text.length;
  const isValid = !error && characterCount >= 1000 && characterCount <= 10000;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="text-input-form">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter your text here (1000-10000 characters)"
          className="min-h-[200px] resize-y"
          disabled={isGenerating}
          data-testid="source-text-input"
        />
        <div className="flex justify-between text-sm">
          <span className={error ? "text-destructive" : "text-muted-foreground"} data-testid="character-count">
            {error || `${characterCount} characters`}
          </span>
          <span className="text-muted-foreground" data-testid="characters-needed">
            {Math.max(1000 - characterCount, 0)} characters needed
          </span>
        </div>
      </div>
      <Button type="submit" disabled={!isValid || isGenerating} className="w-full" data-testid="generate-button">
        {isGenerating ? "Generating..." : "Generate Flashcards"}
      </Button>
    </form>
  );
}
