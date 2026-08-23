import { CATEGORIES } from "./categories";

export function classifyCategory(
  urlOrHandle: string,
  title: string,
  description?: string
): { slug: string; confidence: number; name: string } {
  const combined = `${urlOrHandle} ${title} ${description || ""}`.toLowerCase();

  // Known domain shortcuts
  if (/(zerodha|groww|cred|paytm|razorpay|phonepe|jupiter|indmoney|fi\.money|slice)/i.test(combined)) {
    return { slug: "finance-fintech", confidence: 0.95, name: "Finance & Fintech" };
  }
  if (/(openai|claude|gemini|gpt|midjourney|huggingface|perplexity|cursor|v0\.dev|anthropic)/i.test(combined)) {
    return { slug: "ai-tools", confidence: 0.95, name: "AI Tools" };
  }
  if (/(swiggy|zomato|chaayos|chaipoint|mcdonalds|starbucks|dominos|licious|countrydelight)/i.test(combined)) {
    return { slug: "restaurants-food", confidence: 0.95, name: "Restaurants & Food" };
  }
  if (/(nykaa|boat|sugarcosmetics|mamaearth|snitch|myntra|ajio|zudio|lenskart|beardo)/i.test(combined)) {
    return { slug: "fashion-beauty", confidence: 0.92, name: "Fashion & Beauty" };
  }
  if (/(pw\.live|physicswallah|unacademy|byjus|scaler|upgrad|coursera|vedantu|geeksforgeeks)/i.test(combined)) {
    return { slug: "education-coaching", confidence: 0.92, name: "Education & Coaching" };
  }
  if (/(makemytrip|goibibo|oyo|cleartrip|yatra|easemytrip|ixigo|zostel|tajhotels)/i.test(combined)) {
    return { slug: "travel-hospitality", confidence: 0.92, name: "Travel & Hospitality" };
  }
  if (/(nobroker|magicbricks|99acres|housing\.com|squareyards|anarock|wework)/i.test(combined)) {
    return { slug: "real-estate", confidence: 0.92, name: "Real Estate" };
  }
  if (/(urbancompany|housejoy|dunzo|porter|rapido|ola|uber)/i.test(combined)) {
    return { slug: "local-services", confidence: 0.90, name: "Local Services" };
  }
  if (/(cult\.fit|curefit|practo|1mg|pharmeasy|apollo|tatapharma|healthifyme)/i.test(combined)) {
    return { slug: "health-wellness", confidence: 0.92, name: "Health & Wellness" };
  }
  if (/(x\.com\/|instagram\.com\/|youtube\.com\/|spotify\.com\/|substack\.com)/i.test(combined)) {
    return { slug: "creators-influencers", confidence: 0.85, name: "Creators & Influencers" };
  }
  if (/(wedmegood|shaadi|bharatmatrimony|weddingwire)/i.test(combined)) {
    return { slug: "events-weddings", confidence: 0.90, name: "Events & Weddings" };
  }

  // Keyword score calculation
  let bestSlug = "other";
  let maxScore = 0;

  for (const cat of CATEGORIES) {
    if (cat.slug === "other") continue;
    let score = 0;
    for (const kw of cat.keywords) {
      if (combined.includes(kw)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestSlug = cat.slug;
    }
  }

  const category = CATEGORIES.find((c) => c.slug === bestSlug) || CATEGORIES[CATEGORIES.length - 1];
  const confidence = maxScore > 0 ? Math.min(0.5 + maxScore * 0.15, 0.9) : 0.4;

  return {
    slug: category.slug,
    confidence,
    name: category.name,
  };
}
