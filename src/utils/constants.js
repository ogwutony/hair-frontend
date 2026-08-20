// src/utils/constants.js
// Central config — imported by App.js (and eventually individual page files)

export const SHOP_DOMAIN = "c0bqfe-z2.myshopify.com";

export const DEFAULT_SELLING_PLAN_ID = "1467875506";

export const PRODUCT_VARIANT_MAP = {
"The Majorities Shampoo": {
merchandiseId: "47555331358898",h
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Conditioner": {
merchandiseId: "47555331555506",
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Hair Oil": {
merchandiseId: "47555331752114",
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Facial Scrub": {
merchandiseId: "47555331948722",
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Face Toner": {
merchandiseId: "47555332145330",
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
},
"The Majorities Lotion": {
merchandiseId: "47555332309170",
pricing: { oneTime: 7, subscription: 6 },
sellingPlanId: DEFAULT_SELLING_PLAN_ID
}
};

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hair-backend-1.onrender.com";

export const RANK_TIERS = [
{ title: "Nice and Helpful", min: 75000000 },
{ title: "Servant of the People", min: 50000000 },
{ title: "Servant of the Majorities", min: 45000000 },
{ title: "General Secretary of The Majorities", min: 40000000 },
{ title: "Premier of The Majorities", min: 35000000 },
{ title: "Chairman of the Standing Committee of the Majorities Duma", min: 30000000 },
{ title: "Chairman of the National Committee of the Majorities Political Consultative", min: 25000000 },
{ title: "Director of the General Office of the Majorities", min: 20000000 },
{ title: "Secretary of the Central Commission for Discipline Inspection", min: 15000000 },
{ title: "Politburo Member of The Majorities", min: 10000000 },
{ title: "Secretary of Majorities Committees of Provinces", min: 5000000 },
{ title: "Champion of the The Majorities", min: 4500000 },
{ title: "Hero of the Majorities", min: 4000000 },
{ title: "Order of The Majorities", min: 3500000 },
{ title: "Order of the October Revolution", min: 3000000 },
{ title: "Order of the Red Banner of Labor", min: 2500000 },
{ title: "Order of Friendship of Peoples", min: 2000000 },
{ title: "Order of the Badge of Honor", min: 1500000 },
{ title: "the Salvation of the Drowning", min: 1000000 },
{ title: "Perun", min: 900000 },
{ title: "Veles", min: 800000 },
{ title: "Svarog", min: 700000 },
{ title: "Mokosh", min: 600000 },
{ title: "Dazhbog", min: 500000 },
{ title: "Stribog", min: 400000 },
{ title: "Rod", min: 300000 },
{ title: "Yarilo", min: 200000 },
{ title: "Lada", min: 100000 },
{ title: "Morana", min: 50000 },
{ title: "Belobog", min: 25000 },
{ title: "Chernobog", min: 10000 },
{ title: "Leshiy", min: 5000 },
{ title: "Vodyanoy", min: 2500 },
{ title: "Domovoi", min: 1500 },
{ title: "Rusalka", min: 1000 },
{ title: "Rugiaevit", min: 500 },
{ title: "Schout-bij-nacht", min: 250 },
{ title: "Crow", min: 100 },
{ title: "Comrade", min: 1 },
];

// NOTE: imageUrl values below are temporary placeholders.
// Replace each one with the real path once product photos are uploaded to /public
// e.g. "/IMG_5744_1.jpg" once that file is in the public folder.
export const productsData = {
shampoos: [
{
name: "The Majorities Shampoo",
imageUrl: "/Front Shampoo.jpg",
images: ["/Front Shampoo.jpg", "/Middle shampoo.jpg", "/Back Shampoo.jpg"],
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
imageUrl: "/Conditioner Front.jpg",      images: ["/Conditioner Front.jpg", "/Conditioner Side.jpg", "/Conditioner Back.jpg"],
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
imageUrl: "/Hair oil Front.jpg",      images: ["/Hair oil Front.jpg", "/Hair oil Side.jpg", "/Hair oil Back.jpg"],
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
imageUrl: "/facial Front.jpg",      images: ["/facial Front.jpg", "/Facial Side.jpg", "/Facial Back.jpg"],
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
imageUrl: "https://themajorities.com/Face%20Tonner.jpg",
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
imageUrl: "https://themajorities.com/Lotion.jpg",
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

export const SOCIAL_FIELDS = [
{ key: 'instagram', label: '📷 Instagram', placeholder: 'instagram.com/yourprofile' },
{ key: 'tiktok', label: '🎵 TikTok', placeholder: 'tiktok.com/@yourprofile' },
{ key: 'snapchat', label: '👻 Snapchat', placeholder: 'snapchat.com/add/yourprofile' },
];
