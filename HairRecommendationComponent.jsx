// --- HAIR RECOMMENDATION COMPONENT (React) ---
// Add this to your App.js or create a new component: RecommendationPage.js

import React, { useState } from 'react';

const HairRecommendationForm = ({ authToken, userEmail, backendUrl }) => {
  const [hairType, setHairType] = useState('');
  const [concerns, setConcerns] = useState([]);
  const [preferredIngredients, setPreferredIngredients] = useState([]);
  const [budget, setBudget] = useState('moderate');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hairTypes = ['straight', 'wavy', 'curly', 'coily', 'unspecified'];
  const concernsList = ['frizz', 'dryness', 'oiliness', 'breakage', 'scalp health', 'color-treated', 'damage'];
  const ingredientsList = ['argan oil', 'shea butter', 'coconut oil', 'keratin', 'biotin', 'collagen', 'hyaluronic acid'];
  const budgets = ['budget', 'moderate', 'premium', 'luxury'];

  const toggleArrayValue = (value, arrayState, setArrayState) => {
    if (arrayState.includes(value)) {
      setArrayState(arrayState.filter(item => item !== value));
    } else {
      setArrayState([...arrayState, value]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!hairType) {
      setError('Please select a hair type');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/models/recommend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          hairType,
          concerns,
          preferredIngredients,
          budget
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendation(data.recommendation);
        setSuccess('✅ Recommendation generated and saved to your profile!');
        setHairType('');
        setConcerns([]);
        setPreferredIngredients([]);
        setBudget('moderate');
      } else {
        setError(data.error || 'Failed to generate recommendation');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{ marginBottom: '8px' }}>Get Your Hair Care Recommendation</h2>
      <p style={{ color: '#888', marginBottom: '24px' }}>
        Tell us about your hair, and our AI will recommend the perfect products for you.
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fff3f3',
          border: '1px solid #fcc',
          color: '#c00',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#f1f8f4',
          border: '1px solid #28a745',
          color: '#155724',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hair Type */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Hair Type *
          </label>
          <select
            value={hairType}
            onChange={(e) => setHairType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Select your hair type</option>
            {hairTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Concerns */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Hair Concerns (select all that apply)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {concernsList.map(concern => (
              <label key={concern} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={concerns.includes(concern)}
                  onChange={() => toggleArrayValue(concern, concerns, setConcerns)}
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
                {concern.charAt(0).toUpperCase() + concern.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Ingredients */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Preferred Ingredients (optional)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {ingredientsList.map(ingredient => (
              <label key={ingredient} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferredIngredients.includes(ingredient)}
                  onChange={() => toggleArrayValue(ingredient, preferredIngredients, setPreferredIngredients)}
                  style={{ marginRight: '6px', cursor: 'pointer' }}
                />
                {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Budget Range
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          >
            {budgets.map(b => (
              <option key={b} value={b}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !hairType}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading || !hairType ? 'not-allowed' : 'pointer',
            opacity: loading || !hairType ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? 'Generating Recommendation...' : 'Get My Recommendation'}
        </button>
      </form>

      {/* Recommendation Result */}
      {recommendation && (
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #eee'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#222' }}>Your Personalized Recommendation</h3>
          <pre style={{
            backgroundColor: '#fff',
            padding: '12px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '12px',
            color: '#333',
            border: '1px solid #ddd'
          }}>
            {JSON.stringify(recommendation, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
        <strong>💡 Tip:</strong> This recommendation is saved to your Majority Hair profile. Visit your profile to see your recommendation history.
      </div>
    </div>
  );
};

export default HairRecommendationForm;
