import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={[
        "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none",
        "focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
        "placeholder:text-gray-400",
        className,
      ].join(" ")}
      {...props}
    />
  );
}