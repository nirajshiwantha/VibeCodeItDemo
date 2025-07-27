"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold">NutriTrack Pro</h1>
      <p className="text-lg text-gray-600">Plan meals, track health, and reach your goals.</p>
      {session ? (
        <div className="flex flex-col items-center gap-4">
          <span>Welcome, {session.user?.name || session.user?.email}!</span>
          <Button onClick={() => window.location.href = "/dashboard"}>Go to Dashboard</Button>
          <Link href="/food"><Button variant="secondary">Food Database</Button></Link>
          <Link href="/profile"><Button variant="secondary">Profile</Button></Link>
          <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
        </div>
      ) : (
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      )}
    </main>
  )
}
