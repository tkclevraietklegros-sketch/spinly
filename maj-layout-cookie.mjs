import { writeFileSync } from "fs";

const content = `import type { Metadata } from "next";
import "./globals.css";
import BandeauCookie from "./components/BandeauCookie";

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
      <body>
        {children}
        <BandeauCookie />
      </body>
    </html>
  );
}
`;

writeFileSync("app/layout.tsx", content, "utf8");
console.log("OK - app/layout.tsx mis a jour avec le bandeau cookie");