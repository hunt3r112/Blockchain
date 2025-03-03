import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/tokens')
      .then((response) => {
        setTokens(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tokens:', error);
      });
  }, []);

  return (
    <div>
      <h1>Tokens List</h1>
      <ul>
        {tokens.map((token) => (
          <li key={token.id}>
            {token.name} ({token.symbol}) - {token.amount} tokens
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
