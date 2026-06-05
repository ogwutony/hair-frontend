import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";


const stripePromise = loadStripe("pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY");


// --- MOCK DATA ---
const products = {
 shampoos: [
   { name: "Hydrate Shampoo", priceId: "price_1ShampA", desc: "Deep moisture for daily cleansing." },
   { name: "Repair Shampoo", priceId: "price_1ShampB", desc: "Strengthens damaged hair." },
   { name: "Clarify Shampoo", priceId: "price_1ShampC", desc: "Removes buildup and residue." },
   { name: "Balance Shampoo", priceId: "price_1ShampD", desc: "Restores scalp balance." }
 ],
 conditioners: [
   { name: "Smooth Conditioner", priceId: "price_1CondA", desc: "Softens and detangles." },
   { name: "Moisture Conditioner", priceId: "price_1CondB", desc: "Long-lasting hydration." },
   { name: "Strength Conditioner", priceId: "price_1CondC", desc: "Reinforces hair fibers." },
   { name: "Shine Conditioner", priceId: "price_1CondD", desc: "Adds natural gloss." }
 ],
 oils: [
   { name: "Growth Oil", priceId: "price_1OilA", desc: "Supports healthy growth." },
   { name: "Scalp Oil", priceId: "price_1OilB", desc: "Soothes dry scalp." },
   { name: "Light Oil", priceId: "price_1OilC", desc: "Weightless daily oil." },
   { name: "Nourish Oil", priceId: "price_1OilD", desc: "Deep nourishment." }
 ]
};


// --- AUTH COMPONENTS ---
const LoginPage = ({ onLogin }) => {
 const navigate = useNavigate();
 const handleAuth = () => { onLogin(true); navigate("/"); };
 return (
   <div style={styles.authContainer}>
     <div style={styles.authCard}>
       <h2>Welcome Back</h2>
       <input type="email" placeholder="Email Address" style={styles.input} />
       <input type="password" placeholder="Password" style={styles.input} />
       <button style={styles.authButton} onClick={handleAuth}>Login</button>
     </div>
   </div>
 );
};


const SignupPage = ({ onLogin }) => {
 const navigate = useNavigate();
 const handleAuth = () => { onLogin(true); navigate("/"); };
 return (
   <div style={styles.authContainer}>
     <div style={styles.authCard}>
       <h2>Create Account</h2>
       <input type="email" placeholder="Email Address" style={styles.input} />
       <input type="password" placeholder="Password" style={styles.input} />
       <button style={styles.authButton} onClick={handleAuth}>Sign Up</button>
     </div>
   </div>
 );
};


// --- ORDERS & SUBSCRIPTIONS PAGE ---
const OrdersPage = () => {
 const navigate = useNavigate();
 const [activeSubs] = useState([
   { id: "SUB-882", date: "Jan 10, 2026", items: "Hydrate Shampoo, Smooth Conditioner, Growth Oil", status: "Active", price: "$15.99" }
 ]);


 const pastOrders = [
   { id: "ORD-101", date: "Dec 05, 2025", items: "Repair Shampoo, Shine Conditioner, Nourish Oil", type: "One-Time", total: "$19.99" },
   { id: "ORD-098", date: "Nov 12, 2025", items: "Clarify Shampoo, Strength Conditioner, Light Oil", type: "One-Time", total: "$19.99" }
 ];


 const handleChangeSubscription = (subId) => {
   alert(`Redirecting to update Subscription ${subId}. Choose your new 6-product mix!`);
   navigate("/");
 };


 const handleReorder = (orderId) => {
   alert(`Items from order ${orderId} added to selection.`);
   navigate("/");
 };


 return (
   <div style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
     <h2 style={{ marginBottom: '30px' }}>Your Orders & Subscriptions</h2>
    
     <section style={{ marginBottom: '50px' }}>
       <h3 style={styles.formSectionTitle}>Active Subscriptions</h3>
       {activeSubs.map(sub => (
         <div key={sub.id} style={styles.legislatureCard}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <span style={{...styles.typeTag, background: '#f0f0f0', color: '#111', marginBottom: '10px', display: 'inline-block'}}>Status: {sub.status}</span>
               <p style={{ fontWeight: '700', margin: '5px 0' }}>Subscription #{sub.id}</p>
               <p style={{ fontSize: '13px', color: '#666' }}>Renewing: Feb 10, 2026 | {sub.price}/mo</p>
               <p style={{ fontSize: '14px', marginTop: '12px' }}><strong>Current Bundle:</strong> {sub.items}</p>
             </div>
             <button
               onClick={() => handleChangeSubscription(sub.id)}
               style={{ ...styles.checkoutBtn, width: 'auto', padding: '12px 25px', background: '#222', color: '#fff', border: 'none', fontWeight: '600' }}
             >
               Change Subscription
             </button>
           </div>
         </div>
       ))}
     </section>


     <section>
       <h3 style={styles.formSectionTitle}>Past Orders</h3>
       <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
         <thead>
           <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
             <th style={{ padding: '15px 10px', fontSize: '13px', color: '#888' }}>DETAILS</th>
             <th style={{ padding: '15px 10px', fontSize: '13px', color: '#888' }}>DATE</th>
             <th style={{ padding: '15px 10px', fontSize: '13px', color: '#888' }}>TOTAL</th>
             <th style={{ padding: '15px 10px', textAlign: 'right' }}>ACTION</th>
           </tr>
         </thead>
         <tbody>
           {pastOrders.map(order => (
             <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
               <td style={{ padding: '20px 10px' }}>
                 <div style={{ fontWeight: '600', fontSize: '14px' }}>{order.id}</div>
                 <div style={{ fontSize: '12px', color: '#666' }}>{order.items}</div>
               </td>
               <td style={{ padding: '20px 10px', fontSize: '14px' }}>{order.date}</td>
               <td style={{ padding: '20px 10px', fontSize: '14px', fontWeight: '700' }}>{order.total}</td>
               <td style={{ padding: '20px 10px', textAlign: 'right' }}>
                 <button onClick={() => handleReorder(order.id)} style={{ ...styles.checkoutBtn, width: 'auto', padding: '6px 15px', fontSize: '12px' }}>Reorder</button>
               </td>
             </tr>
           ))}
         </tbody>
       </table>
     </section>
   </div>
 );
};


// --- PARTNER & RECOMMEND PAGES (EXISTING) ---
const PartnerPage = () => {
 const [image, setImage] = useState(null);
 const handleImageChange = (e) => { if (e.target.files && e.target.files[0]) setImage(URL.createObjectURL(e.target.files[0])); };
 return (
   <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
     <h2>Partner with The Majority</h2>
     <form onSubmit={(e) => { e.preventDefault(); alert("Partner Application Submitted!"); }}>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
         <div>
           <h3 style={styles.formSectionTitle}>Brand Identity</h3>
           <input required placeholder="Company Name *" style={styles.input} />
           <input required placeholder="Product Name *" style={styles.input} />
           <input required placeholder="Website URL *" style={styles.input} />
           <h3 style={styles.formSectionTitle}>Product Details</h3>
           <textarea required placeholder="Full Product Description *" style={{ ...styles.input, height: '100px', paddingTop: '10px' }} />
         </div>
         <div>
           <h3 style={styles.formSectionTitle}>Wholesale Financials</h3>
           <input required placeholder="Drum Price" style={styles.input} />
           <input required placeholder="500 Unit Cost" style={styles.input} />
           <h3 style={styles.formSectionTitle}>Product Photo</h3>
           <div style={styles.uploadBox}>
             {image ? <img src={image} alt="Preview" style={styles.imagePreview} /> : <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Upload image</div>}
             <input type="file" onChange={handleImageChange} />
           </div>
         </div>
       </div>
       <button type="submit" style={{ ...styles.authButton, marginTop: '30px' }}>Submit Partner Application</button>
     </form>
   </div>
 );
};


const RecommendPage = () => {
 const [image, setImage] = useState(null);
 const handleImageChange = (e) => { if (e.target.files && e.target.files[0]) setImage(URL.createObjectURL(e.target.files[0])); };
 return (
   <div style={{ padding: '40px 60px', maxWidth: '1000px', margin: '0 auto' }}>
     <h2>Recommend Products</h2>
     <form onSubmit={(e) => { e.preventDefault(); alert("Recommendation Submitted!"); }}>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
         <div>
           <input required placeholder="Product Name *" style={styles.input} />
           <textarea required placeholder="Why recommend this? *" style={{ ...styles.input, height: '200px' }} />
         </div>
         <div>
           <div style={styles.uploadBox}>
             {image && <img src={image} alt="Preview" style={styles.imagePreview} />}
             <input type="file" onChange={handleImageChange} />
           </div>
         </div>
       </div>
       <button type="submit" style={{...styles.authButton, marginTop: '30px'}}>Submit Recommendation</button>
     </form>
   </div>
 );
};


// --- THE MAJORITY'S LEGISLATURE ---
const LegislaturePage = () => {
 const [submissions, setSubmissions] = useState([
   { id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Protein Serum", description: "Organic serum for high-porosity hair.", votes: { yay: 12, nay: 2, abstain: 1 }, voted: false },
   { id: 2, type: "Recommendation", company: "Glow Botanicals", product: "Rosemary Stimulator", description: "Amazing for edge regrowth.", votes: { yay: 45, nay: 1, abstain: 4 }, voted: false }
 ]);
 const handleVote = (id, choice) => {
   setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, voted: true, votes: { ...sub.votes, [choice]: sub.votes[choice] + 1 } } : sub));
 };
 return (
   <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
     <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>The Majority's Legislature</h2>
     {submissions.map(sub => (
       <div key={sub.id} style={styles.legislatureCard}>
         <span style={styles.typeTag}>{sub.type}</span>
         <h3>{sub.product} <span style={{fontSize: '14px', color: '#888'}}>by {sub.company}</span></h3>
         <p>{sub.description}</p>
         <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
           {['yay', 'nay', 'abstain'].map(choice => (
             <button key={choice} disabled={sub.voted} onClick={() => handleVote(sub.id, choice)} style={styles.voteBtn}>{choice}</button>
           ))}
         </div>
       </div>
     ))}
   </div>
 );
};


// --- HOME PAGE ---
function LandingPage() {
 const [selection, setSelection] = useState({ shampoo1: null, shampoo2: null, conditioner1: null, conditioner2: null, oil1: null, oil2: null });
 const [focusedItem, setFocusedItem] = useState(null);


 const handleSelect = (slot, item) => {
   setFocusedItem(item);
   setSelection(prev => ({ ...prev, [slot]: prev[slot]?.name === item.name ? null : item }));
 };


 const selectedItems = Object.values(selection).filter(Boolean);
 const isSetComplete = selectedItems.length === 6;


 const renderRow = (label, slot, category) => (
   <div style={styles.rowSection}>
     <h3 style={styles.rowLabel}>{label}</h3>
     <div style={styles.scrollRow}>
       {products[category].map(item => {
         const isSelected = selection[slot]?.name === item.name;
         return (
           <div key={item.name} onClick={() => handleSelect(slot, item)} style={{ ...styles.card, border: isSelected ? "2px solid #222" : "1px solid #eee", opacity: isSelected ? 1 : 0.8 }}>
             <div style={styles.imagePlaceholder}>{item.name[0]}</div>
             <div style={styles.itemName}>{item.name}</div>
           </div>
         );
       })}
     </div>
   </div>
 );


 return (
   <div style={styles.layout}>
     <div style={styles.left}>
       {renderRow("Pick Shampoo 1", "shampoo1", "shampoos")}
       {renderRow("Pick Shampoo 2", "shampoo2", "shampoos")}
       {renderRow("Pick Conditioner 1", "conditioner1", "conditioners")}
       {renderRow("Pick Conditioner 2", "conditioner2", "conditioners")}
       {renderRow("Pick Oil 1", "oil1", "oils")}
       {renderRow("Pick Oil 2", "oil2", "oils")}
     </div>
     <aside style={styles.right}>
       <div style={{ minHeight: '100px', marginBottom: '15px' }}>
         {focusedItem ? (<div><h3>{focusedItem.name}</h3><p style={{ fontSize: '13px', color: '#666' }}>{focusedItem.desc}</p></div>) : <p style={styles.placeholderText}>Select a product</p>}
       </div>
       <div style={styles.summaryContainer}>
         <h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>
            Your Custom Set ({selectedItems.length}/6)
         </h4>
         <div style={{ margin: '10px 0' }}>
           {selectedItems.map((item, idx) => (<p key={idx} style={{ fontSize: '11px', margin: '4px 0' }}>✓ {item.name}</p>))}
         </div>


         {isSetComplete ? (
           <div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
               <div style={styles.optionBox}>
                   <strong>One-Time</strong><br/>
                   <span style={{fontSize: '18px', fontWeight: 'bold'}}>$19.99</span>
                   <button style={styles.checkoutBtn}>Checkout</button>
               </div>
               <div style={{ ...styles.optionBox, borderColor: '#222' }}>
                   <strong style={{fontSize: '14px'}}>Subscription</strong><br/>
                   <div style={{margin: '5px 0', fontSize: '16px', fontWeight: 'bold'}}>$15.99 / month</div>
                   <div style={{fontSize: '11px', color: '#666', marginBottom: '5px'}}>for 12 months</div>
                   <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff' }}>Checkout</button>
               </div>
           </div>
         ) : (
           <div style={{ textAlign: 'center', padding: '15px', background: '#f0f0f0', borderRadius: '12px', marginTop: '10px' }}>
               <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Select {6 - selectedItems.length} more products to unlock checkout</p>
           </div>
         )}
       </div>
     </aside>
   </div>
 );
}


// --- MAIN APP ---
export default function App() {
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 return (
   <Router>
     <div style={styles.pageWrapper}>
       <header style={styles.header}>
         <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majority Hair Solution</div></Link>
         <nav style={styles.nav}>
           <Link to="/" style={styles.navLink}>Home</Link>
           {isLoggedIn && (
             <>
               <Link to="/recommend" style={styles.navLink}>Recommend products</Link>
               <Link to="/partner" style={styles.navLink}>Partner</Link>
               <Link to="/legislature" style={styles.navLink}>The Majority's Legislature</Link>
               <Link to="/orders" style={styles.navLink}>Orders</Link>
             </>
           )}
           {!isLoggedIn ? <Link to="/login" style={styles.auth}>Login</Link> : <span style={styles.auth} onClick={() => setIsLoggedIn(false)}>Logout</span>}
         </nav>
       </header>
       <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LoginPage onLogin={setIsLoggedIn} />} />
         <Route path="/signup" element={<SignupPage onLogin={setIsLoggedIn} />} />
         <Route path="/partner" element={<PartnerPage />} />
         <Route path="/recommend" element={<RecommendPage />} />
         <Route path="/legislature" element={<LegislaturePage />} />
         <Route path="/orders" element={<OrdersPage />} />
       </Routes>
     </div>
   </Router>
 );
}


const styles = {
 pageWrapper: { fontFamily: 'Inter, sans-serif', color: '#222' },
 header: { display: "flex", justifyContent: "space-between", padding: "15px 60px", borderBottom: "1px solid #eee", alignItems: 'center' },
 logo: { fontSize: "18px", fontWeight: "700" },
 nav: { display: "flex", gap: "25px", fontSize: "14px", alignItems: 'center' },
 navLink: { textDecoration: 'none', color: '#222' },
 auth: { fontWeight: "600", textDecoration: 'none', color: '#222', cursor: 'pointer' },
 layout: { display: "flex", padding: "5px 60px" },
 left: { width: "70%", paddingRight: "40px" },
 right: { width: "30%", padding: "20px", borderRadius: "24px", backgroundColor: "#f9f9f9", height: "fit-content", position: "sticky", top: "5px" },
 rowSection: { marginBottom: "15px" },
 rowLabel: { fontSize: "14px", marginBottom: "6px", color: "#666", fontWeight: "600" },
 scrollRow: { display: "flex", gap: "12px", overflowX: "auto" },
 card: { minWidth: "140px", padding: "10px", borderRadius: "16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff" },
 imagePlaceholder: { width: '100%', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
 itemName: { fontSize: "12px", marginTop: "6px" },
 summaryContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #eee' },
 optionBox: { border: '1px solid #ddd', borderRadius: '12px', padding: '10px', marginTop: '10px', textAlign: 'center' },
 checkoutBtn: { width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #222', background: '#fff', cursor: 'pointer', marginTop: '5px' },
 authContainer: { display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center' },
 authCard: { width: '380px', padding: '30px', border: '1px solid #eee', borderRadius: '24px', textAlign: 'center' },
 input: { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '8px', border: '1px solid #ddd' },
 tinyLabel: { fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase' },
 formSectionTitle: { fontSize: '16px', fontWeight: '700', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
 authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
 uploadBox: { border: '2px dashed #ddd', borderRadius: '16px', padding: '15px', textAlign: 'center', backgroundColor: '#fafafa' },
 imagePreview: { width: '100%', borderRadius: '8px' },
 legislatureCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
 typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
 voteBtn: { padding: '8px 15px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer' }
};



