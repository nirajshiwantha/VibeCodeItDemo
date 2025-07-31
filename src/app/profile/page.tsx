"use client"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useTransition } from "react"
import { getUserProfile, updateUserProfile } from "./actions"
import { getUserOpenAiKey, updateUserOpenAiKey } from "./actions"
import { motion, AnimatePresence } from "framer-motion"
import AuthGuard from "@/components/auth-guard"

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  age: number | null
  gender: string | null
  heightCm: number | null
  weightKg: number | null
  activityLevel: string | null
}

const MOTIVATION_QUOTES = [
  "Every healthy choice is a victory.",
  "Small steps every day lead to big results.",
  "Your body deserves the best.",
  "Eat well, live well.",
  "Wellness is the natural state of my body."
]
const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    activityLevel: ""
  })
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [openAiKey, setOpenAiKey] = useState("")
  const [openAiKeySaved, setOpenAiKeySaved] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      loadProfile()
      getUserOpenAiKey().then(setOpenAiKey)
    }
  }, [session])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const userProfile = await getUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setFormData({
          age: userProfile.age?.toString() || "",
          gender: userProfile.gender || "",
          heightCm: userProfile.heightCm?.toString() || "",
          weightKg: userProfile.weightKg?.toString() || "",
          activityLevel: userProfile.activityLevel || ""
        })
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const updateData = {
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || undefined,
          heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
          activityLevel: formData.activityLevel || undefined,
        }
        
        await updateUserProfile(updateData)
        await loadProfile() // Reload to show updated data
        setIsEditing(false)
      } catch (error) {
        console.error("Failed to update profile:", error)
      }
    })
  }

  const handleSaveOpenAiKey = async () => {
    await updateUserOpenAiKey(openAiKey)
    setOpenAiKeySaved(true)
    setTimeout(() => setOpenAiKeySaved(false), 2000)
  }

  const calculateBMI = () => {
    if (profile?.heightCm && profile?.weightKg) {
      const heightM = profile.heightCm / 100
      const bmi = profile.weightKg / (heightM * heightM)
      return bmi.toFixed(1)
    }
    return null
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { category: "Normal", color: "text-green-600" }
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" }
    return { category: "Obese", color: "text-red-600" }
  }

  const bmi = calculateBMI()
  const bmiData = bmi ? getBMICategory(parseFloat(bmi)) : null

  return (
    <AuthGuard>
      <main className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-8">
        {/* Clean Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">My Profile 👤</h1>
            <p className="text-xl text-gray-600 italic">"{randomQuote}"</p>
          </div>
        </motion.div>

        <div className="flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant={isEditing ? "default" : "outline"} 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isPending}
              className="transition-all duration-200"
            >
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-muted rounded-lg p-6 text-center shadow-xl">
              <motion.div
                className="mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {profile?.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full mx-auto border-4 border-background shadow-lg transition-all duration-300 hover:shadow-2xl"
                  />
                ) : (
                  <div className="w-30 h-30 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="text-4xl font-bold text-primary">
                      {profile?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">{profile?.name}</h2>
              <p className="text-muted-foreground mb-4">{profile?.email}</p>
              {/* BMI Card */}
              <AnimatePresence>
                {bmi && bmiData && (
                  <motion.div
                    className="bg-background rounded-lg p-4 mt-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-semibold mb-2">Body Mass Index</h3>
                    <div className="text-3xl font-bold mb-1">{bmi}</div>
                    <div className={`text-sm font-medium ${bmiData.color}`}>{bmiData.category}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          {/* Profile Details */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="bg-muted rounded-lg p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <Input 
                        type="number" 
                        value={formData.age} 
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Gender</label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Height (cm)</label>
                      <Input 
                        type="number" 
                        value={formData.heightCm} 
                        onChange={e => setFormData({...formData, heightCm: e.target.value})}
                        placeholder="Enter height in cm"
                        min="50"
                        max="300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                      <Input 
                        type="number" 
                        value={formData.weightKg} 
                        onChange={e => setFormData({...formData, weightKg: e.target.value})}
                        placeholder="Enter weight in kg"
                        min="20"
                        max="500"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Activity Level</label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={formData.activityLevel}
                        onChange={e => setFormData({...formData, activityLevel: e.target.value})}
                      >
                        <option value="">Select activity level</option>
                        <option value="sedentary">Sedentary (little/no exercise)</option>
                        <option value="light">Light (light exercise 1-3 days/week)</option>
                        <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                        <option value="active">Active (hard exercise 6-7 days/week)</option>
                        <option value="very_active">Very Active (very hard exercise, physical job)</option>
                      </select>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Age</label>
                        <div className="text-lg">{profile?.age || "Not set"}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <div className="text-lg capitalize">{profile?.gender || "Not set"}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Activity Level</label>
                        <div className="text-lg capitalize">
                          {profile?.activityLevel?.replace('_', ' ') || "Not set"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Height</label>
                        <div className="text-lg">
                          {profile?.heightCm ? `${profile.heightCm} cm` : "Not set"}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Weight</label>
                        <div className="text-lg">
                          {profile?.weightKg ? `${profile.weightKg} kg` : "Not set"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {isEditing && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      // Reset form data to original values
                      setFormData({
                        age: profile?.age?.toString() || "",
                        gender: profile?.gender || "",
                        heightCm: profile?.heightCm?.toString() || "",
                        weightKg: profile?.weightKg?.toString() || "",
                        activityLevel: profile?.activityLevel || ""
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
        {/* Health Stats */}
        {profile?.heightCm && profile?.weightKg && (
          <motion.div
            className="bg-muted rounded-lg p-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-4">Health Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{bmi}</div>
                <div className="text-sm text-muted-foreground">BMI</div>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((profile.heightCm - 100) * 0.9)}
                </div>
                <div className="text-sm text-muted-foreground">Ideal Weight (kg)</div>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.heightCm}
                </div>
                <div className="text-sm text-muted-foreground">Height (cm)</div>
              </div>
              <div className="bg-background rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.weightKg}
                </div>
                <div className="text-sm text-muted-foreground">Current Weight (kg)</div>
              </div>
            </div>
          </motion.div>
        )}
        {/* OpenAI API Key */}
        
      </main>
    </AuthGuard>
  )
} 