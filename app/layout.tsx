import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = { title: "BuildBox — Compile Project", description: "Compile Android, Flutter, Java, Kotlin and Dart projects." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
