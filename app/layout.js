import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Mepco Eco-Hub | Sustainability Intelligence Portal",
  description: "Real-time carbon footprint tracking and sustainability management for Mepco Schlenk Engineering College",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
