const COLOR_MAP: Record<string, string> = {
  "navy blue": "#001f3f",
  navy: "#001f3f",
  cream: "#fffdd0",
  ivory: "#fffff0",
  burgundy: "#800020",
  wine: "#722f37",
  mustard: "#ffdb58",
  rust: "#b7410e",
  olive: "#808000",
  "olive green": "#556b2f",
  sage: "#bcb88a",
  "sage green": "#bcb88a",
  blush: "#de5d83",
  mauve: "#e0b0ff",
  charcoal: "#36454f",
  "heather gray": "#9aa297",
  "heather grey": "#9aa297",
  "light wash": "#a8c4e0",
  "dark wash": "#1a3a5c",
  "light blue": "#add8e6",
  "dark blue": "#00008b",
  "dark green": "#006400",
  "light green": "#90ee90",
  "light pink": "#ffb6c1",
  "hot pink": "#ff69b4",
  "dark red": "#8b0000",
  "royal blue": "#4169e1",
  "sky blue": "#87ceeb",
  "baby blue": "#89cff0",
  "forest green": "#228b22",
  "bright red": "#ff0000",
  "off white": "#faf0e6",
  "off-white": "#faf0e6",
  taupe: "#483c32",
  camel: "#c19a6b",
  cognac: "#9a463d",
  espresso: "#3c1414",
  champagne: "#f7e7ce",
  "rose gold": "#b76e79",
  denim: "#6f8faf",
  khaki: "#c3b091",
};

const CSS_COLORS = new Set([
  "red", "blue", "green", "black", "white", "gray", "grey", "pink",
  "purple", "orange", "yellow", "brown", "navy", "teal", "coral",
  "salmon", "khaki", "beige", "tan", "maroon", "olive", "cyan",
  "magenta", "turquoise", "violet", "indigo", "crimson", "lavender",
  "plum", "orchid", "sienna", "peru", "linen", "wheat", "ivory",
  "aqua", "lime", "silver", "gold", "tomato",
]);

export function resolveColor(colorName: string): string {
  const name = colorName.toLowerCase().trim();
  if (COLOR_MAP[name]) return COLOR_MAP[name];
  if (CSS_COLORS.has(name)) return name;
  const firstWord = name.split(/[\s/,]+/)[0];
  if (COLOR_MAP[firstWord]) return COLOR_MAP[firstWord];
  if (CSS_COLORS.has(firstWord)) return firstWord;
  return "#b8879b";
}

export function getImageSrc(imageData: string): string {
  // PNG base64 starts with "iVBOR", JPEG with "/9j/"
  if (imageData.startsWith("iVBOR")) {
    return `data:image/png;base64,${imageData}`;
  }
  return `data:image/jpeg;base64,${imageData}`;
}
