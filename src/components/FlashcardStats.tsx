import { Card, CardContent } from "@/components/ui/card";

interface FlashcardStatsProps {
  currentListTotal: number;
  pendingReviewCount: number;
}

export default function FlashcardStats({ currentListTotal, pendingReviewCount }: FlashcardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{currentListTotal}</div>
          <p className="text-sm text-muted-foreground">Total flashcards in current view</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{pendingReviewCount}</div>
          <p className="text-sm text-muted-foreground">Flashcards pending review</p>
        </CardContent>
      </Card>
    </div>
  );
}
