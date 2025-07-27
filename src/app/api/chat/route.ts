import { NextRequest, NextResponse } from 'next/server';
import { initializeChromaCollection, searchDocuments } from '@/lib/chroma';
import { generateResponseTogetherAI, ChatMessage } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize ChromaDB collection
    const collection = await initializeChromaCollection();

    // Search for relevant documents
    const relevantDocs = await searchDocuments(message, collection, 3);
    
    // Create context from relevant documents
    const context = relevantDocs.length > 0 
      ? `Relevant information:\n${relevantDocs.join('\n\n')}`
      : '';

    // Prepare conversation history
    const messages: ChatMessage[] = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Generate response using Together.ai LLM
    const response = await generateResponseTogetherAI(messages, context);

    return NextResponse.json({
      response,
      context: relevantDocs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.'
      },
      { status: 500 }
    );
  }
} 