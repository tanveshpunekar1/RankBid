export interface CategoryDef {
  slug: string;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "startups-saas",
    name: "Startups & SaaS",
    icon: "Rocket",
    description: "B2B SaaS, developer tools, productivity, and tech startups.",
    keywords: ["saas", "software", "b2b", "api", "cloud", "platform", "crm", "analytics", "dashboard", "developer", "startup"],
  },
  {
    slug: "ai-tools",
    name: "AI Tools",
    icon: "Sparkles",
    description: "Generative AI, machine learning models, bots, and AI productivity tools.",
    keywords: ["ai", "gpt", "llm", "bot", "intelligence", "copilot", "generative", "neural", "vision", "automation", "agent"],
  },
  {
    slug: "d2c-ecommerce",
    name: "D2C & Ecommerce",
    icon: "ShoppingBag",
    description: "Direct-to-consumer brands, online stores, marketplace sellers, and consumer products.",
    keywords: ["store", "shop", "d2c", "ecommerce", "brand", "products", "buy", "cart", "clothing", "apparel", "retail"],
  },
  {
    slug: "restaurants-food",
    name: "Restaurants & Food",
    icon: "Utensils",
    description: "Cafes, cloud kitchens, QSR chains, bakeries, gourmet food, and dining.",
    keywords: ["food", "restaurant", "cafe", "kitchen", "dining", "bakery", "snack", "sweets", "coffee", "tea", "qsr", "chef"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "Building2",
    description: "Property portals, builders, brokers, co-working spaces, and interior design.",
    keywords: ["realestate", "property", "builder", "flat", "apartment", "realty", "broker", "villa", "coworking", "housing"],
  },
  {
    slug: "education-coaching",
    name: "Education & Coaching",
    icon: "GraduationCap",
    description: "EdTech platforms, coaching institutes, courses, entrance prep, and online tutors.",
    keywords: ["edtech", "education", "course", "coaching", "academy", "learn", "institute", "prep", "tutor", "training", "upskill"],
  },
  {
    slug: "freelancers-agencies",
    name: "Freelancers & Agencies",
    icon: "Briefcase",
    description: "Design agencies, marketing firms, software consultancies, and independent talent.",
    keywords: ["agency", "studio", "freelance", "design", "marketing", "consulting", "services", "development", "creative", "branding"],
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness",
    icon: "Activity",
    description: "Fitness apps, gyms, wellness clinics, Ayurveda, mental health, and supplements.",
    keywords: ["health", "fitness", "wellness", "gym", "clinic", "ayurveda", "mental", "supplement", "care", "yoga", "nutrition"],
  },
  {
    slug: "fashion-beauty",
    name: "Fashion & Beauty",
    icon: "Shirt",
    description: "Cosmetics, skincare, jewellery, ethnic wear, streetwear, and luxury fashion.",
    keywords: ["fashion", "beauty", "cosmetics", "skincare", "jewellery", "makeup", "wear", "ethnic", "style", "couture"],
  },
  {
    slug: "local-services",
    name: "Local Services",
    icon: "Wrench",
    description: "Home repairs, cleaning, pest control, logistics, plumbing, and local trades.",
    keywords: ["service", "repair", "cleaning", "plumbing", "electrician", "pest", "local", "mechanic", "maintenance", "installation"],
  },
  {
    slug: "creators-influencers",
    name: "Creators & Influencers",
    icon: "Video",
    description: "YouTubers, podcasters, newsletter writers, streamers, and content creators.",
    keywords: ["creator", "youtube", "podcast", "influencer", "streamer", "newsletter", "vlog", "author", "artist", "media"],
  },
  {
    slug: "events-weddings",
    name: "Events & Weddings",
    icon: "PartyPopper",
    description: "Wedding planners, event decorators, banquet halls, photographers, and DJ services.",
    keywords: ["event", "wedding", "planner", "photography", "banquet", "celebration", "caterer", "dj", "party", "venue"],
  },
  {
    slug: "finance-fintech",
    name: "Finance & Fintech",
    icon: "Landmark",
    description: "Payment gateways, wealth management, insurance, crypto, and stock trading platforms.",
    keywords: ["fintech", "finance", "invest", "trading", "stocks", "mutual", "insurance", "loan", "upi", "banking", "wealth"],
  },
  {
    slug: "travel-hospitality",
    name: "Travel & Hospitality",
    icon: "Plane",
    description: "Hotels, homestays, tour packages, travel agencies, resorts, and adventure travel.",
    keywords: ["travel", "hotel", "resort", "homestay", "tour", "tourism", "vacation", "trip", "holiday", "stay", "flight"],
  },
  {
    slug: "other",
    name: "Other",
    icon: "Globe",
    description: "Unique ventures, non-profits, portfolios, and miscellaneous listings.",
    keywords: ["other", "misc", "general", "portfolio", "portal"],
  },
];
