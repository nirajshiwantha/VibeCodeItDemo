"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import { getUserMeals, createMeal, updateMeal, deleteMeal } from "./actions"
import { getFoods } from "../food/actions"

interface Meal {
  id: string
  name: string
  date: Date | string
  notes?: string | null
  ingredients: Array<{
    id: string
    foodId: string
    amount: number
    unit: string
    food: {
      id: string
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }>
}

interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function MealsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [isPending, startTransition] = useTransition()
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [newMeal, setNewMeal] = useState({
    name: "",
    notes: "",
    ingredients: [] as Array<{foodId: string, amount: number, unit: string, foodName?: string}>
  })
  const [foodSearch, setFoodSearch] = useState("")

  // Load meals and foods on component mount
  useEffect(() => {
    loadMeals()
    loadFoods()
  }, [])

  const loadMeals = async () => {
    try {
      const userMeals = await getUserMeals()
      setMeals(userMeals as Meal[])
    } catch (error) {
      console.error("Failed to load meals:", error)
    }
  }

  const loadFoods = async () => {
    try {
      const allFoods = await getFoods()
      setFoods(allFoods as Food[])
    } catch (error) {
      console.error("Failed to load foods:", error)
    }
  }

  const handleCreateMeal = async () => {
    if (!newMeal.name || newMeal.ingredients.length === 0) return

    startTransition(async () => {
      try {
        await createMeal({
          name: newMeal.name,
          date: selectedDate,
          notes: newMeal.notes,
          ingredients: newMeal.ingredients
        })
        setNewMeal({ name: "", notes: "", ingredients: [] })
        setShowAddMeal(false)
        await loadMeals()
      } catch (error) {
        console.error("Failed to create meal:", error)
      }
    })
  }

  const handleUpdateMeal = async () => {
    if (!editingMeal) return

    startTransition(async () => {
      try {
        await updateMeal(editingMeal.id, {
          name: newMeal.name,
          date: selectedDate,
          notes: newMeal.notes,
          ingredients: newMeal.ingredients
        })
        setEditingMeal(null)
        setNewMeal({ name: "", notes: "", ingredients: [] })
        await loadMeals()
      } catch (error) {
        console.error("Failed to update meal:", error)
      }
    })
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return

    startTransition(async () => {
      try {
        await deleteMeal(mealId)
        await loadMeals()
      } catch (error) {
        console.error("Failed to delete meal:", error)
      }
    })
  }

  const getDateString = (date: Date | string): string => {
    if (typeof date === 'string') return date.split('T')[0]
    return date.toISOString().split('T')[0]
  }

  const startEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setNewMeal({
      name: meal.name,
      notes: meal.notes || "",
      ingredients: meal.ingredients.map(ing => ({
        foodId: ing.foodId,
        amount: ing.amount,
        unit: ing.unit,
        foodName: ing.food.name
      }))
    })
    setSelectedDate(getDateString(meal.date))
    setShowAddMeal(true)
  }

  const cancelEdit = () => {
    setEditingMeal(null)
    setNewMeal({ name: "", notes: "", ingredients: [] })
    setShowAddMeal(false)
  }

  const addIngredient = (food: Food) => {
    setNewMeal({
      ...newMeal,
      ingredients: [...newMeal.ingredients, { 
        foodId: food.id, 
        amount: 100, 
        unit: "g",
        foodName: food.name 
      }]
    })
    setFoodSearch("")
  }

  const removeIngredient = (index: number) => {
    setNewMeal({
      ...newMeal,
      ingredients: newMeal.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index: number, field: string, value: number | string) => {
    const updated = [...newMeal.ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setNewMeal({ ...newMeal, ingredients: updated })
  }

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
    return meals.filter(meal => getDateString(meal.date) === date)
  }

  const getDayTotalNutrition = (date: string) => {
    const dayMeals = getMealsForDate(date)
    return dayMeals.reduce((total, meal) => {
      const mealNutrition = meal.ingredients.reduce((mealTotal, ingredient) => {
        const multiplier = ingredient.amount / 100
        return {
          calories: mealTotal.calories + (ingredient.food.calories * multiplier),
          protein: mealTotal.protein + (ingredient.food.protein * multiplier),
          carbs: mealTotal.carbs + (ingredient.food.carbs * multiplier),
          fat: mealTotal.fat + (ingredient.food.fat * multiplier)
        }
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
      
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  ).slice(0, 10)

  return (
    <AuthGuard>
      <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meal Planner</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddMeal(!showAddMeal)} disabled={isPending}>
              {showAddMeal ? "Cancel" : "Add Meal"}
            </Button>
            <Link href="/meals/smart-planner"><Button variant="outline">Smart Planner</Button></Link>
          </div>
        </div>

        {/* Add/Edit Meal Form */}
        {showAddMeal && (
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">
              {editingMeal ? "Edit Meal" : "Create New Meal"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Input 
                  placeholder="Notes (optional)" 
                  value={newMeal.notes}
                  onChange={e => setNewMeal({...newMeal, notes: e.target.value})}
                />
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Add Ingredients</h4>
                <div className="mb-3">
                  <Input 
                    placeholder="Search foods..." 
                    value={foodSearch}
                    onChange={e => setFoodSearch(e.target.value)}
                  />
                  {foodSearch && filteredFoods.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                      {filteredFoods.map(food => (
                        <div 
                          key={food.id} 
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => addIngredient(food)}
                        >
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-gray-500">
                            {food.calories} cal, {food.protein}g protein per 100g
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Ingredients List */}
                <div className="space-y-2">
                  {newMeal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2 bg-background p-2 rounded">
                      <span className="flex-1">{ingredient.foodName}</span>
                      <Input 
                        type="number" 
                        value={ingredient.amount}
                        onChange={e => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-20"
                      />
                      <select 
                        value={ingredient.unit}
                        onChange={e => updateIngredient(index, 'unit', e.target.value)}
                        className="p-1 border rounded"
                      >
                        <option value="g">g</option>
                        <option value="oz">oz</option>
                        <option value="cup">cup</option>
                        <option value="piece">piece</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => removeIngredient(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  {newMeal.ingredients.length === 0 && (
                    <p className="text-muted-foreground text-sm">No ingredients added yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={editingMeal ? handleUpdateMeal : handleCreateMeal}
                  disabled={isPending || !newMeal.name || newMeal.ingredients.length === 0}
                >
                  {isPending ? "Saving..." : editingMeal ? "Update Meal" : "Save Meal"}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
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
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{meal.name}</div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditMeal(meal)
                                }}
                              >
                                ✏️
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMeal(meal.id)
                                }}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          <div className="text-muted-foreground">
                            {Math.round(meal.ingredients.reduce((total, ing) => {
                              return total + (ing.food.calories * ing.amount / 100)
                            }, 0))} cal
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
                        <span>{Math.round(dayNutrition.calories)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span>{Math.round(dayNutrition.protein)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs:</span>
                        <span>{Math.round(dayNutrition.carbs)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span>{Math.round(dayNutrition.fat)}g</span>
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
    </AuthGuard>
  )
} 