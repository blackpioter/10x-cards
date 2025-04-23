import React from "react";
import { Button } from "./ui/button";
import { useLocation } from "@/lib/hooks/useLocation";

const navItems = [
  { href: "/flashcards", label: "Flashcards" },
  { href: "/generate", label: "Generate" },
];

export function TopNavbar() {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
