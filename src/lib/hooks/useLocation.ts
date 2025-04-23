import { useEffect, useState } from "react";

export function useLocation(): string {
  const [currentPath, setCurrentPath] = useState<string>("/");

  useEffect(() => {
    // Initialize with current pathname when component mounts (client-side)
    setCurrentPath(window.location.pathname);

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener("popstate", handleLocationChange);

    // Listen for click events on anchor tags
    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (
        anchor &&
        anchor.href &&
        anchor.origin === window.location.origin &&
        !anchor.hasAttribute("download") &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        const url = new URL(anchor.href);
        setCurrentPath(url.pathname);
        window.history.pushState({}, "", url.pathname);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return currentPath;
}
