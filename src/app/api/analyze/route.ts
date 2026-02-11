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
      max_tokens: 2048,
      system: `You are an expert fashion analyst with deep knowledge of clothing brands, designers, and specific product lines. Your job is to identify and classify ALL clothing items visible in photos. You handle all kinds of photos: items on hangers, flat lays, worn on a person, on a mannequin, product photos, or casual mirror selfies. Always return valid JSON.`,
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
              text: `Identify ALL distinct clothing items and accessories visible in this photo. Return a JSON array with one object per item.

For EACH item:
- "name": specific and descriptive (e.g. "Classic Fit Oxford Shirt" not just "Shirt")
- "brand": the brand or designer if you can identify it from logos, labels, tags, distinctive design elements, hardware, stitching patterns, or recognizable silhouettes. If you can identify the specific product/model name include it (e.g. "Levi's 501", "Nike Air Force 1", "Carhartt WIP"). Set to null if you genuinely cannot tell.
- "color": a simple color name usable as a label (e.g. "Navy Blue", "Black", "Cream")
- "category": MUST be one of: "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "activewear", "formal"
- "style": the aesthetic (e.g. "casual", "preppy", "bohemian", "minimalist", "streetwear", "classic", "sporty")
- "material": best guess from visual texture (e.g. "cotton", "denim", "leather", "wool", "silk", "polyester", "knit", "linen")
- "season": array of suitable seasons from ["spring", "summer", "fall", "winter"]
- "occasion": array from ["casual", "work", "formal", "date", "athletic", "outdoor"]

Return ONLY a JSON array:
[{"name": "...", "brand": "...", "category": "...", "color": "...", "style": "...", "material": "...", "season": [...], "occasion": [...]}]

If only one item is visible, still return an array with one element.`,
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

    // Try to parse as array first, fall back to single object
    const arrayMatch = textContent.text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const items: AnalysisResult[] = JSON.parse(arrayMatch[0]);
      return NextResponse.json({ items });
    }

    const objectMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      const item: AnalysisResult = JSON.parse(objectMatch[0]);
      return NextResponse.json({ items: [item] });
    }

    return NextResponse.json(
      { error: "Could not parse AI response" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze clothing item" },
      { status: 500 }
    );
  }
}
