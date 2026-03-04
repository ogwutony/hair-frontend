import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// --- MOCK DATA ---
const productsData = {
  shampoos: [
    { name: "Hydrate Shampoo", desc: "Deep moisture for daily cleansing." },
    { name: "Repair Shampoo", desc: "Strengthens damaged hair." },
    { name: "Clarify Shampoo", desc: "Removes buildup and residue." },
    { name: "Balance Shampoo", desc: "Restores scalp balance." }
  ],
  conditioners: [
    { name: "Smooth Conditioner", desc: "Softens and detangles." },
    { name: "Moisture Conditioner", desc: "Long-lasting hydration." },
    { name: "Strength Conditioner", desc: "Reinforces hair fibers." },
    { name: "Shine Conditioner", desc: "Adds natural gloss." }
  ],
  oils: [
    { name: "Growth Oil", desc: "Supports healthy growth." },
    { name: "Scalp Oil", desc: "Soothes dry scalp." },
    { name: "Light Oil", desc: "Weightless daily oil." },
    { name: "Nourish Oil", desc: "Deep nourishment." }
  ]
};

// --- AUTH COMPONENTS ---
const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log("Attempting login for:", email);
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log("Server login response:", data);

      if (response.ok) {
        onLogin(email);
        navigate("/");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server error. Is your backend running on port 5000?");
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2>Sign In</h2>
        <input 
          type="email" 
          placeholder="Email Address" 
          style={styles.input} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={styles.input} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.authButton} onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    console.log("CLICK TEST: handleSignup triggered!"); // VERIFY BUTTON CLICK
    
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      console.log("Sending signup request for:", email);
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log("Server signup response:", data);

      if (response.ok) {
        alert("Account created successfully! Please log in.");
        navigate("/login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      alert("Server error. Ensure your backend is running and CORS is enabled.");
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2>Sign Up</h2>
        <input 
          type="email" 
          placeholder="Email Address *" 
          style={styles.input} 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password *" 
          style={styles.input} 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Confirm Password *" 
          style={styles.input} 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button style={styles.authButton} onClick={handleSignup}>Create Account</button>
      </div>
    </div>
  );
};

// --- LANDING PAGE ---
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
        {productsData[category].map(item => {
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
          {focusedItem ? (<div><h3>{focusedItem.name}</h3><p style={{ fontSize: '13px', color: '#666' }}>{focusedItem.desc}</p></div>) : <p style={{color: '#888'}}>Select a product</p>}
        </div>
        <div style={styles.summaryContainer}>
          <h4 style={{ fontSize: '14px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Your Custom Set ({selectedItems.length}/6)</h4>
          <div style={{ margin: '10px 0' }}>{selectedItems.map((item, idx) => (<p key={idx} style={{ fontSize: '11px', margin: '4px 0' }}>✓ {item.name}</p>))}</div>
          {isSetComplete ? (
            <div style={{ borderTop: '2px solid #222', paddingTop: '15px' }}>
              <button style={styles.checkoutBtn}>Checkout One-Time ($19.99)</button>
              <button style={{ ...styles.checkoutBtn, background: '#222', color: '#fff', height: 'auto', padding: '12px' }}>
                <div style={{fontWeight: '700'}}>Subscribe ($15.99/mo)</div>
                <div style={{fontSize: '10px', fontWeight: '400', opacity: 0.9, marginTop: '2px'}}>
                  $191.88/ year (approximately 24% savings over one time)
                </div>
              </button>
            </div>
          ) : <p style={{ fontSize: '12px', color: '#888' }}>Select 6 products to checkout</p>}
        </div>
      </aside>
    </div>
  );
}

// --- RECOMMEND PRODUCTS PAGE ---
const RecommendPage = ({ addLegislatureItem }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", company: "", website: "", social: "", reason: "" });
  const [recImage, setRecImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    addLegislatureItem({ ...formData, id: Date.now(), type: "Recommendation", image: recImage });
    navigate("/legislature");
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Recommend Products</h2>
      <form style={styles.legislatureCard} onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h3 style={styles.formSectionTitle}>Product Information</h3>
            <input required placeholder="Product Name *" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required placeholder="Company Name *" style={styles.input} value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            <input placeholder="Website URL" style={styles.input} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
            <input placeholder="Social Media" style={styles.input} value={formData.social} onChange={e => setFormData({...formData, social: e.target.value})} />
            <textarea required placeholder="Why recommend this product? *" style={{ ...styles.input, height: '150px' }} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={styles.formSectionTitle}>Product Photo</h3>
            <div style={{ ...styles.uploadBox, minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {recImage ? (
                <img src={recImage} alt="Preview" style={{ width: '100%', borderRadius: '12px', marginBottom: '15px', maxHeight: '250px', objectFit: 'contain' }} />
              ) : <div style={{ color: '#aaa', marginBottom: '15px' }}>Upload product image</div>}
              <input type="file" accept="image/*" onChange={e => setRecImage(URL.createObjectURL(e.target.files[0]))} />
            </div>
          </div>
        </div>
        <button type="submit" style={{ ...styles.authButton, marginTop: '30px' }}>Submit Recommendation to Legislature</button>
      </form>
    </div>
  );
};

// --- PARTNER PAGE ---
const PartnerPage = ({ addLegislatureItem }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({ company: "", product: "", website: "", social: "", desc: "", ingredients: "", audience: "", drum: "", units: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    addLegislatureItem({ ...formData, id: Date.now(), type: "Partner", image });
    navigate("/legislature");
  };

  return (
    <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2>Partner with The Majority</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h3 style={styles.formSectionTitle}>Identity</h3>
            <input required placeholder="Company Name *" style={styles.input} onChange={e => setFormData({...formData, company: e.target.value})} />
            <input required placeholder="Product Name *" style={styles.input} onChange={e => setFormData({...formData, product: e.target.value})} />
            <input placeholder="Website *" style={styles.input} onChange={e => setFormData({...formData, website: e.target.value})} />
            <input placeholder="Social Media *" style={styles.input} onChange={e => setFormData({...formData, social: e.target.value})} />
            
            <h3 style={styles.formSectionTitle}>Details</h3>
            <textarea required placeholder="Full Product Description *" style={{ ...styles.input, height: '80px' }} onChange={e => setFormData({...formData, desc: e.target.value})} />
            <textarea required placeholder="Ingredients List *" style={{ ...styles.input, height: '80px' }} onChange={e => setFormData({...formData, ingredients: e.target.value})} />
            <input required placeholder="Target Audience *" style={styles.input} onChange={e => setFormData({...formData, audience: e.target.value})} />
          </div>
          <div>
            <h3 style={styles.formSectionTitle}>Wholesale Financials</h3>
            <label style={styles.tinyLabel}>Price for 5-gallon drum? *</label>
            <input required placeholder="$" style={styles.input} onChange={e => setFormData({...formData, drum: e.target.value})} />
            
            <label style={styles.tinyLabel}>Price for 100ML unit? (Recommended $2.66) *</label>
            <input required placeholder="$2.66" style={styles.input} onChange={e => setFormData({...formData, units: e.target.value})} />
            
            <h3 style={styles.formSectionTitle}>Product Photo</h3>
            <div style={styles.uploadBox}>
              <input type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
              {image && <img src={image} alt="Preview" style={{width: '100%', marginTop: '10px', borderRadius: '8px'}} />}
            </div>
          </div>
        </div>
        <button type="submit" style={{ ...styles.authButton, marginTop: '20px' }}>Submit Partner Application</button>
      </form>
    </div>
  );
};

// --- LEGISLATURE PAGE ---
const LegislaturePage = ({ items }) => (
  <div style={{ padding: '40px 60px', maxWidth: '1100px', margin: '0 auto' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>The Majority's Legislature</h2>
    {items.map(item => (
      <div key={item.id} style={styles.legislatureCard}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 150px', gap: '30px', alignItems: 'start' }}>
          <div style={{...styles.imagePlaceholder, height: '120px'}}>
            {item.image ? <img src={item.image} alt="Legislation" style={{width: '100%', borderRadius: '12px'}} /> : "No Image"}
          </div>
          <div>
            <span style={styles.typeTag}>{item.type}</span>
            <h3 style={{margin: '10px 0'}}>{item.name || item.product} <span style={{fontWeight: '400', fontSize: '14px', color: '#666'}}>by {item.company}</span></h3>
            <p style={{fontSize: '13px', color: '#555'}}>{item.reason || item.desc}</p>
            {item.ingredients && <p style={{fontSize: '11px', color: '#888', marginTop: '5px'}}><strong>Ingredients:</strong> {item.ingredients}</p>}
            {item.type === "Partner" && item.units && <p style={{fontSize: '12px', fontWeight: 'bold', marginTop: '5px'}}>Unit Price: ${item.units}</p>}
          </div>
          <div style={{textAlign: 'center', borderLeft: '1px solid #eee', paddingLeft: '20px'}}>
            <p style={styles.tinyLabel}>Community Vote</p>
            <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
              <button style={styles.voteBtn}>Yay</button>
              <button style={{...styles.voteBtn, color: 'red'}}>Nay</button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [legislatureItems, setLegislatureItems] = useState([
    { id: 1, type: "Partner", company: "EcoHair Labs", product: "Silk Serum", desc: "Organic serum for hair.", ingredients: "Water, Silk Protein, Aloe", website: "ecohair.com", social: "@ecohair", units: "2.66" }
  ]);

  const handleLoginSuccess = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const addLegislatureItem = (item) => setLegislatureItems([item, ...legislatureItems]);

  return (
    <Router>
      <div style={styles.pageWrapper}>
        <header style={styles.header}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}><div style={styles.logo}>The Majority Hair Solution</div></Link>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>Home</Link>
            {isLoggedIn ? (
              <>
                <Link to="/recommend" style={styles.navLink}>Recommend products</Link>
                <Link to="/partner" style={styles.navLink}>Partner</Link>
                <Link to="/legislature" style={styles.navLink}>The Majority's Legislature</Link>
                <Link to="/orders" style={styles.navLink}>Orders</Link>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                   <span style={{fontSize: '11px', color: '#888'}}>{userEmail}</span>
                   <span style={styles.auth} onClick={handleLogout}>Logout</span>
                </div>
              </>
            ) : (
              <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                <Link to="/signup" style={styles.auth}>Sign Up</Link>
                <Link to="/login" style={styles.auth}>Login</Link>
              </div>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/recommend" element={<RecommendPage addLegislatureItem={addLegislatureItem} />} />
          <Route path="/partner" element={<PartnerPage addLegislatureItem={addLegislatureItem} />} />
          <Route path="/legislature" element={<LegislaturePage items={legislatureItems} />} />
          <Route path="/orders" element={<div style={{padding: '60px'}}><h2>Your Orders</h2><p>No recent orders found.</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

// --- STYLES ---
const styles = {
  pageWrapper: { fontFamily: 'Inter, sans-serif', color: '#222' },
  header: { display: "flex", justifyContent: "space-between", padding: "15px 60px", borderBottom: "1px solid #eee", alignItems: 'center' },
  logo: { fontSize: "18px", fontWeight: "700" },
  nav: { display: "flex", gap: "25px", fontSize: "13px", alignItems: 'center' },
  navLink: { textDecoration: 'none', color: '#222', fontWeight: '500' },
  auth: { fontWeight: "600", textDecoration: 'none', color: '#222', cursor: 'pointer' },
  layout: { display: "flex", padding: "20px 60px" },
  left: { width: "70%", paddingRight: "40px" },
  right: { width: "30%", padding: "20px", borderRadius: "24px", backgroundColor: "#f9f9f9", height: "fit-content", position: 'sticky', top: '20px' },
  rowSection: { marginBottom: "20px" },
  rowLabel: { fontSize: "14px", color: "#666", fontWeight: "600", marginBottom: "10px" },
  scrollRow: { display: "flex", gap: "12px", overflowX: "auto", paddingBottom: '10px' },
  card: { minWidth: "140px", padding: "10px", borderRadius: "16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fff" },
  imagePlaceholder: { width: '100%', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: "12px", marginTop: "6px" },
  summaryContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '20px', border: '1px solid #eee' },
  checkoutBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #222', background: '#fff', cursor: 'pointer', marginBottom: '10px', fontWeight: '600' },
  authContainer: { display: 'flex', justifyContent: 'center', minHeight: '70vh', alignItems: 'center' },
  authCard: { width: '380px', padding: '30px', border: '1px solid #eee', borderRadius: '24px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  formSectionTitle: { fontSize: '13px', fontWeight: '800', marginTop: '20px', borderBottom: '1px solid #eee', paddingBottom: '5px', textTransform: 'uppercase' },
  tinyLabel: { fontSize: '10px', fontWeight: '700', color: '#888', marginBottom: '4px', display: 'block' },
  uploadBox: { border: '2px dashed #ddd', borderRadius: '12px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' },
  legislatureCard: { backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '30px', marginBottom: '20px' },
  typeTag: { background: '#222', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
  voteBtn: { flex: 1, padding: '8px 5px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: '#fff', fontSize: '12px' }
};