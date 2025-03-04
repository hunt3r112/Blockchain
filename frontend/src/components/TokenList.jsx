import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenList = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state

  // Function to fetch tokens
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.REACT_APP_TOKEN_LIST_ENDPOINT);
      setTokens(response.data);
    } catch (error) {
      console.error('❌ Error fetching token list:', error);
    }
    setLoading(false);
  };

  // Fetch tokens on component mount
  useEffect(() => {
    fetchTokens();
  }, []); // Empty dependency array ensures it runs only once when the component is mounted

  return (
    <div>
      <h1>Token List</h1>
      
      {/* Refresh Button */}
      <button onClick={fetchTokens} disabled={loading} style={{ marginBottom: '10px' }}>
        {loading ? 'Refreshing...' : 'Refresh Token List'}
      </button>

      {tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <ul>
          {tokens.map((token) => (
            <li key={token.token_address}>
              <strong>{token.name}</strong> ({token.symbol}) - Supply: {token.total_supply}
              <p>{token.description}</p>
              <img src={token.image} alt={token.name} style={{ width: '100px' }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenList;
