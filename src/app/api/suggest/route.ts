import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ClothingItem } from "@/lib/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { wardrobe, occasion, season, preferences } = await request.json();

    if (!wardrobe || wardrobe.length === 0) {
      return NextResponse.json(
        { error: "Wardrobe is empty" },
        { status: 400 }
      );
    }

    const wardrobeSummary = wardrobe.map((item: ClothingItem) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style,
      material: item.material,
      season: item.season,
      occasion: item.occasion,
    }));

    const prompt = buildSuggestionPrompt(
      wardrobeSummary,
      occasion,
      season,
      preferences
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
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

    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response" },
        { status: 500 }
      );
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate outfit suggestions" },
      { status: 500 }
    );
  }
}

function buildSuggestionPrompt(
  wardrobe: Omit<ClothingItem, "imageData" | "addedAt">[],
  occasion?: string,
  season?: string,
  preferences?: string
): string {
  let prompt = `You are an expert fashion stylist. Based on the following wardrobe, suggest 3 complete outfit combinations.

## Wardrobe Items:
${JSON.stringify(wardrobe, null, 2)}
`;

  if (occasion) {
    prompt += `\n## Occasion: ${occasion}`;
  }
  if (season) {
    prompt += `\n## Season: ${season}`;
  }
  if (preferences) {
    prompt += `\n## Additional Preferences: ${preferences}`;
  }

  prompt += `

## Instructions:
- Each outfit should be a cohesive, stylish combination
- Consider color coordination, style matching, and appropriateness
- Use item IDs to reference specific pieces
- Return a JSON array of outfit objects

Return ONLY a JSON array with this structure:
[
  {
    "itemIds": ["id1", "id2", ...],
    "description": "A short name for the outfit",
    "occasion": "what this outfit is good for",
    "reasoning": "Why these pieces work together - mention color coordination, style, etc."
  }
]`;

  return prompt;
}
