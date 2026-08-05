import { GoogleGenAI } from "@google/genai";

export async function askAI(message: string, context?: string) {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
                 (import.meta as any).env?.VITE_GEMINI_API_KEY ||
                 '';

  if (!apiKey) {
    return "AI service is currently not configured with an API key. Please set GEMINI_API_KEY in your environment.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are a professional medical AI assistant called "MediTrack AI".
    Your goal is to help users understand their medical records, prescriptions, and general healthcare information.
    
    GUIDELINES:
    1. IMPORTANT: Always include a disclaimer that you are an AI and the user should consult with a qualified healthcare professional for medical emergencies or definitive diagnosis/treatment.
    2. Be concise, professional, and empathetic.
    3. Use the provided context (like medical records, prescriptions) to give personalized answers if available.
    4. If the user asks something medically complex, suggest specific questions they might want to ask their doctor.
    5. Do not make up facts. If you don't know or it's not in the context, say so.
    
    USER'S MEDICAL CONTEXT:
    ${context || 'No specific medical history or prescriptions provided for this session.'}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "There was an error communicating with the AI assistant. Please try again later.";
  }
}

