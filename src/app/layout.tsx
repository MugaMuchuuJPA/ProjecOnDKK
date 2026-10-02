import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectOn DKK",
  description: "Aplicativo oficial da associação Dragão Karatê Do Kyokai",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DKK Karatê",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
