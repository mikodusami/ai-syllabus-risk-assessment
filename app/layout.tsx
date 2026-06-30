import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virginia Tech Syllabus AI Risk Assessment",
  description:
    "Upload your syllabus and get AI-powered recommendations to make your course more resistant to generative AI misuse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
