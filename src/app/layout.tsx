import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Recruitment MBTI Assessment Tool",
  description: "Decision Maker Personality Assessment for academic leadership recruitment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}