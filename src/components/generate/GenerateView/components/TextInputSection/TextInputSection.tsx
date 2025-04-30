import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GENERATION_CONFIG, ERROR_MESSAGES } from "../../constants";
import type { TextInputSectionProps } from "../../types";

export function TextInputSection({ onGenerate, isGenerating, "data-testid": testId }: TextInputSectionProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateText = (value: string) => {
    if (value.length < GENERATION_CONFIG.MIN_TEXT_LENGTH) {
      return ERROR_MESSAGES.INVALID_TEXT_LENGTH;
    }
    if (value.length > GENERATION_CONFIG.MAX_TEXT_LENGTH) {
      return ERROR_MESSAGES.INVALID_TEXT_LENGTH;
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
  const isValid =
    !error &&
    characterCount >= GENERATION_CONFIG.MIN_TEXT_LENGTH &&
    characterCount <= GENERATION_CONFIG.MAX_TEXT_LENGTH;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid={`${testId}-form`}>
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={handleTextChange}
          placeholder={`Enter your text here (${GENERATION_CONFIG.MIN_TEXT_LENGTH}-${GENERATION_CONFIG.MAX_TEXT_LENGTH} characters)`}
          className="min-h-[200px] resize-y"
          disabled={isGenerating}
          data-testid={`${testId}-input`}
        />
        <div className="flex justify-between text-sm">
          <span
            className={error ? "text-destructive" : "text-muted-foreground"}
            data-testid={`${testId}-character-count`}
          >
            {error || `${characterCount} characters`}
          </span>
          <span className="text-muted-foreground" data-testid={`${testId}-characters-needed`}>
            {Math.max(GENERATION_CONFIG.MIN_TEXT_LENGTH - characterCount, 0)} characters needed
          </span>
        </div>
      </div>
      <Button type="submit" disabled={!isValid || isGenerating} className="w-full" data-testid={`${testId}-submit`}>
        {isGenerating ? "Generating..." : "Generate Flashcards"}
      </Button>
    </form>
  );
}
