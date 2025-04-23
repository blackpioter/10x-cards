import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/lib/hooks/useLocation";
import { LogOut } from "lucide-react";

const navItems = [
  { href: "/flashcards", label: "Flashcards" },
  { href: "/generate", label: "Generate" },
];

export function TopNavbar() {
  const location = useLocation();

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive hover:border-destructive/50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
