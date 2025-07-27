"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface Recipe {
  id: string
  name: string
  instructions: string
  category: string
  servings: number
  ingredients: Array<{
    id: string
    foodName: string
    amount: number
    unit: string
  }>
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  createdAt: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    instructions: "",
    category: "",
    servings: 1,
    ingredients: [] as Array<{foodName: string, amount: number, unit: string}>
  })

  const categories = [
    "Breakfast", "Lunch", "Dinner", "Snacks", "Desserts", "Beverages", "Sides"
  ]

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addIngredient = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { foodName: "", amount: 0, unit: "g" }]
    })
  }

  const removeIngredient = (index: number) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const updatedIngredients = [...newRecipe.ingredients]
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value }
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients })
  }

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recipe Collection</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Recipe"}
        </Button>
      </div>

      {/* Add Recipe Form */}
      {showAddForm && (
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-semibold mb-4">Create New Recipe</h3>
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
                <Button size="sm" onClick={addIngredient}>Add Ingredient</Button>
              </div>
              <div className="space-y-2">
                {newRecipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input 
                      placeholder="Food name"
                      value={ingredient.foodName}
                      onChange={e => updateIngredient(index, 'foodName', e.target.value)}
                    />
                    <Input 
                      placeholder="Amount"
                      type="number"
                      value={ingredient.amount}
                      onChange={e => updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)}
                    />
                    <select 
                      className="p-2 border rounded-md"
                      value={ingredient.unit}
                      onChange={e => updateIngredient(index, 'unit', e.target.value)}
                    >
                      <option value="g">grams</option>
                      <option value="oz">ounces</option>
                      <option value="cup">cups</option>
                      <option value="tbsp">tablespoons</option>
                      <option value="tsp">teaspoons</option>
                      <option value="piece">pieces</option>
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

            {/* Nutritional Info (calculated) */}
            <div className="bg-background rounded-lg p-4">
              <h4 className="font-medium mb-2">Nutritional Information (per serving)</h4>
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
              <Button>Save Recipe</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
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
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className="bg-background rounded-lg p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{recipe.name}</h4>
                    <p className="text-sm text-muted-foreground">{recipe.category}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                  </span>
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
                    <span>{recipe.nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span>{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span>{recipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span>{recipe.nutrition.fat}g</span>
                  </div>
                </div>

                {/* Ingredients preview */}
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Ingredients:</p>
                  <div className="text-xs text-muted-foreground">
                    {recipe.ingredients.slice(0, 3).map(ing => ing.foodName).join(", ")}
                    {recipe.ingredients.length > 3 && ` +${recipe.ingredients.length - 3} more`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">View Recipe</Button>
                  <Button size="sm" variant="outline">Add to Meal</Button>
                  <Button size="sm" variant="outline">★</Button>
                </div>
              </div>
            ))}
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
  )
} 