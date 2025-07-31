"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useTransition } from "react"
import AuthGuard from "@/components/auth-guard"
import { getUserRecipes, createRecipe, updateRecipe, deleteRecipe } from "./actions"
import { getFoods } from "../food/actions"

interface Recipe {
  id: string
  name: string
  instructions: string
  category: string
  servings: number
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
  createdAt: Date | string
}

interface Food {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [foods, setFoods] = useState<Food[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isPending, startTransition] = useTransition()
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    instructions: "",
    category: "",
    servings: 1,
    ingredients: [] as Array<{foodId: string, amount: number, unit: string, foodName?: string}>
  })
  const [foodSearch, setFoodSearch] = useState("")

  const categories = [
    "Breakfast", "Lunch", "Dinner", "Snacks", "Desserts", "Beverages", "Sides"
  ]

  useEffect(() => {
    loadRecipes()
    loadFoods()
  }, [])

  useEffect(() => {
    loadRecipes()
  }, [searchQuery, selectedCategory])

  const loadRecipes = async () => {
    try {
      const userRecipes = await getUserRecipes(searchQuery, selectedCategory)
      setRecipes(userRecipes as Recipe[])
    } catch (error) {
      console.error("Failed to load recipes:", error)
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

  const handleCreateRecipe = async () => {
    if (!newRecipe.name || !newRecipe.instructions || newRecipe.ingredients.length === 0) return

    startTransition(async () => {
      try {
        await createRecipe({
          name: newRecipe.name,
          instructions: newRecipe.instructions,
          category: newRecipe.category,
          servings: newRecipe.servings,
          ingredients: newRecipe.ingredients
        })
        resetForm()
        await loadRecipes()
      } catch (error) {
        console.error("Failed to create recipe:", error)
      }
    })
  }

  const handleUpdateRecipe = async () => {
    if (!editingRecipe || !newRecipe.name || !newRecipe.instructions) return

    startTransition(async () => {
      try {
        await updateRecipe(editingRecipe.id, {
          name: newRecipe.name,
          instructions: newRecipe.instructions,
          category: newRecipe.category,
          servings: newRecipe.servings,
          ingredients: newRecipe.ingredients
        })
        resetForm()
        await loadRecipes()
      } catch (error) {
        console.error("Failed to update recipe:", error)
      }
    })
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    startTransition(async () => {
      try {
        await deleteRecipe(recipeId)
        await loadRecipes()
      } catch (error) {
        console.error("Failed to delete recipe:", error)
      }
    })
  }

  const startEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setNewRecipe({
      name: recipe.name,
      instructions: recipe.instructions,
      category: recipe.category,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map(ing => ({
        foodId: ing.foodId,
        amount: ing.amount,
        unit: ing.unit,
        foodName: ing.food.name
      }))
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setEditingRecipe(null)
    setNewRecipe({
      name: "",
      instructions: "",
      category: "",
      servings: 1,
      ingredients: []
    })
    setShowAddForm(false)
    setFoodSearch("")
  }

  const addIngredient = (food: Food) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { 
        foodId: food.id, 
        amount: 100, 
        unit: "g",
        foodName: food.name 
      }]
    })
    setFoodSearch("")
  }

  const removeIngredient = (index: number) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index: number, field: string, value: number | string) => {
    const updated = [...newRecipe.ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setNewRecipe({ ...newRecipe, ingredients: updated })
  }

  const calculateNutrition = (recipe: Recipe) => {
    const totalNutrition = recipe.ingredients.reduce((total, ingredient) => {
      const multiplier = ingredient.amount / 100
      return {
        calories: total.calories + (ingredient.food.calories * multiplier),
        protein: total.protein + (ingredient.food.protein * multiplier),
        carbs: total.carbs + (ingredient.food.carbs * multiplier),
        fat: total.fat + (ingredient.food.fat * multiplier)
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return {
      calories: Math.round(totalNutrition.calories / recipe.servings),
      protein: Math.round(totalNutrition.protein / recipe.servings),
      carbs: Math.round(totalNutrition.carbs / recipe.servings),
      fat: Math.round(totalNutrition.fat / recipe.servings)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(foodSearch.toLowerCase())
  ).slice(0, 10)

  return (
    <AuthGuard>
      <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Recipe Collection</h1>
          <Button onClick={() => setShowAddForm(!showAddForm)} disabled={isPending}>
            {showAddForm ? "Cancel" : "Add Recipe"}
          </Button>
        </div>

        {/* Add/Edit Recipe Form */}
        {showAddForm && (
          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-semibold mb-4">
              {editingRecipe ? "Edit Recipe" : "Create New Recipe"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input 
                  placeholder="Recipe name" 
                  value={newRecipe.name}
                  onChange={e => setNewRecipe({...newRecipe, name: e.target.value})}
                />
                <select 
                  className="p-2 border rounded-md"
                  value={newRecipe.category}
                  onChange={e => setNewRecipe({...newRecipe, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Input 
                  placeholder="Servings" 
                  type="number"
                  value={newRecipe.servings}
                  onChange={e => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 1})}
                />
              </div>

              {/* Ingredients Section */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Ingredients</h4>
                </div>
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
                <div className="space-y-2">
                  {newRecipe.ingredients.map((ingredient, index) => (
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
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="piece">piece</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => removeIngredient(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  {newRecipe.ingredients.length === 0 && (
                    <p className="text-muted-foreground text-sm">No ingredients added yet</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-medium mb-2">Instructions</label>
                <textarea 
                  className="w-full p-3 border rounded-md h-32"
                  placeholder="Enter step-by-step cooking instructions..."
                  value={newRecipe.instructions}
                  onChange={e => setNewRecipe({...newRecipe, instructions: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={editingRecipe ? handleUpdateRecipe : handleCreateRecipe}
                  disabled={isPending || !newRecipe.name || !newRecipe.instructions || newRecipe.ingredients.length === 0}
                >
                  {isPending ? "Saving..." : editingRecipe ? "Update Recipe" : "Save Recipe"}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-4">Search Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              placeholder="Search recipes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select 
              className="p-2 border rounded-md"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe Collection */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-4">Your Recipe Collection</h3>
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {recipes.length === 0 ? "No recipes yet. Create your first recipe!" : "No recipes match your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => {
                const nutrition = calculateNutrition(recipe)
                return (
                  <div key={recipe.id} className="bg-background rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{recipe.name}</h4>
                        <p className="text-sm text-muted-foreground">{recipe.category}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => startEditRecipe(recipe)}
                        >
                          ✏️
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          🗑️
                        </Button>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Recipe Scaling */}
                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground">Scale recipe:</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button size="sm" variant="outline">½x</Button>
                        <Button size="sm" variant="outline">1x</Button>
                        <Button size="sm" variant="outline">2x</Button>
                        <Button size="sm" variant="outline">4x</Button>
                      </div>
                    </div>

                    {/* Nutrition per serving */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span>{nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span>{nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbs:</span>
                        <span>{nutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fat:</span>
                        <span>{nutrition.fat}g</span>
                      </div>
                    </div>

                    {/* Ingredients preview */}
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Ingredients:</p>
                      <div className="text-xs text-muted-foreground">
                        {recipe.ingredients.slice(0, 3).map(ing => ing.food.name).join(", ")}
                        {recipe.ingredients.length > 3 && ` +${recipe.ingredients.length - 3} more`}
                      </div>
                    </div>

                    {/* Instructions preview */}
                    <div className="mb-3">
                      <p className="text-xs font-medium mb-1">Instructions:</p>
                      <div className="text-xs text-muted-foreground">
                        {recipe.instructions.length > 100 
                          ? `${recipe.instructions.substring(0, 100)}...` 
                          : recipe.instructions
                        }
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View Recipe</Button>
                      <Button size="sm" variant="outline">Add to Meal</Button>
                      <Button size="sm" variant="outline">★</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sample Recipes */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-4">Sample Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <h4 className="font-medium mb-2">Protein Pancakes</h4>
              <p className="text-sm text-muted-foreground mb-2">Breakfast • 2 servings</p>
              <div className="text-xs text-muted-foreground mb-3">320 cal | 25g protein per serving</div>
              <Button size="sm" variant="outline">Add to Collection</Button>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <h4 className="font-medium mb-2">Chicken Stir Fry</h4>
              <p className="text-sm text-muted-foreground mb-2">Dinner • 4 servings</p>
              <div className="text-xs text-muted-foreground mb-3">380 cal | 35g protein per serving</div>
              <Button size="sm" variant="outline">Add to Collection</Button>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <h4 className="font-medium mb-2">Greek Salad</h4>
              <p className="text-sm text-muted-foreground mb-2">Lunch • 2 servings</p>
              <div className="text-xs text-muted-foreground mb-3">250 cal | 12g protein per serving</div>
              <Button size="sm" variant="outline">Add to Collection</Button>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
} 