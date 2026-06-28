import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./components/PageTransition";

export const metadata: Metadata = {
  title: "Spinly",
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
      <body>
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}