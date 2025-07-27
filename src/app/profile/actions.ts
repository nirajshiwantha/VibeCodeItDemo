"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getUserProfile() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      age: true,
      gender: true,
      heightCm: true,
      weightKg: true,
      activityLevel: true,
    },
  })

  return user
}

export async function updateUserProfile(data: {
  age?: number
  gender?: string
  heightCm?: number
  weightKg?: number
  activityLevel?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      age: data.age,
      gender: data.gender,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      activityLevel: data.activityLevel,
    },
  })

  return updatedUser
}

export async function getUserOpenAiKey() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Not authenticated")
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { openAiApiKey: true } })
  return user?.openAiApiKey || ""
}

export async function updateUserOpenAiKey(key: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Not authenticated")
  await prisma.user.update({ where: { email: session.user.email }, data: { openAiApiKey: key } })
  return true
} 