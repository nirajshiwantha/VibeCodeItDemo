"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFoods, createCustomFood, updateFood, deleteFood } from "./actions"
import { useEffect, useState, useTransition } from "react"
import AuthGuard from "@/components/auth-guard"

interface Food {
  id: string
  name: string
  brand?: string | null
  type?: string | null
  cuisine?: string | null
  dietaryTags: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number | null
  sugar?: number | null
  sodium?: number | null
  createdById?: string | null
}

export default function FoodPage() {
  const [query, setQuery] = useState("")
  const [foods, setFoods] = useState<Food[]>([])
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [filters, setFilters] = useState({
    type: "",
    cuisine: "",
    dietaryRestriction: ""
  })
  const [newFood, setNewFood] = useState({
    name: "",
    brand: "",
    type: "",
    cuisine: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    dietaryTags: [] as string[]
  })

  const searchFoods = async (searchQuery: string = query, filtersObj = filters) => {
    startTransition(async () => {
      try {
        const result = await getFoods(searchQuery, filtersObj)
        setFoods(result)
      } catch (error) {
        console.error("Failed to load foods:", error)
      }
    })
  }

  useEffect(() => {
    searchFoods(query, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters])

  const handleCreateFood = async () => {
    if (!newFood.name) return

    startTransition(async () => {
      try {
        await createCustomFood({
          ...newFood,
          dietaryTags: newFood.dietaryTags.filter(tag => tag.trim() !== "")
        })
        resetForm()
        await searchFoods()
      } catch (error) {
        console.error("Failed to create food:", error)
      }
    })
  }

  const handleUpdateFood = async () => {
    if (!editingFood || !newFood.name) return

    startTransition(async () => {
      try {
        await updateFood(editingFood.id, {
          ...newFood,
          dietaryTags: newFood.dietaryTags.filter(tag => tag.trim() !== "")
        })
        resetForm()
        await searchFoods()
      } catch (error) {
        console.error("Failed to update food:", error)
      }
    })
  }

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return

    startTransition(async () => {
      try {
        await deleteFood(foodId)
        await searchFoods()
      } catch (error) {
        console.error("Failed to delete food:", error)
      }
    })
  }

  const startEditFood = (food: Food) => {
    setEditingFood(food)
    setNewFood({
      name: food.name,
      brand: food.brand || "",
      type: food.type || "",
      cuisine: food.cuisine || "",
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber || 0,
      sugar: food.sugar || 0,
      sodium: food.sodium || 0,
      dietaryTags: [...food.dietaryTags]
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setEditingFood(null)
    setNewFood({
      name: "",
      brand: "",
      type: "",
      cuisine: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      dietaryTags: []
    })
    setShowAddForm(false)
  }

  const addDietaryTag = (tag: string) => {
    if (tag && !newFood.dietaryTags.includes(tag)) {
      setNewFood({
        ...newFood,
        dietaryTags: [...newFood.dietaryTags, tag]
      })
    }
  }

  const removeDietaryTag = (tagToRemove: string) => {
    setNewFood({
      ...newFood,
      dietaryTags: newFood.dietaryTags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <AuthGuard>
      <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Food Database</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isPending}>
            {showAddForm ? "Cancel" : "Add Custom Food"}
          </Button>
        </div>

        {/* Advanced Search Filters */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-4">Search &amp; Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input 
              placeholder="Search foods..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
            />
            <select 
              className="p-2 border rounded-md"
              value={filters.type}
              onChange={e => setFilters({...filters, type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="protein">Protein</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="dairy">Dairy</option>
              <option value="snack">Snack</option>
            </select>
            <select 
              className="p-2 border rounded-md"
              value={filters.cuisine}
              onChange={e => setFilters({...filters, cuisine: e.target.value})}
            >
              <option value="">All Cuisines</option>
              <option value="american">American</option>
              <option value="asian">Asian</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="mexican">Mexican</option>
              <option value="indian">Indian</option>
            </select>
            <select 
              className="p-2 border rounded-md"
              value={filters.dietaryRestriction}
              onChange={e => setFilters({...filters, dietaryRestriction: e.target.value})}
            >
              <option value="">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="keto">Keto</option>
              <option value="low-carb">Low-Carb</option>
            </select>
          </div>
        </div>

        {/* Custom Food Entry Form */}
        {showAddForm && (
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">
              {editingFood ? "Edit Food" : "Add Custom Food"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Food name" 
                value={newFood.name}
                onChange={e => setNewFood({...newFood, name: e.target.value})}
              />
              <Input 
                placeholder="Brand (optional)" 
                value={newFood.brand}
                onChange={e => setNewFood({...newFood, brand: e.target.value})}
              />
              <Input 
                placeholder="Calories per 100g" 
                type="number" 
                value={newFood.calories}
                onChange={e => setNewFood({...newFood, calories: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Protein (g)" 
                type="number" 
                value={newFood.protein}
                onChange={e => setNewFood({...newFood, protein: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Carbs (g)" 
                type="number" 
                value={newFood.carbs}
                onChange={e => setNewFood({...newFood, carbs: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Fat (g)" 
                type="number" 
                value={newFood.fat}
                onChange={e => setNewFood({...newFood, fat: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Fiber (g)" 
                type="number" 
                value={newFood.fiber}
                onChange={e => setNewFood({...newFood, fiber: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Sugar (g)" 
                type="number" 
                value={newFood.sugar}
                onChange={e => setNewFood({...newFood, sugar: parseFloat(e.target.value) || 0})}
              />
              <Input 
                placeholder="Sodium (mg)" 
                type="number" 
                value={newFood.sodium}
                onChange={e => setNewFood({...newFood, sodium: parseFloat(e.target.value) || 0})}
              />
              <select 
                className="p-2 border rounded-md"
                value={newFood.type}
                onChange={e => setNewFood({...newFood, type: e.target.value})}
              >
                <option value="">Food Type</option>
                <option value="protein">Protein</option>
                <option value="vegetable">Vegetable</option>
                <option value="fruit">Fruit</option>
                <option value="grain">Grain</option>
                <option value="dairy">Dairy</option>
                <option value="snack">Snack</option>
              </select>
              <select 
                className="p-2 border rounded-md"
                value={newFood.cuisine}
                onChange={e => setNewFood({...newFood, cuisine: e.target.value})}
              >
                <option value="">Cuisine Type</option>
                <option value="american">American</option>
                <option value="asian">Asian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
              </select>
            </div>
            
            {/* Dietary Tags */}
            <div className="mt-4">
              <label className="block font-medium mb-2">Dietary Tags</label>
              <div className="flex gap-2 mb-2">
                {["vegetarian", "vegan", "gluten-free", "keto", "low-carb", "dairy-free"].map(tag => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={newFood.dietaryTags.includes(tag) ? "default" : "outline"}
                    onClick={() => newFood.dietaryTags.includes(tag) ? removeDietaryTag(tag) : addDietaryTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              {newFood.dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {newFood.dietaryTags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {tag}
                      <button onClick={() => removeDietaryTag(tag)} className="ml-1">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={editingFood ? handleUpdateFood : handleCreateFood}
                disabled={isPending || !newFood.name}
              >
                {isPending ? "Saving..." : editingFood ? "Update Food" : "Save Food"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Food Search Results */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-4">Search Results</h3>
          {isPending ? (
            <div className="text-center py-8">Searching...</div>
          ) : foods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No foods found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {foods.map(food => (
                <div key={food.id} className="bg-background p-4 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{food.name}</h4>
                    <div className="flex gap-1">
                      {food.createdById && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => startEditFood(food)}
                          >
                            ✏️
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteFood(food.id)}
                          >
                            🗑️
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">Add to Meal</Button>
                    </div>
                  </div>
                  {food.brand && <p className="text-sm text-muted-foreground mb-2">{food.brand}</p>}
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Calories:</span>
                      <span>{food.calories} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protein:</span>
                      <span>{food.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbs:</span>
                      <span>{food.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fat:</span>
                      <span>{food.fat}g</span>
                    </div>
                    {food.fiber && (
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span>{food.fiber}g</span>
                      </div>
                    )}
                    {food.sugar && (
                      <div className="flex justify-between">
                        <span>Sugar:</span>
                        <span>{food.sugar}g</span>
                      </div>
                    )}
                    {food.sodium && (
                      <div className="flex justify-between">
                        <span>Sodium:</span>
                        <span>{food.sodium}mg</span>
                      </div>
                    )}
                  </div>
                  {food.dietaryTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {food.dietaryTags.map(tag => (
                        <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {food.createdById && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Custom Food
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  )
} 