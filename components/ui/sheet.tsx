"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export function SheetContent({ className, children, side = "bottom", ...props }: React.ComponentProps<typeof Dialog.Content> & { side?: "bottom" | "right" }) {
  return <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" /><Dialog.Content className={cn("fixed z-50 border border-border bg-background p-6 shadow-2xl outline-none", side === "bottom" ? "inset-x-0 bottom-0 rounded-t-3xl" : "inset-y-0 right-0 w-full max-w-md rounded-l-3xl", className)} {...props}>{children}<Dialog.Close className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></Dialog.Close></Dialog.Content></Dialog.Portal>;
}
export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("space-y-1.5", className)} {...props} />;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;
