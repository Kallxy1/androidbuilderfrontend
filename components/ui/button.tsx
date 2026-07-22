import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "danger"; size?: "default" | "sm" | "icon" }) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:pointer-events-none disabled:opacity-45", variant === "default" && "bg-foreground text-background shadow-sm hover:opacity-85", variant === "outline" && "border border-border bg-transparent hover:bg-muted", variant === "ghost" && "hover:bg-muted", variant === "danger" && "bg-red-600 text-white hover:bg-red-500", size === "default" && "h-11 px-5", size === "sm" && "h-9 px-3 text-sm", size === "icon" && "size-10", className)} {...props} />;
}
