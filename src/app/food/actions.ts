"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getFoods(query?: string, filters?: { type?: string; cuisine?: string; dietaryRestriction?: string }) {
  return prisma.food.findMany({
    where: {
      ...(query
        ? {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }
        : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.cuisine ? { cuisine: filters.cuisine } : {}),
      ...(filters?.dietaryRestriction
        ? { dietaryTags: { has: filters.dietaryRestriction } }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 50,
  })
}

export async function createCustomFood(data: {
  name: string
  brand?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  type?: string
  cuisine?: string
  dietaryTags: string[]
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

  return prisma.food.create({
    data: {
      ...data,
      createdById: user.id,
    },
  })
}

export async function updateFood(id: string, data: {
  name?: string
  brand?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  type?: string
  cuisine?: string
  dietaryTags?: string[]
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  // Check if user owns this food item
  const food = await prisma.food.findUnique({
    where: { id },
    include: { createdBy: true }
  })

  if (!food) {
    throw new Error("Food not found")
  }

  if (food.createdBy?.email !== session.user.email) {
    throw new Error("Not authorized to edit this food")
  }

  return prisma.food.update({
    where: { id },
    data,
  })
}

export async function deleteFood(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  // Check if user owns this food item
  const food = await prisma.food.findUnique({
    where: { id },
    include: { createdBy: true }
  })

  if (!food) {
    throw new Error("Food not found")
  }

  if (food.createdBy?.email !== session.user.email) {
    throw new Error("Not authorized to delete this food")
  }

  return prisma.food.delete({
    where: { id },
  })
} 