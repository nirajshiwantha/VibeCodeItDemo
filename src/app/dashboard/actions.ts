"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getDashboardData() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get today's meals
  const todayMeals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      ingredients: {
        include: {
          food: true
        }
      }
    }
  })

  // Calculate today's nutrition
  const todayNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  }

  todayMeals.forEach(meal => {
    meal.ingredients.forEach(ingredient => {
      const multiplier = ingredient.amount / 100 // Assuming nutrition per 100g
      todayNutrition.calories += ingredient.food.calories * multiplier
      todayNutrition.protein += ingredient.food.protein * multiplier
      todayNutrition.carbs += ingredient.food.carbs * multiplier
      todayNutrition.fat += ingredient.food.fat * multiplier
    })
  })

  // Get this week's meals
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const weeklyMeals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      date: {
        gte: weekStart,
        lt: weekEnd
      }
    },
    include: {
      ingredients: {
        include: {
          food: true
        }
      }
    },
    orderBy: { date: "asc" }
  })

  // Group meals by day
  const weeklyMealsGrouped = []
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart)
    dayDate.setDate(dayDate.getDate() + i)
    
    const dayMeals = weeklyMeals.filter(meal => {
      const mealDate = new Date(meal.date)
      return mealDate.toDateString() === dayDate.toDateString()
    })

    weeklyMealsGrouped.push({
      date: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      meals: dayMeals.map(meal => {
        let calories = 0
        meal.ingredients.forEach(ingredient => {
          const multiplier = ingredient.amount / 100
          calories += ingredient.food.calories * multiplier
        })
        return {
          name: meal.name,
          calories: Math.round(calories)
        }
      })
    })
  }

  return {
    todayNutrition: {
      calories: Math.round(todayNutrition.calories),
      protein: Math.round(todayNutrition.protein),
      carbs: Math.round(todayNutrition.carbs),
      fat: Math.round(todayNutrition.fat),
      calorieGoal: 2000, // Default goal
      proteinGoal: 120   // Default goal
    },
    weeklyMeals: weeklyMealsGrouped,
    goals: {
      calorieTarget: 2000,
      proteinTarget: 120,
      weightGoal: "Maintain current weight"
    },
    recentActivity: [
      { type: "meal", description: "View your recent meals in the Meals section", time: "Today" },
      { type: "recipe", description: "Create your first recipe in the Recipes section", time: "Get started" },
      { type: "goal", description: "Set your nutrition goals in Profile", time: "Recommended" }
    ]
  }
} 