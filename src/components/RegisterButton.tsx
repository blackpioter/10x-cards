import { Button } from "./ui/button";
import { useFeatureFlag } from "../lib/hooks/useFeatureFlag";

export function RegisterButton() {
  const isRegisterEnabled = useFeatureFlag("registerEnabled");

  if (!isRegisterEnabled) {
    return null;
  }

  return (
    <Button variant="default" asChild>
      <a href="/register">Register</a>
    </Button>
  );
}
