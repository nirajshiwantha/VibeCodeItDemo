// Free LLM integration using OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 'free-tier-key';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateResponse(
  messages: ChatMessage[],
  context: string = ''
): Promise<string> {
  try {
    const systemPrompt = `You are a helpful nutrition and health assistant. Use the following context to answer questions accurately and helpfully:

${context}

If the context doesn't contain relevant information, you can provide general nutrition and health advice, but always mention that you're providing general information. Be encouraging and supportive in your responses.`;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://nutritrack-pro.vercel.app',
        'X-Title': 'NutriTrack Pro'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // Free model
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating LLM response:', error);
    
    // Fallback response
    return `I'm having trouble connecting to my knowledge base right now. Here's some general advice: ${messages[messages.length - 1]?.content.includes('protein') ? 'Protein is essential for muscle building and repair. Good sources include lean meats, fish, eggs, dairy, and legumes.' : 'Focus on eating a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins.'}`;
  }
}

// Alternative: Together.ai (if you prefer)
export async function generateResponseTogetherAI(
  messages: ChatMessage[],
  context: string = ''
): Promise<string> {
  try {
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    if (!togetherApiKey) {
      throw new Error('Together.ai API key not configured');
    }

    const systemPrompt = `You are a helpful nutrition and health assistant. Use the following context to answer questions accurately and helpfully:

${context}

If the context doesn't contain relevant information, you can provide general nutrition and health advice, but always mention that you're providing general information. Be encouraging and supportive in your responses.`;

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${togetherApiKey}`
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Together.ai API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating Together.ai response:', error);
    return 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again later.';
  }
} 