"use client"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AuthGuard from "@/components/auth-guard"
import { getDashboardData } from "./actions"

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

const MOTIVATION_QUOTES = [
  "Consistency is the key to success.",
  "Fuel your body, fuel your life.",
  "Healthy habits, happy life.",
  "Progress, not perfection.",
  "You are what you eat, so don't be fast, cheap, easy, or fake."
]
const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todayNutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      calorieGoal: 2000,
      proteinGoal: 120
    },
    weeklyMeals: [],
    goals: {
      calorieTarget: 2000,
      proteinTarget: 120,
      weightGoal: "Maintain current weight"
    },
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const data = await getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      // Keep default data on error
    } finally {
      setIsLoading(false)
    }
  }

  const calorieProgress = (dashboardData.todayNutrition.calories / dashboardData.todayNutrition.calorieGoal) * 100
  const proteinProgress = (dashboardData.todayNutrition.protein / dashboardData.todayNutrition.proteinGoal) * 100

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
        {/* Clean Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 border border-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}! 🌟
            </h1>
            <p className="text-xl text-gray-600 italic mb-4">"{randomQuote}"</p>
            <p className="text-gray-600">Here's your nutrition overview for today</p>
          </div>
        </motion.div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Link href="/meals"><Button>Plan Meals</Button></Link>
            <Link href="/food"><Button variant="outline">Add Food</Button></Link>
          </div>
        </div>

        {/* Today's Nutrition Summary */}
        <motion.div className="bg-muted rounded-lg p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h2 className="text-xl font-semibold mb-4">Today's Nutrition</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Calories */}
            <motion.div className="bg-background rounded-lg p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(dashboardData.todayNutrition.calories)} / {dashboardData.todayNutrition.calorieGoal}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(calorieProgress, 100)}%`, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <div className="text-2xl font-bold">{Math.round(dashboardData.todayNutrition.calories)}</div>
              <div className="text-xs text-muted-foreground">
                {Math.max(0, dashboardData.todayNutrition.calorieGoal - dashboardData.todayNutrition.calories)} remaining
              </div>
            </motion.div>

            {/* Protein */}
            <motion.div className="bg-background rounded-lg p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(dashboardData.todayNutrition.protein)}g / {dashboardData.todayNutrition.proteinGoal}g
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(proteinProgress, 100)}%`, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <div className="text-2xl font-bold">{Math.round(dashboardData.todayNutrition.protein)}g</div>
              <div className="text-xs text-muted-foreground">
                {Math.max(0, dashboardData.todayNutrition.proteinGoal - dashboardData.todayNutrition.protein)}g remaining
              </div>
            </motion.div>

            {/* Carbs */}
            <motion.div className="bg-background rounded-lg p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Carbohydrates</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(dashboardData.todayNutrition.carbs)}g</div>
              <div className="text-xs text-muted-foreground">Complex carbs preferred</div>
            </motion.div>

            {/* Fat */}
            <motion.div className="bg-background rounded-lg p-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Fat</span>
              </div>
              <div className="text-2xl font-bold">{Math.round(dashboardData.todayNutrition.fat)}g</div>
              <div className="text-xs text-muted-foreground">Healthy fats</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Weekly Meal Plan Overview */}
        <motion.div className="bg-muted rounded-lg p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">This Week's Meal Plan</h2>
            <Link href="/meals">
              <Button variant="outline" size="sm">View Full Calendar</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {dashboardData.weeklyMeals.length > 0 ? (
              dashboardData.weeklyMeals.map((day, index) => (
                <motion.div key={index} className="bg-background rounded-lg p-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                  <div className="font-medium text-center mb-2">{day.date}</div>
                  <div className="space-y-1">
                    {day.meals.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center">No meals planned</p>
                    ) : (
                      day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="text-xs bg-muted p-2 rounded">
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-muted-foreground">{Math.round(meal.calories)} cal</div>
                        </div>
                      ))
                    )}
                  </div>
                  {day.meals.length === 0 && (
                    <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                      Add Meal
                    </Button>
                  )}
                </motion.div>
              ))
            ) : (
              // Show 7 empty days if no data
              Array.from({ length: 7 }, (_, index) => {
                const date = new Date()
                date.setDate(date.getDate() + index)
                return (
                  <motion.div key={index} className="bg-background rounded-lg p-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                    <div className="font-medium text-center mb-2">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground text-center">No meals planned</p>
                    </div>
                    <Link href="/meals">
                      <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                        Add Meal
                      </Button>
                    </Link>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Goals & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Goals */}
          <motion.div className="bg-muted rounded-lg p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Goals</h2>
              <Link href="/profile">
                <Button variant="outline" size="sm">Edit Goals</Button>
              </Link>
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
          </motion.div>

          {/* Recent Activity */}
          <motion.div className="bg-muted rounded-lg p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity, index) => (
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
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start by adding a meal or recipe!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div className="bg-muted rounded-lg p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/meals">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <span className="text-2xl">🍽️</span>
                  <span>Add Meal</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/recipes">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <span className="text-2xl">📝</span>
                  <span>Create Recipe</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/food">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <span className="text-2xl">🔍</span>
                  <span>Search Foods</span>
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/health">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <span className="text-2xl">📊</span>
                  <span>Track Health</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

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
    </AuthGuard>
  )
} 