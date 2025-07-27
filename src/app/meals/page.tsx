"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from "next/link"

interface Meal {
  id: string
  name: string
  date: string
  ingredients: Array<{
    id: string
    foodName: string
    amount: number
    unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  totalNutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])
  const [newMeal, setNewMeal] = useState({
    name: "",
    ingredients: [] as any[]
  })

  // Generate 7-day calendar
  const getWeekDays = () => {
    const today = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate()
      })
    }
    return days
  }

  const weekDays = getWeekDays()

  const getMealsForDate = (date: string) => {
    return meals.filter(meal => meal.date === date)
  }

  const getDayTotalNutrition = (date: string) => {
    const dayMeals = getMealsForDate(date)
    return dayMeals.reduce((total, meal) => ({
      calories: total.calories + meal.totalNutrition.calories,
      protein: total.protein + meal.totalNutrition.protein,
      carbs: total.carbs + meal.totalNutrition.carbs,
      fat: total.fat + meal.totalNutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meal Planner</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddMeal(!showAddMeal)}>
            {showAddMeal ? "Cancel" : "Add Meal"}
          </Button>
          <Link href="/meals/smart-planner"><Button variant="outline">Smart Planner</Button></Link>
        </div>
      </div>

      {/* Add Meal Form */}
      {showAddMeal && (
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-4">Create New Meal</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Meal name (e.g., Breakfast, Lunch)" 
                value={newMeal.name}
                onChange={e => setNewMeal({...newMeal, name: e.target.value})}
              />
              <input 
                type="date" 
                className="p-2 border rounded-md"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Add Ingredients</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <Input placeholder="Search food..." />
                <Input placeholder="Amount" type="number" />
                <select className="p-2 border rounded-md">
                  <option value="g">grams</option>
                  <option value="oz">ounces</option>
                  <option value="cup">cups</option>
                  <option value="piece">pieces</option>
                </select>
                <Button size="sm">Add Ingredient</Button>
              </div>
              
              {/* Ingredients List */}
              <div className="space-y-2">
                {newMeal.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex justify-between items-center bg-background p-2 rounded">
                    <span>{ingredient.amount}{ingredient.unit} {ingredient.foodName}</span>
                    <Button size="sm" variant="outline">Remove</Button>
                  </div>
                ))}
                {newMeal.ingredients.length === 0 && (
                  <p className="text-muted-foreground text-sm">No ingredients added yet</p>
                )}
              </div>
            </div>

            {/* Nutritional Summary */}
            <div className="bg-background rounded-lg p-4">
              <h4 className="font-medium mb-2">Nutritional Summary</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">0</div>
                  <div className="text-muted-foreground">Calories</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">0g</div>
                  <div className="text-muted-foreground">Protein</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">0g</div>
                  <div className="text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">0g</div>
                  <div className="text-muted-foreground">Fat</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button>Save Meal</Button>
              <Button variant="outline" onClick={() => setShowAddMeal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Meal Calendar */}
      <div className="bg-muted rounded-lg p-6">
        <h3 className="font-semibold mb-4">7-Day Meal Calendar</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map(day => {
            const dayMeals = getMealsForDate(day.date)
            const dayNutrition = getDayTotalNutrition(day.date)
            const isSelected = day.date === selectedDate
            
            return (
              <div 
                key={day.date} 
                className={`bg-background rounded-lg p-4 border-2 cursor-pointer transition-colors ${
                  isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground/20'
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="text-center mb-3">
                  <div className="font-semibold">{day.day}</div>
                  <div className="text-2xl font-bold">{day.dayNum}</div>
                </div>
                
                <div className="space-y-2 mb-3">
                  {dayMeals.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center">No meals planned</p>
                  ) : (
                    dayMeals.map(meal => (
                      <div key={meal.id} className="text-xs bg-muted p-2 rounded">
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-muted-foreground">
                          {meal.totalNutrition.calories} cal
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Daily Nutrition Summary */}
                <div className="text-xs border-t pt-2">
                  <div className="font-medium mb-1">Daily Total</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span>{dayNutrition.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span>{dayNutrition.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span>{dayNutrition.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span>{dayNutrition.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Meal Templates */}
      <div className="bg-muted rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Quick Meal Templates</h3>
          <Button variant="outline" size="sm">Create Template</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-medium mb-2">Protein Breakfast</h4>
            <p className="text-sm text-muted-foreground mb-2">Eggs, toast, and fruit</p>
            <div className="text-xs text-muted-foreground mb-3">450 cal | 25g protein</div>
            <Button size="sm" variant="outline">Use Template</Button>
          </div>
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-medium mb-2">Light Lunch</h4>
            <p className="text-sm text-muted-foreground mb-2">Salad with chicken</p>
            <div className="text-xs text-muted-foreground mb-3">350 cal | 30g protein</div>
            <Button size="sm" variant="outline">Use Template</Button>
          </div>
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-medium mb-2">Balanced Dinner</h4>
            <p className="text-sm text-muted-foreground mb-2">Salmon, rice, vegetables</p>
            <div className="text-xs text-muted-foreground mb-3">600 cal | 35g protein</div>
            <Button size="sm" variant="outline">Use Template</Button>
          </div>
        </div>
      </div>
    </main>
  )
} 