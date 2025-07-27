"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getUserRecipes(query?: string, category?: string) {
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

  return prisma.recipe.findMany({
    where: {
      userId: user.id,
      ...(query && {
        name: {
          contains: query,
          mode: "insensitive"
        }
      }),
      ...(category && { category })
    },
    include: {
      ingredients: {
        include: {
          food: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

export async function createRecipe(data: {
  name: string
  instructions: string
  category: string
  servings: number
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

  return prisma.recipe.create({
    data: {
      name: data.name,
      instructions: data.instructions,
      category: data.category,
      servings: data.servings,
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

export async function updateRecipe(id: string, data: {
  name?: string
  instructions?: string
  category?: string
  servings?: number
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

  // Check if user owns this recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!recipe || recipe.userId !== user.id) {
    throw new Error("Recipe not found or not authorized")
  }

  // If ingredients are being updated, delete existing ones and create new ones
  if (data.ingredients) {
    await prisma.ingredient.deleteMany({
      where: { recipeId: id }
    })
  }

  return prisma.recipe.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.instructions && { instructions: data.instructions }),
      ...(data.category && { category: data.category }),
      ...(data.servings && { servings: data.servings }),
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

export async function deleteRecipe(id: string) {
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

  // Check if user owns this recipe
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { userId: true }
  })

  if (!recipe || recipe.userId !== user.id) {
    throw new Error("Recipe not found or not authorized")
  }

  // Delete ingredients first, then recipe
  await prisma.ingredient.deleteMany({
    where: { recipeId: id }
  })

  return prisma.recipe.delete({
    where: { id }
  })
} 