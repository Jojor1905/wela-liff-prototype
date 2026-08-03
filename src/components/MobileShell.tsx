import type { ReactNode } from "react";
import { LiffHeader } from "./LiffHeader";

export function MobileShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`mobile-shell ${className}`}>
      <LiffHeader />
      {children}
    </main>
  );
}
