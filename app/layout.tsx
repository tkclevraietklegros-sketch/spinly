import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roue Restaurant",
  description: "Tentez votre chance !",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico"/>
      </head>
      <body>{children}</body>
    </html>
  );
}