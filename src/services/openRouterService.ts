const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
}

/**
 * Send a message to OpenRouter API and get AI response
 * @param messages - Array of conversation messages
 * @param model - Model to use (default: openrouter/free - always free, no paid models)
 * @returns AI response text
 */
export async function sendMessageToOpenRouter(
  messages: Message[],
  model: string = "openrouter/free"
): Promise<string> {
  if (!API_KEY || API_KEY === "YOUR_NEW_KEY" || API_KEY === "your_api_key_here") {
    throw new Error(
      "OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file"
    );
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "X-Title": "MediBot-AI", // Your app name
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter API");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}

/**
 * Create a system message for medical chatbot context
 */
export function createMedicalSystemMessage(): Message {
  return {
    role: "system",
    content: `You are MediBot AI, a helpful medical assistant chatbot. Your role is to:
- Listen to users' symptoms with empathy and care
- Ask relevant follow-up questions to understand their condition better
- Provide general health information and guidance
- Always remind users that you're not a replacement for professional medical advice
- Recommend consulting healthcare professionals for serious concerns
- Be supportive, clear, and professional in your responses

Important: You should never diagnose conditions or prescribe treatments. Always encourage users to seek professional medical help when appropriate.`,
  };
}

/**
 * Ask the LLM to recommend appropriate doctor specialties based on symptoms
 * @param conversationHistory - The conversation history
 * @returns Array of recommended specialties
 */
export async function getRecommendedSpecialties(
  conversationHistory: Message[]
): Promise<string[]> {
  const availableSpecialties = [
    "Internal Medicine",
    "General Practitioner",
    "Family Medicine",
    "Emergency Medicine",
    "Pediatric Care",
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Gastroenterology",
    "Orthopedics",
    "Psychiatry",
    "Ophthalmology",
    "Pulmonology",
    "Endocrinology",
    "Rheumatology"
  ];

  const specialtyPrompt: Message = {
    role: "user",
    content: `Based on our conversation about the patient's symptoms, which medical specialties would be most appropriate to consult? 

Available specialties:
${availableSpecialties.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Please respond with ONLY a JSON array of the top 1-3 most relevant specialties from the list above. Format: ["Specialty1", "Specialty2"]

If the symptoms are general or unclear, recommend "General Practitioner", "Family Medicine", or "Internal Medicine".
If it's an emergency, include "Emergency Medicine".

Response (JSON array only):`
  };

  try {
    const response = await sendMessageToOpenRouter(
      [...conversationHistory, specialtyPrompt],
      "openrouter/free"
    );

    // Parse the JSON response
    const cleanedResponse = response.trim().replace(/```json\n?|\n?```/g, '');
    const specialties = JSON.parse(cleanedResponse);
    
    // Validate that all returned specialties are in our list
    if (Array.isArray(specialties)) {
      return specialties.filter(s => availableSpecialties.includes(s));
    }
    
    return ["General Practitioner", "Family Medicine"];
  } catch (error) {
    console.error("Error getting specialty recommendations:", error);
    // Fallback to general practitioners
    return ["General Practitioner", "Family Medicine"];
  }
}
