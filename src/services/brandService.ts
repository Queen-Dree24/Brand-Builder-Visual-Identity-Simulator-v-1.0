import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProductConcept {
  detailedDescription: string;
}

export async function generateProductConcept(userInput: string): Promise<ProductConcept> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: `You are a professional brand strategist and product designer. 
    The user has a product idea: "${userInput}".
    
    Your task is to expand this into a highly detailed physical description that can be used for consistent image generation. 
    Focus on: materials, colors, textures, branding details, shape, and unique identifiers. 
     IMPORTANT: Do NOT include any people in the description.
    
    Return ONLY the detailed description text.`
  });

  return { detailedDescription: response.text || "" };
}

export async function generateBrandImage(
  productDescription: string, 
  medium: 'billboard' | 'newspaper' | 'social',
  onImageGenerated: (url: string) => void
) {
  let prompt = "";
  let aspectRatio: "16:9" | "4:3" | "1:1" = "1:1";

  switch (medium) {
    case 'billboard':
      prompt = `A professional advertising shot of ${productDescription} featured on a massive roadside billboard in a modern city during twilight. The billboard is slightly tilted, showing its structural support. Urban sunset background with bokeh city lights. NO PEOPLE. Photorealistic, 8k resolution.`;
      aspectRatio = "16:9";
      break;
    case 'newspaper':
      prompt = `A high-contrast black and white newspaper advertisement. In the center is ${productDescription}. The image has a newsprint texture, halftone dots, and vintage typographic elements around it. NO PEOPLE. Sharp shadows, classic editorial style.`;
      aspectRatio = "4:3";
      break;
    case 'social':
      prompt = `A sleek, minimalist social media product showcase of ${productDescription}. Resting on a clean matte surface with soft directional lighting. Muted color palette, lifestyle aesthetic, shallow depth of field. NO PEOPLE. Modern, trendy, IG style.`;
      aspectRatio = "1:1";
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      onImageGenerated(imageUrl);
      return;
    }
  }
}
