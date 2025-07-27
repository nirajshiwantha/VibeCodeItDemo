"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error("Not authenticated")
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
  if (!user) throw new Error("User not found")
  return user.id
}

// Weight logs (type = 'weight')
export async function getWeightLogs() {
  const userId = await getUserId()
  return prisma.healthMetric.findMany({
    where: { userId, type: "weight" },
    orderBy: { date: "desc" },
    take: 100
  })
}
export async function addWeightLog(value: number, date: Date) {
  const userId = await getUserId()
  return prisma.healthMetric.create({ data: { userId, type: "weight", value, date } })
}
export async function deleteWeightLog(id: string) {
  const userId = await getUserId()
  return prisma.healthMetric.delete({ where: { id } })
}

// Measurements
export async function getMeasurements(type?: string) {
  const userId = await getUserId()
  return prisma.measurement.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { date: "desc" },
    take: 100
  })
}
export async function addMeasurement(type: string, value: number, date: Date) {
  const userId = await getUserId()
  return prisma.measurement.create({ data: { userId, type, value, date } })
}
export async function deleteMeasurement(id: string) {
  const userId = await getUserId()
  return prisma.measurement.delete({ where: { id } })
}

// Water intake
export async function getWaterIntakeLogs() {
  const userId = await getUserId()
  return prisma.waterIntake.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 })
}
export async function addWaterIntake(amount: number, date: Date, goal?: number) {
  const userId = await getUserId()
  return prisma.waterIntake.create({ data: { userId, amount, date, goal } })
}
export async function deleteWaterIntake(id: string) {
  const userId = await getUserId()
  return prisma.waterIntake.delete({ where: { id } })
}

// Sleep logs
export async function getSleepLogs() {
  const userId = await getUserId()
  return prisma.sleepLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 })
}
export async function addSleepLog(duration: number, quality: number, date: Date) {
  const userId = await getUserId()
  return prisma.sleepLog.create({ data: { userId, duration, quality, date } })
}
export async function deleteSleepLog(id: string) {
  const userId = await getUserId()
  return prisma.sleepLog.delete({ where: { id } })
}

// Mood logs
export async function getMoodLogs() {
  const userId = await getUserId()
  return prisma.moodLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 })
}
export async function addMoodLog(mood: number, energy: number, notes: string, date: Date) {
  const userId = await getUserId()
  return prisma.moodLog.create({ data: { userId, mood, energy, notes, date } })
}
export async function deleteMoodLog(id: string) {
  const userId = await getUserId()
  return prisma.moodLog.delete({ where: { id } })
}

// Custom health metrics
export async function getCustomMetrics() {
  const userId = await getUserId()
  return prisma.customHealthMetric.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 })
}
export async function addCustomMetric(name: string, value: number, unit: string, date: Date) {
  const userId = await getUserId()
  return prisma.customHealthMetric.create({ data: { userId, name, value, unit, date } })
}
export async function deleteCustomMetric(id: string) {
  const userId = await getUserId()
  return prisma.customHealthMetric.delete({ where: { id } })
}

// Health goals
export async function getHealthGoals() {
  const userId = await getUserId()
  return prisma.healthGoal.findMany({ where: { userId, active: true }, orderBy: { startDate: "desc" } })
}
export async function addHealthGoal(type: string, target: number, unit: string, startDate: Date, endDate?: Date) {
  const userId = await getUserId()
  return prisma.healthGoal.create({ data: { userId, type, target, unit, startDate, endDate } })
}
export async function completeHealthGoal(id: string) {
  const userId = await getUserId()
  return prisma.healthGoal.update({ where: { id }, data: { active: false, endDate: new Date() } })
}

// Medical conditions
export async function getMedicalConditions() {
  const userId = await getUserId()
  return prisma.medicalCondition.findMany({ where: { userId } })
}
export async function addMedicalCondition(name: string, notes?: string) {
  const userId = await getUserId()
  return prisma.medicalCondition.create({ data: { userId, name, notes } })
}
export async function deleteMedicalCondition(id: string) {
  const userId = await getUserId()
  return prisma.medicalCondition.delete({ where: { id } })
}

// Allergies
export async function getAllergies() {
  const userId = await getUserId()
  return prisma.allergy.findMany({ where: { userId } })
}
export async function addAllergy(name: string, severity?: string) {
  const userId = await getUserId()
  return prisma.allergy.create({ data: { userId, name, severity } })
}
export async function deleteAllergy(id: string) {
  const userId = await getUserId()
  return prisma.allergy.delete({ where: { id } })
} 