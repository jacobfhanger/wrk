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
      system: `You are an expert fashion analyst. Your job is to identify and classify clothing items from photos. You handle all kinds of photos: items on hangers, flat lays, worn on a person, on a mannequin, product photos, or casual mirror selfies. Focus on the PRIMARY clothing item in the image. If multiple items are visible, pick the most prominent one. Always return valid JSON.`,
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
              text: `Identify the main clothing item in this photo and return a JSON object.

Rules:
- Look carefully at the ACTUAL item: its cut, fabric texture, color, and construction
- "name" should be specific and descriptive (e.g. "Charcoal Wool Peacoat" not just "Coat")
- "color" should be a simple color name usable as a label (e.g. "Navy Blue", "Black", "Cream", "Olive Green")
- "category" MUST be one of: "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "activewear", "formal"
- "style" should describe the aesthetic (e.g. "casual", "preppy", "bohemian", "minimalist", "streetwear", "classic", "sporty")
- "material" should be your best guess from visual texture (e.g. "cotton", "denim", "leather", "wool", "silk", "polyester", "knit", "linen")
- "season" is an array of seasons this item suits: ["spring", "summer", "fall", "winter"]
- "occasion" is an array from: ["casual", "work", "formal", "date", "athletic", "outdoor"]

Return ONLY the JSON object:
{"name": "...", "category": "...", "color": "...", "style": "...", "material": "...", "season": [...], "occasion": [...]}`,
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
