"use client"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function Navigation() {
  const { data: session } = useSession()

  // Don't show navigation if user is not authenticated
  if (!session) {
    return null
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="hover:text-primary transition-colors font-medium">
          Dashboard
        </Link>
        <Link href="/meals" className="hover:text-primary transition-colors font-medium">
          Meals
        </Link>
        <Link href="/food" className="hover:text-primary transition-colors font-medium">
          Food
        </Link>
        <Link href="/recipes" className="hover:text-primary transition-colors font-medium">
          Recipes
        </Link>
        <Link href="/health" className="hover:text-primary transition-colors font-medium">
          Health
        </Link>
        <Link href="/profile" className="hover:text-primary transition-colors font-medium">
          Profile
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {session.user?.name?.split(' ')[0] || 'User'}
        </span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          Sign Out
        </Button>
      </div>
    </nav>
  )
} 