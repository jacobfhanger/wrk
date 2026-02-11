import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { AnalysisResult } from "@/lib/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { imageData, mediaType } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageData,
              },
            },
            {
              type: "text",
              text: `Analyze this clothing item and return a JSON object with the following fields:
- "name": a short descriptive name (e.g. "Navy Blue Oxford Shirt")
- "category": one of "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "activewear", "formal"
- "color": the primary color(s)
- "style": the style description (e.g. "casual", "preppy", "bohemian", "minimalist", "streetwear")
- "material": best guess at the material (e.g. "cotton", "denim", "leather", "polyester")
- "season": array of suitable seasons from ["spring", "summer", "fall", "winter"]
- "occasion": array of suitable occasions from ["casual", "work", "formal", "date", "athletic", "outdoor"]

Return ONLY the JSON object, no other text.`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze clothing item" },
      { status: 500 }
    );
  }
}
