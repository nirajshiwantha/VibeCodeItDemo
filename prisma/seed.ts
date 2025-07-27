import { PrismaClient } from "../src/generated/prisma"
const prisma = new PrismaClient()

async function main() {
  await prisma.food.createMany({
    data: [
      { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, dietaryTags: ["protein", "low-carb"] },
      { name: "Brown Rice", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, dietaryTags: ["grain", "complex-carb"] },
      { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, dietaryTags: ["vegetable", "fiber"] },
      { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, dietaryTags: ["fruit", "fiber"] },
      { name: "Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5, dietaryTags: ["protein", "healthy-fat"] },
      { name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, dietaryTags: ["protein", "omega-3"] },
      { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50, dietaryTags: ["nuts", "healthy-fat"] },
      { name: "Oats", calories: 389, protein: 17, carbs: 66, fat: 7, dietaryTags: ["grain", "fiber"] },
      { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, dietaryTags: ["fruit", "potassium"] },
      { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, dietaryTags: ["dairy", "protein"] },
      { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, dietaryTags: ["vegetable", "complex-carb"] },
      { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, dietaryTags: ["vegetable", "iron"] },
      { name: "Quinoa", calories: 120, protein: 4.4, carbs: 22, fat: 1.9, dietaryTags: ["grain", "complete-protein"] },
      { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, dietaryTags: ["fruit", "healthy-fat"] },
      { name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, dietaryTags: ["protein", "lean"] },
      { name: "Lentils", calories: 116, protein: 9, carbs: 20, fat: 0.4, dietaryTags: ["legume", "fiber"] },
      { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, dietaryTags: ["fruit", "antioxidant"] },
      { name: "Tuna", calories: 144, protein: 30, carbs: 0, fat: 1, dietaryTags: ["protein", "omega-3"] },
      { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, dietaryTags: ["dairy", "protein"] },
      { name: "Carrots", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, dietaryTags: ["vegetable", "beta-carotene"] }
    ],
    skipDuplicates: true,
  })
  console.log("✅ Food database seeded successfully!")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect()) 