import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  const { preferences } = await req.json()
  let apiKey = process.env.OPENAI_API_KEY || ""
  // Try to get user-specific key
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { openAiApiKey: true } })
    if (user?.openAiApiKey) apiKey = user.openAiApiKey
  }
  console.log("[AI] Using OpenAI key:", apiKey ? apiKey.slice(0, 8) + "..." : "none")
  if (!apiKey) {
    // Fallback: try free public API
    const fallback = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
    if (fallback.ok) {
      const data = await fallback.json()
      const suggestions = (data.meals || []).slice(0, 5).map((m: any) => m.strMeal)
      if (suggestions.length > 0) return Response.json({ suggestions })
    }
    // Fallback: static suggestions
    return Response.json({
      suggestions: [
        "Grilled chicken salad with mixed greens and vinaigrette",
        "Oven-baked salmon with quinoa and steamed broccoli",
        "Vegetarian stir-fry with tofu, bell peppers, and brown rice",
        "Greek yogurt parfait with berries and nuts",
        "Chickpea and spinach curry with basmati rice",
      ],
    })
  }
  // Use OpenAI API
  const prompt = `Suggest 5 healthy meal ideas for: ${preferences}. List only the meal names, no explanations.`
  console.log("[AI] Prompt:", prompt)
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful meal planning assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  })
  console.log("[AI] OpenAI status:", res.status)
  let data = await res.json()
  console.log("[AI] OpenAI response:", JSON.stringify(data))
  if (!res.ok || data?.error?.code === "insufficient_quota") {
    // Fallback: try free public API
    const fallback = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=")
    if (fallback.ok) {
      const data2 = await fallback.json()
      const suggestions = (data2.meals || []).slice(0, 5).map((m: any) => m.strMeal)
      if (suggestions.length > 0) return Response.json({ suggestions })
    }
    // Fallback: static suggestions
    return Response.json({
      suggestions: [
        "Grilled chicken salad with mixed greens and vinaigrette",
        "Oven-baked salmon with quinoa and steamed broccoli",
        "Vegetarian stir-fry with tofu, bell peppers, and brown rice",
        "Greek yogurt parfait with berries and nuts",
        "Chickpea and spinach curry with basmati rice",
      ],
    })
  }
  const text = data.choices?.[0]?.message?.content || ""
  const suggestions = text
    .split(/\n|\d+\.|\-/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 5)
  return Response.json({ suggestions })
} 