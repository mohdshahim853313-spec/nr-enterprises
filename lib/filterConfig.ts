export interface FilterColor {
  name: string;
  hex: string;
}

export interface FilterSettings {
  types: string[];
  materials: string[];
  colors: FilterColor[];
  patterns: string[];
  shapes: string[];
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  types: [
    "Carpet",
    "Runner",
    "Area Rug",
    "Dhurrie",
    "Grass Carpet",
    "Chatai",
    "Braided",
    "Cut-Pile",
    "Flatweave",
    "Hand-Knotted",
    "Jute",
    "Kilim",
    "Outdoor",
    "Rectangular & Oval",
    "Rectangular & Round",
    "Rectangular",
    "Round & Oval",
    "rPET",
    "Shag",
    "Tufted"
  ],
  materials: [
    "Cotton",
    "Acrylic",
    "Polyester",
    "Velvet",
    "Nylon",
    "Polypropylene",
    "100% Recycled PET",
    "Chenille & Cotton",
    "Hemp & Wool Blend",
    "Jute & Wool Blend",
    "Natural Jute",
    "Organic Cotton Blend",
    "Pure New Zealand Wool",
    "Pure Viscose / Silk",
    "Wool & Bamboo Silk Blend"
  ],
  colors: [
    { name: "Lavender", hex: "#BDB2FF" },
    { name: "Peach", hex: "#FFD1BA" },
    { name: "Dark Green", hex: "#1B3624" },
    { name: "Light Green", hex: "#90BE6D" },
    { name: "Orange", hex: "#F9844A" },
    { name: "Pink", hex: "#F72585" },
    { name: "Ivory", hex: "#FFFFF0" },
    { name: "Beige", hex: "#DFD8CC" },
    { name: "Navy Blue", hex: "#1D3557" },
    { name: "Grey", hex: "#8D99AE" },
    { name: "Terracotta", hex: "#A0522D" },
    { name: "Gold", hex: "#C19A6B" }
  ],
  patterns: [
    "Abstract",
    "Animal",
    "Cartoon",
    "Floral",
    "Geometric",
    "Motifs",
    "Bohemian",
    "Solid",
    "Striped",
    "Traditional",
    "Tribal"
  ],
  shapes: [
    "Hexagon",
    "Pentagon",
    "Oval",
    "Abstract",
    "Square",
    "Circle",
    "Rectangle",
    "Runner"
  ]
};
