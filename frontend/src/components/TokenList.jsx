import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TokenList = () => {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    // Fetch the list of tokens from the backend
    const fetchTokens = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tokens');
        setTokens(response.data);
      } catch (error) {
        console.error('Error fetching token list:', error);
      }
    };

    fetchTokens();
  }, []);  // Empty dependency array ensures it runs only once when the component is mounted

  return (
    <div>
      <h1>Token List</h1>
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
