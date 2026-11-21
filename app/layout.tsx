import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/young-serif";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "@fontsource/caveat/500.css";
import "@fontsource/caveat/700.css";
import "@fontsource/homemade-apple";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little North Pole · A personal Santa video and letter for your child",
  description:
    "A personal animated video from Santa starring your child, about the good things they did this year. Plus a printable letter, Nice List certificate and envelope. Ready tonight.",
  openGraph: {
    title: "A personal Santa video starring your child, ready tonight",
    description: "Santa checks the Nice List, reads the elves' report on their good deed and approves their wish. Plus printable letter and certificate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://www.ship-or-die.com/hackathon/verify.js" data-site="986189b0c8b02d20bd762b98cb28d9ffdf6a7398"></script>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
