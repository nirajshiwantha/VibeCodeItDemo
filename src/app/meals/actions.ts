"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getUserMeals(startDate?: string, endDate?: string) {
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

  return prisma.meal.findMany({
    where: {
      userId: user.id,
      ...(startDate && endDate ? {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {})
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
}

export async function createMeal(data: {
  name: string
  date: string
  notes?: string
  ingredients: Array<{
    foodId: string
    amount: number
    unit: string
  }>
}) {
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

  return prisma.meal.create({
    data: {
      name: data.name,
      date: new Date(data.date),
      notes: data.notes,
      userId: user.id,
      ingredients: {
        create: data.ingredients.map(ingredient => ({
          foodId: ingredient.foodId,
          amount: ingredient.amount,
          unit: ingredient.unit
        }))
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
}

export async function updateMeal(id: string, data: {
  name?: string
  date?: string
  notes?: string
  ingredients?: Array<{
    foodId: string
    amount: number
    unit: string
  }>
}) {
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

  // Check if user owns this meal
  const meal = await prisma.meal.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!meal || meal.userId !== user.id) {
    throw new Error("Meal not found or not authorized")
  }

  // If ingredients are being updated, delete existing ones and create new ones
  if (data.ingredients) {
    await prisma.ingredient.deleteMany({
      where: { mealId: id }
    })
  }

  return prisma.meal.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.ingredients && {
        ingredients: {
          create: data.ingredients.map(ingredient => ({
            foodId: ingredient.foodId,
            amount: ingredient.amount,
            unit: ingredient.unit
          }))
        }
      })
    },
    include: {
      ingredients: {
        include: {
          food: true
        }
      }
    }
  })
}

export async function deleteMeal(id: string) {
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

  // Check if user owns this meal
  const meal = await prisma.meal.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!meal || meal.userId !== user.id) {
    throw new Error("Meal not found or not authorized")
  }

  // Delete ingredients first, then meal
  await prisma.ingredient.deleteMany({
    where: { mealId: id }
  })

  return prisma.meal.delete({
    where: { id }
  })
} 