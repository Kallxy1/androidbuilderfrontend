import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = "https://build.xystudio.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BuildBox — Compile Project", template: "%s · BuildBox" },
  description: "Compile Android, Jetpack Compose, Flutter, Java, Kotlin, dan Dart menjadi APK, AAB, atau artifact.",
  applicationName: "BuildBox",
  authors: [{ name: "XyStudio" }, { name: "XyKelOmex" }],
  creator: "XyStudio",
  publisher: "XyStudio",
  keywords: ["Android compiler", "APK builder", "Flutter builder", "Jetpack Compose", "Kotlin", "Java", "Dart"],
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "BuildBox",
    title: "BuildBox — Compile Project",
    description: "Upload project. Get your APK.",
    images: [{ url: "/og-banner.png", width: 1200, height: 630, alt: "BuildBox compile project banner" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "BuildBox — Compile Project",
    description: "Upload project. Get your APK.",
    images: ["/og-banner.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6232015754716037" crossOrigin="anonymous" strategy="afterInteractive" />
      <Script src="https://quge5.com/88/tag.min.js" data-zone="262527" strategy="afterInteractive" data-cfasync="false" /></body></html>;
}
