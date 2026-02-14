import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={["rounded-xl border border-gray-200 bg-white shadow-sm", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={["p-4 border-b border-gray-100", className].join(" ")}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={["p-4", className].join(" ")}>{children}</div>;
}