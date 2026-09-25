// src/utils/constants.js
// Central config — imported by App.js (and eventually individual page files)

export const SHOP_DOMAIN = "c0bqfe-z2.myshopify.com";

export const DEFAULT_SELLING_PLAN_ID = "1467875506";

export const PRODUCT_VARIANT_MAP = {
"The Majorities Shampoo": {
merchandiseId: "47555331358898",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Conditioner": {
merchandiseId: "47555331555506",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Hair Oil": {
merchandiseId: "47555331752114",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Facial Scrub": {
merchandiseId: "47555331948722",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Face Toner": {
merchandiseId: "47555332145330",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Lotion": {
merchandiseId: "47555332309170",
pricing: { oneTime: 19.99, subscription: 14.99 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
}
};

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hair-backend-1.onrender.com";

// Single rank ladder for the whole site (and mirrored in the backend lib/rankTiers.js + mobile app).
export const RANK_TIERS = [
  {
    title: "Nice and Helpful",
    min: 75000000,
    description: "The ultimate beacon of goodwill in The Majorities ecosystem. Unmatched dedication to keeping the community radiant and supportive."
  },
  {
    title: "Servant of the People",
    min: 50000000,
    description: "A revered leader devoted entirely to serving the collective needs, routines, and wellness of the public."
  },
  {
    title: "Servant of the Majorities",
    min: 45000000,
    description: "A pillar of the community who puts the needs of the collective catalog above all personal interests."
  },
  {
    title: "Generalissimo ",
    min: 43000000,
    description: "Supreme tactical commander overseeing the distribution, strategy, and direction of The Majorities."
  },
  {
    title: "General Secretary of The Majorities",
    min: 40000000,
    description: "Holds the highest administrative power, shaping platform directives, cultural policies, and community standards."
  },
  {
    title: "Premier of The Majorities",
    min: 35000000,
    description: "Head of executive operations, ensuring every movement across the platform functions with absolute precision."
  },
  {
    title: "Chairman of the Standing Committee of the Majorities Duma",
    min: 30000000,
    description: "Presides over legislative proposals, community votes, and high-level platform policy within The Duma."
  },
  {
    title: "Chairman of the National Committee of the Majorities Political Consultative",
    min: 25000000,
    description: "Gathers consensus across all branches of the community to guide upcoming product directives and initiatives."
  },
  {
    title: "Director of the General Office of the Majorities",
    min: 20000000,
    description: "Manages day-to-day central operations, internal communication flows, and high-priority platform routines."
  },
  {
    title: "Secretary of the Central Commission for Discipline Inspection",
    min: 15000000,
    description: "Guards community integrity by ensuring guidelines, standards, and fair interaction are strictly upheld."
  },
  {
    title: "Politburo Member of The Majorities",
    min: 10000000,
    description: "Part of the elite core governing body making critical policy decisions for the entire ecosystem."
  },
  {
    title: "Secretary of Majorities Committees of Provinces",
    min: 7500000,
    description: "Regional leaders mobilizing local networks, discussions, and grassroots engagement for the brand."
  },
  {
    title: "Commissar of the The Majorities",
    min: 5000000,
    description: "Enforces ideological harmony and high morale across forums and community channels."
  },
  {
    title: "Champion of the The Majorities",
    min: 4500000,
    description: "A celebrated advocate whose contributions and active presence set the benchmark for everyone else."
  },
  {
    title: "Hero of the Majorities",
    min: 4000000,
    description: "Awarded to members who have demonstrated extraordinary loyalty and long-term commitment to the platform."
  },
  {
    title: "Order of The Majorities",
    min: 3500000,
    description: "Inducted into the highest prestige order for outstanding service to the community catalog."
  },
  {
    title: "Order of the October Revolution",
    min: 3000000,
    description: "Recognizes members who spearheaded massive structural improvements or major viral trends."
  },
  {
    title: "Order of the Red Banner of Labor",
    min: 2500000,
    description: "Honors relentless work ethic, high post volume, and consistent participation in site activities."
  },
  {
    title: "Order of Friendship of Peoples",
    min: 2000000,
    description: "Celebrates those who bridge communities, welcome new members, and foster cross-forum unity."
  },
  {
    title: "Order of the Badge of Honor",
    min: 1500000,
    description: "A mark of distinction granted for exemplary participation and reliable engagement."
  },
  {
    title: "The Salvation of the Drowning",
    min: 1000000,
    description: "Given to helpful members who step in with quick answers and support when others need guidance."
  },
  {
    title: "Supreme Lizard King",
    min: 900000,
    description: "Cold-blooded, unbannable, and operating at the absolute peak of the shadow hierarchy. Controls the entire forum timeline."
  },
  {
    title: "Illuminati CEO",
    min: 800000,
    description: "Running global cosmetic agendas from a standing desk. Approves all secret box formulas behind closed doors."
  },
  {
    title: "Freemason Intern",
    min: 700000,
    description: "Secret handshakes are mandatory. One promotion away from dictating top-secret shampoo formulations."
  },
  {
    title: "Area 51 Landlord",
    min: 600000,
    description: "Keeps the absolute weirdest forum posts and classified beauty hacks locked safely inside restricted sub-boards."
  },
  {
    title: "Rothschild’s Left Hand",
    min: 500000,
    description: "Quietly funding custom 6-product bundles and gifting premium subscriptions across the shadow network."
  },
  {
    title: "Simulation Programmer",
    min: 400000,
    description: "Alters platform themes, post algorithms, and personal care recommendations at a whim."
  },
  {
    title: "Shadow Cabinet Secretary",
    min: 300000,
    description: "Secretly organizing hidden group chats and orchestrating behind-the-scenes discussions within The Duma."
  },
  {
    title: "Redacted Entity",
    min: 200000,
    description: "Blank avatar, mysterious history. Nobody knows who they are, but they are constantly accumulating points."
  },
  {
    title: "Chem-Trail Coordinator",
    min: 100000,
    description: "Spreading spicy takes, aromatic facial toners, and hot debate across all public culture feeds."
  },
  {
    title: "Controlled Opposition",
    min: 50000,
    description: "Intentionally starts friendly product debates in comment threads just to keep engagement metrics soaring."
  },
  {
    title: "Hologram Technician",
    min: 25000,
    description: "Maintains the flawless projection that this community is just a normal, everyday personal care brand."
  },
  {
    title: "Crisis Management Intern",
    min: 10000,
    description: "Sweeping accidental duplicate posts and deleted forum screenshots quietly under the rug."
  },
  {
    title: "Deep State Operative",
    min: 5000,
    description: "Clocking in daily to keep points tallies ticking and product routines running smoothly."
  },
  {
    title: "Subliminal Messenger",
    min: 2500,
    description: "Master of dropping subtle skincare tips and inside jokes disguised as casual forum thoughts."
  },
  {
    title: "Glitch in the Matrix",
    min: 1500,
    description: "Occasionally posts cryptic 60-second voice notes or perspective posts, then disappears into the shadows."
  },
  {
    title: "Birds-Aren't-Real Observer",
    min: 1000,
    description: "Spends way too much time staring out the window waiting for their monthly subscription delivery box."
  },
  {
    title: "Microchipped Normie",
    min: 500,
    description: "Completely compliant. Buys the full 6-product custom set and follows their regimen to the letter."
  },
  {
    title: "Tin Foil Apprentice",
    min: 250,
    description: "Starting to ask questions about the secret algorithms behind tier updates and point rewards."
  },
  {
    title: "Crisis Actor",
    min: 100,
    description: "Only shows up in comment sections when the community needs to simulate drama or boost active user counts."
  },
  {
    title: "Industry Plant",
    min: 50,
    description: "Placed here directly by upper management. Confused by the lore, but happy to build a custom set."
  },
  {
    title: "Comrade",
    min: 1,
    description: "First step into the fold. Welcome to the collective journey."
  }
];

export const productsData = {
shampoos: [
{
name: "The Majorities Shampoo",
imageUrl: "/Amazon S.jpg",
images: ["/Amazon S.jpg", "/Amazon S side.jpg", "/Amazon S Back.jpg"],
desc: (
<>
<p>Reset and revive stressed hair with a salon-grade, deep-cleansing wash designed for all hair types. This high-foaming, rinse-off shampoo creates a rich, decadent lather that effortlessly lifts away stubborn scalp buildup, excess oils, and environmental pollutants without stripping away natural moisture.</p>
<p>Powered by Provitamin B5 (Panthenol) and advanced anti-frizz shields, it tames static, boosts elasticity, and wraps your hair in a luminous, mirror-like shine.</p>
<p><strong>Hair Type:</strong> Perfect for daily use on natural or non-color treated hair.</p>
<p><strong>Scent Experience:</strong> Infused with a premium, long-lasting signature fragrance.</p>
<p><strong>Ingredients:</strong> Water, Sodium C14-16 Olefin Sulfonate, Cocamidopropyl Betaine, Ceteareth-60 Myristyl Glycol, Polysorbate 80, Lauramide DIPA, Polyquaternium-10, Polyquaternium-7, Panthenol, Fragrance, Caprylyl Glycol, Phenoxyethanol, Citric Acid, Tetrasodium Glutamate Diacetate, Blue 1</p>
</>
)
}
],
conditioners: [
{
name: "The Majorities Conditioner",
imageUrl: "/Amazon hc.jpg", images: ["/Amazon hc.jpg", "/Amazon hc side.png", "/Amazon hc back.jpg"],
desc: (
<>
<p>Rescue and restore chronically dry, brittle, or damaged hair with an intensive moisture therapy treatment. This ultra-rich, rinse-off conditioner melts into parched strands, delivering a powerful infusion of tropical Coconut Oil, liquid gold Argan Oil, and nourishing Olive Oil. It actively mends frayed cuticles, eliminates stubborn knots, and neutralizes static cling.</p>
<p>Perfect for restoring natural bounce, strength, and resilience, it leaves hair effortlessly detangled, silky-smooth, and deeply repaired from root to tip.</p>
<p><strong>Hair Benefits:</strong> Ultimate detangling, breakage defense, and extreme cuticle smoothing.</p>
<p><strong>Ingredient Highlights:</strong> Pure Argan Oil, Coconut Oil, Olive Oil, and Provitamin B5.</p>
<p><strong>Ingredients:</strong> Water, Stearyl Alcohol, Cetyl Alcohol, Glycine Soja (Soybean) Oil, Brassicamidopropyl Dimethylamine, Polysorbate 80, Cocos Nucifera (Coconut) Oil, Argania Spinosa (Argan) Kernel Oil, Olea Europaea (Olive) Fruit Oil, Panthenol, Fragrance, Benzyl Alcohol, Benzoic Acid, Sorbic Acid, Citric Acid, Tetrasodium Glutamate Diacetate, Sodium Hydroxide, Blue 1</p>
</>
)
}
],
oils: [
{
name: "The Majorities Hair Oil",
imageUrl: "/amazon HO.jpg", images: ["/amazon HO.jpg", "/Amazon HO Side.jpg", "/Amazon HO back.jpg"],
desc: (
<>
<p>Transform dull, parched strands into sleek, high-gloss perfection with this ultra-lightweight botanical elixir. Just a few drops of this luxurious leave-on oil blend work to instantly seal split ends, smooth stubborn flyaways, and coat the hair cuticle in a brilliant, reflective shield.</p>
<p>Packed with deeply conditioning Soybean, Castor, Safflower, and Sunflower seed oils, it provides heavy-duty nourishment with a weightless finish, while natural Peppermint Oil delivers an invigorating, tingling scalp refresh.</p>
<p><strong>Performance:</strong> Seals, conditions, and protects without leaving a heavy, greasy buildup. Deeply conditions as an emollient while acting as an occlusive shield to lock in vital moisture.</p>
<p><strong>Sensory Profile:</strong> Refreshing, cooling, and awakening peppermint aroma backed by natural antioxidants.</p>
<p><strong>Ingredients:</strong> Glycine Soja (Soybean) Oil, Ricinus Communis (Castor) Seed Oil, Carthamus Tinctorius (Safflower) Seed Oil, Helianthus Annuus (Sunflower) Seed Oil, Mentha Piperita (Peppermint) Oil, Tocopheryl Acetate</p>
</>
)
}
],
faceScrubs: [
{
name: "The Majorities Facial Scrub",
imageUrl: "/Amazon fs.jpg", images: ["/Amazon fs.jpg", "/Amazon fs side.jpg", "/Amazon fs back.jpg"],
desc: (
<>
<p>Unveil your smoothest, most radiant complexion yet with this dual-action facial polish. This creamy, rinse-off scrub combines micro-fine Bambusa Arundinacea (Bamboo) Stem Powder to gently buff away dulling, dead skin cells, while deep-cleansing Salicylic Acid (BHA) dissolves pore-clogging impurities and targets oil buildup.</p>
<p>Cushioned with melting Jojoba Esters and soothing hydrators, it intensely purifies and refines skin texture without scratching or drying, leaving your face feeling completely renewed, clear, and soft.</p>
<p><strong>Target Concerns:</strong> Congestion, dullness, blemishes, and uneven skin texture.</p>
<p><strong>Formula Type:</strong> A conditioning, non-stripping physical and chemical exfoliant.</p>
<p><strong>Ingredients:</strong> Water, Glycerin, Stearic Acid, Cetyl Alcohol, Glyceryl Stearate, PEG-100 Stearate, Cetearyl Alcohol, Ceteareth-20, Bambusa Arundinacea Stem Powder, Polysorbate 80, Jojoba Esters, Tocopheryl Acetate, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Salicylic Acid, Fragrance, Caprylyl Glycol, Phenoxyethanol, Citric Acid, Tetrasodium Glutamate Diacetate, Blue 1</p>
</>
)
}
],
toners: [
{
name: "The Majorities Face Toner",
imageUrl: "/Amazon FT.jpg",
images: ["/Amazon FT.jpg", "/Amazon FT side.jpg", "/Amazon FT Back.jpg"],
desc: (
<>
<p>Elevate your daily skincare routine with a clean, revitalizing splash of weightless hydration. This advanced leave-on toner balances oil production, tightens the appearance of pores, and instantly calms the skin.</p>
<p>Infused with clarifying Hamamelis Virginiana (Witch Hazel) and deep-binding moisture catchers, it sweeps away residual impurities while leaving your complexion perfectly prepped, velvety smooth, and radiantly balanced.</p>
<p><strong>Skin Feel:</strong> Cool, refreshing, and instantly matte yet hydrated.</p>
<p><strong>Visual Appeal:</strong> Beautifully tinted, crystal-clear blue formula that pops on the shelf.</p>
<p><strong>Ingredients:</strong> Water, Hamamelis Virginiana (Witch Hazel) Water, SD Alcohol 40, Sodium PCA, Phenoxyethanol, Potassium Sorbate, Citric Acid, Blue 1</p>
</>
)
}
],
faceCreams: [
{
name: "The Majorities Lotion",
imageUrl: "/Lotion Front.jpg",
images: ["/Lotion Front.jpg", "/Lotion side.jpg", "/Lotion Back (3).jpg"],
desc: (
<>
<p>Wrap your skin in a comforting blanket of intense, barrier-repairing moisture. This ultra-nourishing daily body and hand lotion is formulated with a powerhouse blend of Ceramides, Hyaluronic Acid, and Vitamin E to instantly quench dehydrated skin.</p>
<p>The fast-absorbing, non-greasy formula sinks in deep to lock out environmental dryness and rebuild your skin's natural moisture barrier, leaving hands and body touchably plush, supple, and healthy-looking all day long.</p>
<p><strong>Application:</strong> A smooth, whipped leave-on lotion crafted for hands and body.</p>
<p><strong>Key Ingredients to Feature:</strong> Ceramides, Sodium Hyaluronate, Glycerin, and Vitamin E.</p>
<p><strong>Ingredients:</strong> Water, Caprylic/Capric Triglyceride, Glycerin, Cetearyl Alcohol, Propanediol, Palmitic Acid, Stearic Acid, Dimethicone, Sodium Hyaluronate, Distilled Monoglycerides, Ceteareth-20, Cetyl Esters, Cetyl Alcohol, Isocetyl Alcohol, Ceramide Np, Tocopherol, Carbomer, Fragrance, Caprylyl Glycol, Phenoxyethanol, Sodium Hydroxide, Tetrasodium Glutamate Diacetate</p>
</>
)
}
]
};

export const PRODUCT_IMAGE_BY_NAME = {
  "The Majorities Shampoo": "/Amazon S.jpg",
  "The Majorities Conditioner": "/Amazon hc.jpg",
  "The Majorities Hair Oil": "/amazon HO.jpg",
  "The Majorities Facial Scrub": "/Amazon fs.jpg",
  "The Majorities Face Toner": "/Amazon FT.jpg",
  "The Majorities Lotion": "/Lotion Front.jpg"
};

export const SOCIAL_FIELDS = [
{ key: 'instagram', label: '📷 Instagram', placeholder: 'instagram.com/yourprofile' },
{ key: 'tiktok', label: '🎵 TikTok', placeholder: 'tiktok.com/@yourprofile' },
{ key: 'snapchat', label: '👻 Snapchat', placeholder: 'snapchat.com/add/yourprofile' },
];
