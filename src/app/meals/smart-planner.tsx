"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const TABS = [
  { key: "ai", label: "AI Suggestions" },
  { key: "auto", label: "Auto Meal Plan" },
  { key: "shopping", label: "Shopping List" },
  { key: "pantry", label: "Pantry" },
  { key: "analytics", label: "Analytics" },
]

export default function SmartPlannerPage() {
  const [tab, setTab] = useState("ai")
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold mb-4">Smart Meal Planning</h1>
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {tab === "ai" && <AISuggestionsSection />}
      {tab === "auto" && <AutoMealPlanSection />}
      {tab === "shopping" && <ShoppingListSection />}
      {tab === "pantry" && <PantrySection />}
      {tab === "analytics" && <AnalyticsSection />}
    </main>
  )
}

function AISuggestionsSection() {
  const [preferences, setPreferences] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState("")

  const handleGetSuggestions = async () => {
    setLoading(true)
    setError("")
    setSuggestions([])
    try {
      console.log("[AI] Requesting /api/ai-meal-suggestions", { preferences })
      const res = await fetch("/api/ai-meal-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      })
      console.log("[AI] Response status:", res.status)
      const data = await res.json()
      console.log("[AI] Response data:", data)
      if (!res.ok) throw new Error("Failed to get suggestions")
      setSuggestions(data.suggestions || [])
    } catch (e: any) {
      setError(e.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">AI Meal Suggestions</h2>
      <div className="mb-2 text-muted-foreground">Get personalized meal recommendations powered by AI.</div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter your preferences, goals, or dietary needs..."
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
        />
        <Button onClick={handleGetSuggestions} disabled={loading || !preferences}>
          {loading ? "Loading..." : "Get AI Suggestions"}
        </Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {suggestions.length > 0 && (
        <ul className="space-y-2 mt-4">
          {suggestions.map((s, i) => (
            <li key={i} className="bg-background p-3 rounded border text-sm">{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AutoMealPlanSection() {
  // TODO: Implement auto-generation logic
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Auto-Generate Weekly Meal Plan</h2>
      <div className="mb-2 text-muted-foreground">Automatically generate a meal plan based on your goals and preferences. (Stub: ready for future logic)</div>
      <Button disabled>Auto-Generate Plan (Coming Soon)</Button>
    </div>
  )
}

function ShoppingListSection() {
  // TODO: Aggregate ingredients from planned meals
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Smart Shopping List</h2>
      <div className="mb-2 text-muted-foreground">Your shopping list will be generated here based on your meal plan. (Stub: ready for future logic)</div>
      <Button disabled>Generate Shopping List (Coming Soon)</Button>
    </div>
  )
}

function PantrySection() {
  // TODO: Pantry CRUD
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Pantry Management</h2>
      <div className="mb-2 text-muted-foreground">Track your pantry items, expiration, and usage. (Stub: ready for future logic)</div>
      <Button disabled>Add Pantry Item (Coming Soon)</Button>
    </div>
  )
}

function AnalyticsSection() {
  // TODO: Show eating patterns, cost, efficiency, time-saving
  return (
    <div className="bg-muted rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Advanced Analytics</h2>
      <div className="mb-2 text-muted-foreground">Meal planning analytics and insights will appear here. (Stub: ready for future logic)</div>
      <Button disabled>View Analytics (Coming Soon)</Button>
    </div>
  )
} 