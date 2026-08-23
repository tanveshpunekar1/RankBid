import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const prisma = new PrismaClient();

const SAMPLE_LISTINGS = [
  {
    title: "Zerodha",
    url_or_handle: "https://zerodha.com",
    normalized_key: "zerodha.com",
    description: "India's largest retail stockbroker, empowering millions with zero brokerage equity investing.",
    category_slug: "finance-fintech",
    submitter_phone: "+919876543210",
    bid_inr: 75000, // ₹75,000 -> Rank #1
  },
  {
    title: "Postman",
    url_or_handle: "https://postman.com",
    normalized_key: "postman.com",
    description: "The world's leading API platform built by Indian engineers, used by 30M+ developers.",
    category_slug: "startups-saas",
    submitter_phone: "+919811122233",
    bid_inr: 52000, // ₹52,000 -> Rank #2
  },
  {
    title: "Zepto",
    url_or_handle: "https://zeptonow.com",
    normalized_key: "zeptonow.com",
    description: "10-minute grocery delivery revolutionizing quick commerce across Indian metros.",
    category_slug: "d2c-ecommerce",
    submitter_phone: "+919922334455",
    bid_inr: 41000, // ₹41,000 -> Rank #3
  },
  {
    title: "CRED",
    url_or_handle: "https://cred.club",
    normalized_key: "cred.club",
    description: "Rewarding creditworthy individuals for paying credit card bills on time.",
    category_slug: "finance-fintech",
    submitter_phone: "+919833445566",
    bid_inr: 32500,
  },
  {
    title: "Sarvam AI",
    url_or_handle: "https://sarvam.ai",
    normalized_key: "sarvam.ai",
    description: "Building sovereign GenAI foundational models and speech technology tailored for Indian languages.",
    category_slug: "ai-tools",
    submitter_phone: "+919844556677",
    bid_inr: 28000,
  },
  {
    title: "PhysicsWallah",
    url_or_handle: "https://pw.live",
    normalized_key: "pw.live",
    description: "Democratizing education in Bharat with affordable courses for JEE, NEET, UPSC, and Foundation.",
    category_slug: "education-coaching",
    submitter_phone: "+919855667788",
    bid_inr: 21000,
  },
  {
    title: "InVideo AI",
    url_or_handle: "https://invideo.io",
    normalized_key: "invideo.io",
    description: "Turn text prompts into viral video scripts, animations, and voiceovers effortlessly.",
    category_slug: "ai-tools",
    submitter_phone: "+919866778899",
    bid_inr: 17500,
  },
  {
    title: "Snitch",
    url_or_handle: "https://snitch.co.in",
    normalized_key: "snitch.co.in",
    description: "Fast-fashion clothing brand tailored for modern Indian men, backed by Shark Tank India.",
    category_slug: "fashion-beauty",
    submitter_phone: "+919877889900",
    bid_inr: 14000,
  },
  {
    title: "Chai Sutta Bar",
    url_or_handle: "https://chaisuttabarindia.com",
    normalized_key: "chaisuttabarindia.com",
    description: "India's largest Kulhad Chai chain with 550+ outlets serving eco-friendly clay cup chai.",
    category_slug: "restaurants-food",
    submitter_phone: "+919888990011",
    bid_inr: 11500,
  },
  {
    title: "@tanmaybhat",
    url_or_handle: "https://x.com/thetanmay",
    normalized_key: "x.com/thetanmay",
    description: "Comedian, YouTuber, and angel investor sharing business & finance breakdowns.",
    category_slug: "creators-influencers",
    submitter_phone: "+919899001122",
    bid_inr: 9500,
  },
  {
    title: "NoBroker",
    url_or_handle: "https://nobroker.in",
    normalized_key: "nobroker.in",
    description: "India's first proptech unicorn eliminating brokerage fees for tenants, buyers, and owners.",
    category_slug: "real-estate",
    submitter_phone: "+919800112233",
    bid_inr: 8000,
  },
  {
    title: "Urban Company",
    url_or_handle: "https://urbancompany.com",
    normalized_key: "urbancompany.com",
    description: "At-home beauty, cleaning, salon, and handyman services on-demand across 50+ cities.",
    category_slug: "local-services",
    submitter_phone: "+919812345678",
    bid_inr: 6500,
  },
  {
    title: "Zostel",
    url_or_handle: "https://zostel.com",
    normalized_key: "zostel.com",
    description: "India's premier chain of backpacker hostels and experiential travel stays in the Himalayas & beyond.",
    category_slug: "travel-hospitality",
    submitter_phone: "+919823456789",
    bid_inr: 5000,
  },
  {
    title: "WedMeGood",
    url_or_handle: "https://wedmegood.com",
    normalized_key: "wedmegood.com",
    description: "Your ultimate Indian wedding planning portal: venues, photographers, makeup artists & bridal lehengas.",
    category_slug: "events-weddings",
    submitter_phone: "+919834567890",
    bid_inr: 3800,
  },
  {
    title: "Licious",
    url_or_handle: "https://licious.in",
    normalized_key: "licious.in",
    description: "Farm-to-fork fresh meat, seafood, and ready-to-cook delicacies delivered in 90 minutes.",
    category_slug: "d2c-ecommerce",
    submitter_phone: "+919845678901",
    bid_inr: 2700,
  },
  {
    title: "Kalam AI",
    url_or_handle: "https://kalam.in",
    normalized_key: "kalam.in",
    description: "AI-powered personal tutor tailored for UPSC civil services preparation.",
    category_slug: "education-coaching",
    submitter_phone: "+919856789012",
    bid_inr: 1500,
  },
  {
    title: "DesiDesign Studio",
    url_or_handle: "https://desidesign.studio",
    normalized_key: "desidesign.studio",
    description: "Boutique UI/UX and brand identity agency crafting world-class digital products for Indian founders.",
    category_slug: "freelancers-agencies",
    submitter_phone: "+919867890123",
    bid_inr: 900,
  },
];

async function main() {
  console.log("🌱 Starting RankBid database seed...");

  // 1. Seed Categories
  console.log("📂 Seeding categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
      },
    });
  }

  // 2. Seed Sample Listings and Bids
  console.log("🏆 Seeding initial rankings and bids...");
  for (let i = 0; i < SAMPLE_LISTINGS.length; i++) {
    const item = SAMPLE_LISTINGS[i];
    const amountPaise = item.bid_inr * 100;

    // Create or update listing
    const listing = await prisma.listing.upsert({
      where: { normalized_key: item.normalized_key },
      update: {
        title: item.title,
        url_or_handle: item.url_or_handle,
        description: item.description,
        category_slug: item.category_slug,
        submitter_phone: item.submitter_phone,
        is_active: true,
      },
      create: {
        title: item.title,
        url_or_handle: item.url_or_handle,
        normalized_key: item.normalized_key,
        description: item.description,
        category_slug: item.category_slug,
        submitter_phone: item.submitter_phone,
        is_active: true,
      },
    });

    // Clean previous bids if any
    await prisma.bid.deleteMany({
      where: { listing_id: listing.id },
    });

    // Create initial paid bid
    const createdAt = new Date(Date.now() - (SAMPLE_LISTINGS.length - i) * 3600 * 1000);
    await prisma.bid.create({
      data: {
        listing_id: listing.id,
        amount_paise: amountPaise,
        is_current: true,
        status: "PAID",
        razorpay_payment_id: `pay_seed_${Math.random().toString(36).substring(2, 9)}`,
        razorpay_order_id: `order_seed_${Math.random().toString(36).substring(2, 9)}`,
        created_at: createdAt,
      },
    });

    // Add some initial click counts for analytics
    const clickCount = Math.max(5, 50 - i * 2);
    for (let c = 0; c < clickCount; c++) {
      await prisma.clickEvent.create({
        data: {
          listing_id: listing.id,
          referrer: "https://rankbid.in",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          ip_hash: `seed_ip_${c % 10}`,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400 * 1000)),
        },
      });
    }
  }

  // 3. Create initial Admin user
  await prisma.adminUser.upsert({
    where: { email: "admin@rankbid.in" },
    update: {},
    create: {
      email: "admin@rankbid.in",
      password_hash: "8888", // Default dev PIN
    },
  });

  console.log("✅ Seed completed successfully! 17 verified listings loaded.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
