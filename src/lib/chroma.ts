import { CloudClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

const client = new CloudClient({
  apiKey: 'ck-3BBnoH2aHP4TMK8XGehjrXQ1h8efT4CWBekqH5CVcoJo',
  tenant: 'b7217b5b-123b-405b-9644-d283e1566abd',
  database: 'VibecodeIDemo-01'
});

export { client };

// Sample health and nutrition documents
export const SAMPLE_DOCUMENTS = [
  {
    id: "doc_1",
    content: "Protein is essential for muscle building and repair. Good sources include lean meats, fish, eggs, dairy, legumes, and plant-based proteins like tofu and tempeh. Aim for 0.8-1.2g of protein per kg of body weight daily.",
    metadata: { category: "nutrition", topic: "protein" }
  },
  {
    id: "doc_2", 
    content: "Carbohydrates are your body's primary energy source. Choose complex carbs like whole grains, fruits, vegetables, and legumes over refined sugars. They provide sustained energy and important fiber.",
    metadata: { category: "nutrition", topic: "carbohydrates" }
  },
  {
    id: "doc_3",
    content: "Healthy fats are crucial for brain health and hormone production. Include sources like avocados, nuts, seeds, olive oil, and fatty fish. Avoid trans fats and limit saturated fats.",
    metadata: { category: "nutrition", topic: "fats" }
  },
  {
    id: "doc_4",
    content: "Meal prep saves time and helps maintain healthy eating habits. Plan your meals for the week, batch cook proteins and grains, and store in portioned containers. This reduces food waste and unhealthy takeout.",
    metadata: { category: "meal_prep", topic: "planning" }
  },
  {
    id: "doc_5",
    content: "Hydration is key for overall health. Drink at least 8 glasses of water daily, more if you're active. Water helps with digestion, nutrient absorption, and temperature regulation.",
    metadata: { category: "health", topic: "hydration" }
  },
  {
    id: "doc_6",
    content: "Fiber supports digestive health and helps control blood sugar. Good sources include fruits, vegetables, whole grains, legumes, and nuts. Aim for 25-30g of fiber daily.",
    metadata: { category: "nutrition", topic: "fiber" }
  },
  {
    id: "doc_7",
    content: "Vitamins and minerals are essential micronutrients. Eat a colorful variety of fruits and vegetables to get different vitamins. Consider supplements only if you have specific deficiencies.",
    metadata: { category: "nutrition", topic: "vitamins" }
  },
  {
    id: "doc_8",
    content: "Portion control is important for weight management. Use smaller plates, measure servings, and be mindful of hunger cues. Don't eat until you're stuffed - stop when you're satisfied.",
    metadata: { category: "health", topic: "portion_control" }
  },
  {
    id: "doc_9",
    content: "Breakfast kickstarts your metabolism and provides energy for the day. Include protein, complex carbs, and healthy fats. Good options: oatmeal with nuts, Greek yogurt with berries, or eggs with whole grain toast.",
    metadata: { category: "meal_prep", topic: "breakfast" }
  },
  {
    id: "doc_10",
    content: "Snacking can be healthy if you choose nutritious options. Good snacks include nuts, fruits, vegetables with hummus, Greek yogurt, or a small portion of dark chocolate. Avoid processed snacks high in sugar and salt.",
    metadata: { category: "nutrition", topic: "snacking" }
  },
  {
    id: "doc_11",
    content: "Exercise and nutrition work together for optimal health. Fuel your workouts with carbs before and protein after. Stay hydrated during exercise and replenish electrolytes if sweating heavily.",
    metadata: { category: "health", topic: "exercise_nutrition" }
  },
  {
    id: "doc_12",
    content: "Sleep affects your eating habits and metabolism. Poor sleep can increase hunger hormones and cravings for unhealthy foods. Aim for 7-9 hours of quality sleep per night.",
    metadata: { category: "health", topic: "sleep" }
  },
  {
    id: "doc_13",
    content: "Mindful eating involves paying attention to what and how you eat. Eat slowly, savor your food, and listen to your body's hunger and fullness signals. This can help prevent overeating.",
    metadata: { category: "health", topic: "mindful_eating" }
  },
  {
    id: "doc_14",
    content: "Food safety is crucial for preventing illness. Wash hands before cooking, keep raw and cooked foods separate, cook meats to proper temperatures, and refrigerate leftovers promptly.",
    metadata: { category: "meal_prep", topic: "food_safety" }
  },
  {
    id: "doc_15",
    content: "Budget-friendly healthy eating is possible. Buy seasonal produce, use frozen vegetables, buy in bulk, and cook at home. Plan meals around sales and use leftovers creatively.",
    metadata: { category: "meal_prep", topic: "budget" }
  }
];

export async function initializeChromaCollection() {
  try {
    // Create embedding function
    const embeddingFunction = new DefaultEmbeddingFunction();
    
    // Create or get collection with embedding function
    const collection = await client.getOrCreateCollection({
      name: "nutrition_health_docs",
      metadata: { description: "Nutrition and health documents for RAG chatbot" },
      embeddingFunction: embeddingFunction
    });

    // Check if collection is empty
    const count = await collection.count();
    
    if (count === 0) {
      console.log("Adding sample documents to ChromaDB...");
      
      // Add documents in batches
      const batchSize = 5;
      for (let i = 0; i < SAMPLE_DOCUMENTS.length; i += batchSize) {
        const batch = SAMPLE_DOCUMENTS.slice(i, i + batchSize);
        
        await collection.add({
          ids: batch.map(doc => doc.id),
          documents: batch.map(doc => doc.content),
          metadatas: batch.map(doc => doc.metadata)
        });
      }
      
      console.log(`Added ${SAMPLE_DOCUMENTS.length} documents to ChromaDB`);
    } else {
      console.log(`Collection already has ${count} documents`);
    }

    return collection;
  } catch (error) {
    console.error("Error initializing ChromaDB collection:", error);
    throw error;
  }
}

export async function searchDocuments(query: string, collection: any, limit: number = 3) {
  try {
    const results = await collection.query({
      queryTexts: [query],
      nResults: limit
    });

    return results.documents[0] || [];
  } catch (error) {
    console.error("Error searching documents:", error);
    return [];
  }
} 