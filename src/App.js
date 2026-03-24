import React from 'react';
import './App.css';

// This uses the Vercel Environment Variable you just set
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://hair-backend-1.onrender.com";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Majority Hair Solutions</h1>
        <p>Connecting to: {API_BASE_URL}</p>
      </header>
    </div>
  );
}

export default App;