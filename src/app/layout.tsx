import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/client-providers"
import Link from "next/link"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutriTrack Pro - Meal Planning & Health Tracking",
  description: "Plan nutritious meals, track your health metrics, and achieve your wellness goals with NutriTrack Pro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <nav className="w-full flex items-center justify-center gap-6 py-4 border-b bg-background">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/meals" className="hover:text-primary transition-colors">
              Meals
            </Link>
            <Link href="/food" className="hover:text-primary transition-colors">
              Food
            </Link>
            <Link href="/recipes" className="hover:text-primary transition-colors">
              Recipes
            </Link>
            <Link href="/health" className="hover:text-primary transition-colors">
              Health
            </Link>
            <Link href="/profile">Profile</Link>
          </nav>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
