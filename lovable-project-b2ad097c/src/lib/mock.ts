// Mock data layer for AgriSense AI (frontend-only demo)

export type Crop = {
  id: string;
  name: string;
  scientific: string;
  emoji: string;
  confidence: number;
  suitability: number;
  duration: string;
  yield: string;
  water: string;
  profit: "Low" | "Medium" | "High";
  investment: "Low" | "Medium" | "High";
  difficulty: "Easy" | "Moderate" | "Hard";
  sowing: string;
  harvest: string;
  reasons: string[];
  soil: string;
  temperature: string;
  rainfall: string;
  demand: string;
  diseases: string[];
  prevention: string[];
};

export const crops: Crop[] = [
  {
    id: "rice",
    name: "Rice (Paddy)",
    scientific: "Oryza sativa",
    emoji: "🌾",
    confidence: 94,
    suitability: 92,
    duration: "120–140 days",
    yield: "5.2 t/ha",
    water: "High (1200 mm)",
    profit: "High",
    investment: "Medium",
    difficulty: "Moderate",
    sowing: "June – July",
    harvest: "October – November",
    reasons: [
      "Soil pH 6.4 is within the ideal 5.5–7.0 range",
      "Nitrogen level is optimal for vegetative growth",
      "Forecast rainfall of 180 mm suits water demand",
      "Kharif season conditions match crop calendar",
    ],
    soil: "Clay loam with good water retention",
    temperature: "21–37 °C",
    rainfall: "1000–1500 mm",
    demand: "Very high — stable MSP support",
    diseases: ["Blast", "Bacterial leaf blight", "Sheath rot"],
    prevention: ["Use certified seed", "Balanced nitrogen dosing", "Field drainage during heavy rain"],
  },
  {
    id: "maize",
    name: "Maize",
    scientific: "Zea mays",
    emoji: "🌽",
    confidence: 88,
    suitability: 86,
    duration: "90–110 days",
    yield: "6.0 t/ha",
    water: "Medium (600 mm)",
    profit: "High",
    investment: "Low",
    difficulty: "Easy",
    sowing: "June – July",
    harvest: "September – October",
    reasons: [
      "Well-drained loam matches maize requirements",
      "Phosphorus level supports strong root growth",
      "Short duration fits your rotation plan",
    ],
    soil: "Well-drained sandy loam",
    temperature: "18–32 °C",
    rainfall: "500–800 mm",
    demand: "High — feed and starch industry",
    diseases: ["Turcicum leaf blight", "Stem borer"],
    prevention: ["Crop rotation", "Timely sowing", "Pheromone traps"],
  },
  {
    id: "groundnut",
    name: "Groundnut",
    scientific: "Arachis hypogaea",
    emoji: "🥜",
    confidence: 81,
    suitability: 79,
    duration: "100–120 days",
    yield: "2.4 t/ha",
    water: "Low (450 mm)",
    profit: "Medium",
    investment: "Low",
    difficulty: "Easy",
    sowing: "June – July",
    harvest: "October",
    reasons: ["Low water requirement suits your irrigation", "Improves soil nitrogen naturally"],
    soil: "Sandy loam, well drained",
    temperature: "20–34 °C",
    rainfall: "450–700 mm",
    demand: "Medium — oil mills nearby",
    diseases: ["Tikka leaf spot", "Collar rot"],
    prevention: ["Seed treatment", "Gypsum application at pegging"],
  },
  {
    id: "cotton",
    name: "Cotton",
    scientific: "Gossypium hirsutum",
    emoji: "☁️",
    confidence: 76,
    suitability: 74,
    duration: "160–180 days",
    yield: "2.1 t/ha",
    water: "Medium (700 mm)",
    profit: "High",
    investment: "High",
    difficulty: "Hard",
    sowing: "May – June",
    harvest: "November – January",
    reasons: ["Black soil retains moisture well", "Strong market price trend this season"],
    soil: "Black cotton soil",
    temperature: "21–35 °C",
    rainfall: "600–900 mm",
    demand: "High — export driven",
    diseases: ["Pink bollworm", "Wilt"],
    prevention: ["Bt refuge planting", "Regular scouting"],
  },
];

export const forecast = [
  { day: "Mon", temp: 31, min: 23, rain: 10, icon: "sun" },
  { day: "Tue", temp: 29, min: 22, rain: 60, icon: "rain" },
  { day: "Wed", temp: 28, min: 22, rain: 80, icon: "rain" },
  { day: "Thu", temp: 30, min: 23, rain: 20, icon: "cloud" },
  { day: "Fri", temp: 32, min: 24, rain: 5, icon: "sun" },
  { day: "Sat", temp: 33, min: 25, rain: 0, icon: "sun" },
  { day: "Sun", temp: 31, min: 24, rain: 30, icon: "cloud" },
];

export const marketPrices = [
  { crop: "Rice (Paddy)", market: "Nashik Mandi", price: 2320, prev: 2280, unit: "₹/quintal" },
  { crop: "Maize", market: "Pune APMC", price: 2145, prev: 2190, unit: "₹/quintal" },
  { crop: "Groundnut", market: "Rajkot Mandi", price: 6420, prev: 6310, unit: "₹/quintal" },
  { crop: "Cotton", market: "Akola Mandi", price: 7480, prev: 7395, unit: "₹/quintal" },
  { crop: "Wheat", market: "Indore Mandi", price: 2610, prev: 2600, unit: "₹/quintal" },
  { crop: "Soybean", market: "Latur Mandi", price: 4890, prev: 4960, unit: "₹/quintal" },
];

export const priceTrend = [
  { week: "W1", rice: 2210, maize: 2050, cotton: 7100 },
  { week: "W2", rice: 2245, maize: 2110, cotton: 7220 },
  { week: "W3", rice: 2260, maize: 2160, cotton: 7180 },
  { week: "W4", rice: 2280, maize: 2190, cotton: 7395 },
  { week: "W5", rice: 2320, maize: 2145, cotton: 7480 },
];

export const schemes = [
  {
    name: "PM-KISAN",
    benefit: "₹6,000 per year direct income support in three instalments.",
    eligibility: "All landholding farmer families with cultivable land records.",
    link: "https://pmkisan.gov.in",
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    benefit: "Crop insurance against drought, flood, pest and yield loss.",
    eligibility: "Farmers growing notified crops in notified areas.",
    link: "https://pmfby.gov.in",
  },
  {
    name: "Soil Health Card",
    benefit: "Free soil testing with nutrient-wise fertilizer recommendations.",
    eligibility: "All farmers, once every two years per holding.",
    link: "https://soilhealth.dac.gov.in",
  },
  {
    name: "Seed Subsidy Scheme",
    benefit: "Up to 50% subsidy on certified high-yield seed varieties.",
    eligibility: "Small and marginal farmers via state agriculture dept.",
    link: "https://agriwelfare.gov.in",
  },
  {
    name: "Kisan Credit Card",
    benefit: "Short-term crop loans at 4% effective interest with timely repayment.",
    eligibility: "Farmers, tenant farmers, oral lessees and SHGs.",
    link: "https://www.myscheme.gov.in",
  },
];

export const history = [
  { date: "12 Jul 2026", crop: "Rice (Paddy)", confidence: 94, weather: "Monsoon", yield: "5.1 t/ha" },
  { date: "03 Mar 2026", crop: "Groundnut", confidence: 86, weather: "Dry", yield: "2.3 t/ha" },
  { date: "18 Nov 2025", crop: "Wheat", confidence: 91, weather: "Cool", yield: "4.4 t/ha" },
  { date: "22 Jun 2025", crop: "Maize", confidence: 83, weather: "Humid", yield: "5.8 t/ha" },
];

export const notifications = [
  { title: "Heavy rain alert", body: "80 mm rainfall expected Wednesday. Avoid irrigation today.", tone: "warn" },
  { title: "Market price up", body: "Paddy up ₹40/quintal at Nashik Mandi.", tone: "good" },
  { title: "Pest advisory", body: "Stem borer activity reported in your district.", tone: "warn" },
  { title: "Government update", body: "PM-KISAN 19th instalment credited this week.", tone: "good" },
];

export const fertilizers = [
  { name: "Farmyard manure", type: "Organic", qty: "8 t/ha", when: "2 weeks before sowing", cost: "₹4,000" },
  { name: "Urea", type: "Chemical", qty: "110 kg/ha", when: "Split: basal + tillering", cost: "₹740" },
  { name: "DAP", type: "Chemical", qty: "60 kg/ha", when: "Basal dose", cost: "₹1,620" },
  { name: "Muriate of potash", type: "Chemical", qty: "40 kg/ha", when: "Basal dose", cost: "₹680" },
  { name: "Vermicompost", type: "Organic", qty: "2 t/ha", when: "At land preparation", cost: "₹6,000" },
];
