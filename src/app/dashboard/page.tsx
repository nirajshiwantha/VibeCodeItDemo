"use client"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

interface DashboardData {
  todayNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    calorieGoal: number
    proteinGoal: number
  }
  weeklyMeals: Array<{
    date: string
    meals: Array<{
      name: string
      calories: number
    }>
  }>
  goals: {
    calorieTarget: number
    proteinTarget: number
    weightGoal: string
  }
  recentActivity: Array<{
    type: string
    description: string
    time: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [dashboardData] = useState<DashboardData>({
    todayNutrition: {
      calories: 1450,
      protein: 85,
      carbs: 165,
      fat: 48,
      calorieGoal: 2000,
      proteinGoal: 120
    },
    weeklyMeals: [
      { date: "Mon", meals: [{ name: "Breakfast", calories: 350 }, { name: "Lunch", calories: 450 }] },
      { date: "Tue", meals: [{ name: "Breakfast", calories: 320 }] },
      { date: "Wed", meals: [] },
      { date: "Thu", meals: [] },
      { date: "Fri", meals: [] },
      { date: "Sat", meals: [] },
      { date: "Sun", meals: [] }
    ],
    goals: {
      calorieTarget: 2000,
      proteinTarget: 120,
      weightGoal: "Maintain current weight"
    },
    recentActivity: [
      { type: "meal", description: "Added Grilled Chicken Salad to lunch", time: "2 hours ago" },
      { type: "recipe", description: "Created new recipe: Protein Smoothie", time: "1 day ago" },
      { type: "goal", description: "Updated daily calorie target", time: "3 days ago" }
    ]
  })

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  if (!session) {
    if (typeof window !== "undefined") window.location.href = "/"
    return null
  }

  const calorieProgress = (dashboardData.todayNutrition.calories / dashboardData.todayNutrition.calorieGoal) * 100
  const proteinProgress = (dashboardData.todayNutrition.protein / dashboardData.todayNutrition.proteinGoal) * 100

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your nutrition overview for today</p>
        </div>
        <div className="flex gap-2">
          <Link href="/meals"><Button>Plan Meals</Button></Link>
          <Link href="/food"><Button variant="outline">Add Food</Button></Link>
        </div>
      </div>

      {/* Today's Nutrition Summary */}
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Nutrition</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Calories */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-xs text-muted-foreground">
                {dashboardData.todayNutrition.calories} / {dashboardData.todayNutrition.calorieGoal}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              />
            </div>
            <div className="text-2xl font-bold">{dashboardData.todayNutrition.calories}</div>
            <div className="text-xs text-muted-foreground">
              {dashboardData.todayNutrition.calorieGoal - dashboardData.todayNutrition.calories} remaining
            </div>
          </div>

          {/* Protein */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Protein</span>
              <span className="text-xs text-muted-foreground">
                {dashboardData.todayNutrition.protein}g / {dashboardData.todayNutrition.proteinGoal}g
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(proteinProgress, 100)}%` }}
              />
            </div>
            <div className="text-2xl font-bold">{dashboardData.todayNutrition.protein}g</div>
            <div className="text-xs text-muted-foreground">
              {Math.max(0, dashboardData.todayNutrition.proteinGoal - dashboardData.todayNutrition.protein)}g remaining
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Carbohydrates</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.todayNutrition.carbs}g</div>
            <div className="text-xs text-muted-foreground">Complex carbs preferred</div>
          </div>

          {/* Fat */}
          <div className="bg-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Fat</span>
            </div>
            <div className="text-2xl font-bold">{dashboardData.todayNutrition.fat}g</div>
            <div className="text-xs text-muted-foreground">Healthy fats</div>
          </div>
        </div>
      </div>

      {/* Weekly Meal Plan Overview */}
      <div className="bg-muted rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">This Week's Meal Plan</h2>
          <Link href="/meals">
            <Button variant="outline" size="sm">View Full Calendar</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {dashboardData.weeklyMeals.map((day, index) => (
            <div key={index} className="bg-background rounded-lg p-3">
              <div className="font-medium text-center mb-2">{day.date}</div>
              <div className="space-y-1">
                {day.meals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center">No meals planned</p>
                ) : (
                  day.meals.map((meal, mealIndex) => (
                    <div key={mealIndex} className="text-xs bg-muted p-2 rounded">
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-muted-foreground">{meal.calories} cal</div>
                    </div>
                  ))
                )}
              </div>
              {day.meals.length === 0 && (
                <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                  Add Meal
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Goals & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Goals */}
        <div className="bg-muted rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Goals</h2>
            <Button variant="outline" size="sm">Edit Goals</Button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Daily Calories</span>
              <span className="text-muted-foreground">{dashboardData.goals.calorieTarget} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Daily Protein</span>
              <span className="text-muted-foreground">{dashboardData.goals.proteinTarget}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Weight Goal</span>
              <span className="text-muted-foreground">{dashboardData.goals.weightGoal}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-muted rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'meal' ? 'bg-green-500' : 
                  activity.type === 'recipe' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/meals">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <span className="text-2xl">🍽️</span>
              <span>Add Meal</span>
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <span className="text-2xl">📝</span>
              <span>Create Recipe</span>
            </Button>
          </Link>
          <Link href="/food">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <span className="text-2xl">🔍</span>
              <span>Search Foods</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
            <span className="text-2xl">📊</span>
            <span>View Reports</span>
          </Button>
        </div>
      </div>

      {/* Printable Options */}
      <div className="bg-muted rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Printable Plans</h2>
        <div className="flex gap-4">
          <Button variant="outline">📄 Print Weekly Meal Plan</Button>
          <Button variant="outline">🛒 Print Shopping List</Button>
          <Button variant="outline">📈 Print Nutrition Summary</Button>
        </div>
      </div>
    </main>
  )
} 