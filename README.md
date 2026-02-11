# Wardrobe Consultant

An AI-powered wardrobe consultant that analyzes your clothing from photos and suggests complete outfits. Built with Next.js, TypeScript, and the Claude API.

## Features

- **Photo Upload & Analysis**: Drop or upload a photo of any clothing item. Claude's vision analyzes it to identify the type, color, style, material, suitable seasons, and occasions.
- **Wardrobe Management**: Browse all your clothes organized by category. Remove items you no longer have.
- **Outfit Suggestions**: Get AI-generated outfit combinations from your wardrobe, filtered by occasion, season, or custom preferences. Click a suggestion to highlight the pieces in your wardrobe view.

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Upload** a photo of a clothing item (drag & drop or click to browse)
2. Claude Vision analyzes the image and extracts metadata (category, color, style, material, seasons, occasions)
3. The item is saved to your browser's local storage
4. Go to **Outfit Suggestions**, pick an occasion/season, and click "Suggest Outfits"
5. Claude acts as your personal stylist, creating coordinated outfit combinations from your actual wardrobe
6. Click any suggestion to highlight those pieces in your wardrobe grid

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API (vision + text) via `@anthropic-ai/sdk`
- **Storage**: Browser localStorage
