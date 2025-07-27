"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFoods } from "./actions"
import { useEffect, useState, useTransition } from "react"

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
}

export default function FoodPage() {
  const [query, setQuery] = useState("")
  const [foods, setFoods] = useState<Food[]>([])
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    cuisine: "",
    dietaryRestriction: ""
  })

  const searchFoods = async (searchQuery: string, filtersObj = filters) => {
    startTransition(async () => {
      const result = await getFoods(searchQuery, filtersObj)
      setFoods(result)
    })
  }

  useEffect(() => {
    searchFoods(query, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters])

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Food Database</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
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
          <h3 className="font-semibold mb-4">Add Custom Food</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Food name" />
            <Input placeholder="Brand (optional)" />
            <Input placeholder="Calories per 100g" type="number" />
            <Input placeholder="Protein (g)" type="number" />
            <Input placeholder="Carbs (g)" type="number" />
            <Input placeholder="Fat (g)" type="number" />
            <Input placeholder="Fiber (g)" type="number" />
            <Input placeholder="Sugar (g)" type="number" />
            <Input placeholder="Sodium (mg)" type="number" />
            <select className="p-2 border rounded-md">
              <option value="">Food Type</option>
              <option value="protein">Protein</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="dairy">Dairy</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>Save Food</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
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
                  <Button size="sm" variant="outline">Add to Meal</Button>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 