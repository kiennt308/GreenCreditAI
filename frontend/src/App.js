import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [revenue, setRevenue] = useState('');
  const [emissions, setEmissions] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('http://localhost:3001/evaluate', { revenue: parseFloat(revenue), emissions: parseFloat(emissions) });
      setResult(res.data);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>GreenCredit AI Demo</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Revenue:
          <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} required />
        </label>
        <br />
        <label>
          Emissions:
          <input type="number" value={emissions} onChange={(e) => setEmissions(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Evaluate ESG and Submit to Blockchain</button>
      </form>
      {result && (
        <div>
          <p>ESG Score: {result.esgScore}</p>
          <p>Transaction Hash: {result.txHash}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;