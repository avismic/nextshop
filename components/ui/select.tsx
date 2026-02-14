import { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", ...props }: Props) {
  return (
    <select
      className={[
        "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none",
        "focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
        className,
      ].join(" ")}
      {...props}
    />
  );
}